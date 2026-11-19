import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createApi } from './http.ts';
import { catalog } from './catalog.ts';
import { actionRequest, availableActions, fieldsForEdit, payloadFor } from './records.ts';
const response=(status,data)=>new Response(JSON.stringify({success:status<400,...(status<400?{data}:{message:data})}),{status,headers:{'Content-Type':'application/json'}});
function harness(fetcher) {
  let session={accessToken:'old',refreshToken:'refresh'},expired=0;
  const api=createApi({baseUrl:'https://test.invalid/api/v1/',fetcher,getSession:async()=>session,saveSession:async next=>{session=next;},expireSession:async()=>{session=null;expired++;}});
  return {api,expired:()=>expired,session:()=>session};
}
test('concurrent expired requests share one refresh and retry with the fresh token',async()=>{
  let refreshes=0;
  const h=harness(async(url,init)=>{
    if(url.endsWith('/auth/refresh')){refreshes++;await new Promise(resolve=>setTimeout(resolve,15));return response(200,{accessToken:'new'});}
    return init.headers.Authorization==='Bearer new'?response(200,[{name:'saved'}]):response(401,'expired');
  });
  assert.deepEqual(await Promise.all([h.api.request('/students'),h.api.request('/teachers')]),[[{name:'saved'}],[{name:'saved'}]]);
  assert.equal(refreshes,1);assert.equal(h.expired(),0);
});
test('refresh failure rejects every waiting request and expires the session',async()=>{
  const h=harness(async()=>response(401,'expired'));
  const result=await Promise.allSettled([h.api.request('/students'),h.api.request('/teachers')]);
  assert.ok(result.every(r=>r.status==='rejected'));assert.equal(h.session(),null);
});
test('a second 401 cannot start an infinite refresh loop',async()=>{
  let calls=0;
  const h=harness(async url=>{calls++;return url.endsWith('/auth/refresh')?response(200,{accessToken:'new'}):response(401,'expired');});
  await assert.rejects(h.api.request('/students'),/Session expired/);assert.equal(calls,3);
});
test('network failure preserves session and mutations are never automatically retried',async()=>{
  let calls=0;
  const h=harness(async()=>{calls++;throw new Error('offline');});
  await assert.rejects(h.api.request('/barber/payments',{method:'POST',body:'{}'}),/Unable to reach/);
  assert.equal(calls,1);assert.equal(h.expired(),0);
});
test('refresh server failure preserves the session',async()=>{
  const h=harness(async url=>url.endsWith('/auth/refresh')?response(503,'Unavailable'):response(401,'expired'));
  await assert.rejects(h.api.request('/students'),/Unavailable/);assert.notEqual(h.session(),null);
});
test('login validation errors do not trigger a refresh',async()=>{
  let calls=0;const h=harness(async()=>{calls++;return response(401,'Invalid credentials');});
  await assert.rejects(h.api.request('/auth/login',{method:'POST'}),/Invalid credentials/);assert.equal(calls,1);
});
test('downloads use authentication and return the raw file',async()=>{
  const h=harness(async(_url,init)=>{assert.equal(init.headers.Authorization,'Bearer old');return new Response('CSV content');});
  assert.equal(await (await h.api.download('/reports/csv')).text(),'CSV content');
});
test('barber booking requires actual barber ID, not a display name',()=>{
  const r=catalog.find(r=>r.key==='barber-appointments');
  assert.throws(()=>payloadFor(r.fields,{clientId:'client',serviceId:'service',barberName:'Name',date:'2030-01-01',time:'10:00'}),/Barber is required/);
  const payload=payloadFor(r.fields,{clientId:'client',serviceId:'service',barberId:'staff',date:'2030-01-01',time:'10:00'});
  assert.equal(payload.barberId,'staff');assert.equal(payload.barberName,undefined);
});
test('barber payment requires an in-progress appointment and a positive amount',()=>{
  const r=catalog.find(r=>r.key==='barber-payments');
  assert.match(r.fields[0].source,/status=IN_PROGRESS/);
  assert.throws(()=>payloadFor(r.fields,{clientId:'client',amount:'100',method:'CASH'}),/appointment is required/);
  assert.throws(()=>payloadFor(r.fields,{appointmentId:'appt',amount:'0',method:'CASH'}),/valid amount/i);
  assert.deepEqual(payloadFor(r.fields,{appointmentId:'appt',amount:'100',method:'EASYPAISA'}),{appointmentId:'appt',amount:100,method:'EASYPAISA'});
});
test('gym sessions use real trainer references and serialize a local date as ISO',()=>{
  const r=catalog.find(r=>r.key==='gym-training');
  assert.equal(r.fields.find(f=>f.key==='trainerId').source,'/users');
  const payload=payloadFor(r.fields,{memberId:'m',trainerId:'u',scheduledAt:'2030-01-01T10:30'});
  assert.equal(payload.scheduledAt,new Date('2030-01-01T10:30').toISOString());
});
test('invoice payment and bulk attendance match the existing backend contract',async()=>{
  const pay=catalog.find(r=>r.key==='school-fees').rowActions[0];
  const request=await actionRequest(pay,{amount:'25',method:'CARD'},{_id:'invoice'},async()=>null);
  assert.deepEqual(JSON.parse(request.init.body),{amount:25,method:'CARD',invoiceId:'invoice'});
  const bulk=catalog.find(r=>r.key==='school-attendance').actions.find(a=>a.path.endsWith('/bulk'));
  const marked=await actionRequest(bulk,{date:'2030-01-01',studentIds:'s1,s2',status:'PRESENT'}, {},async()=>null);
  assert.deepEqual(JSON.parse(marked.init.body),{date:'2030-01-01',records:[{studentId:'s1',status:'PRESENT'},{studentId:'s2',status:'PRESENT'}]});
});
test('timetable by class uses path parameters; AI summaries load actual metrics',async()=>{
  const action=catalog.find(r=>r.key==='school-timetable').actions[0];
  const result=await actionRequest(action,{classLevel:'TEN',section:'A'},{},async()=>null);
  assert.equal(result.path,'/school/schedule/class/TEN/section/A');
  const summary=catalog.find(r=>r.key==='ai').actions[1];
  const next=await actionRequest(summary,{moduleName:'gym'},{},async path=>{assert.equal(path,'/gym/dashboard');return {totalMembers:3};});
  assert.deepEqual(JSON.parse(next.init.body),{moduleName:'gym',stats:{totalMembers:3}});
});
test('status actions respect backend transitions and immutable fields are not edited',()=>{
  const r=catalog.find(r=>r.key==='barber-appointments');
  assert.deepEqual(availableActions(r.rowActions,{status:'COMPLETED'}),[]);
  assert.deepEqual(availableActions(r.rowActions,{status:'IN_PROGRESS'}).map(a=>a.status),['CANCELLED']);
  const student=catalog.find(r=>r.key==='students');
  assert.ok(!fieldsForEdit(student.fields,student.path).some(f=>f.key==='studentId'));
});
