import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
const server=await createServer({server:{middlewareMode:true},appType:'custom'})
try {
 for(const mobile of [false,true]){
  const root=mobile?fileURLToPath(new URL('../../../mobile/my-app/src/components/',import.meta.url)):'/src/'
  const ext=mobile?'ts':'js',school=mobile?'school/':'dashboard/'
  const load=name=>server.ssrLoadModule(root+name+'.'+ext)
  const workspace=await load('workspace-store')
  workspace.saveWorkspace('Unified School',false,[],false,[])
  assert.equal(workspace.getWorkspace().gym,true);assert.equal(workspace.getWorkspace().barber,true)
  assert.deepEqual(workspace.getWorkspace().features,['training'])
  const admission=await load(school+'admission-store'),students=await load(school+'students-store'),profile=await load(school+'profile-store')
  const value={id:'NEW-1',name:'New Student',grade:'10th',guardian:'New Parent',email:'parent@example.com',phone:'+15551234567',address:'Campus Road'}
  assert.match(admission.admitStudent({...value,email:'bad'}),/email/)
  assert.equal(students.getStudent('NEW-1'),undefined)
  assert.equal(admission.admitStudent(value),'');assert.match(admission.admitStudent(value),/exists/)
  assert.equal(students.getStudent('NEW-1').grade,'10th');assert.equal(profile.getProfileSnapshot('NEW-1').student.email,value.email)
  const training=await load('training-store');const booking={id:'test-training',studentId:'NEW-1',student:value.name,trainer:'Sarah Chen',date:'2030-01-01',time:'10:00',type:'Yoga'}
  training.recordTraining(booking);training.recordTraining(booking);assert.equal(training.getTraining().length,1)
  const account=await load('account-store');assert.match(account.saveAccount({...account.getAccount(),name:''}),/required/)
  assert.equal(account.saveAccount({name:'New Admin',email:'admin@example.com',phone:'12345678',address:'Office',bio:'Administrator',photo:'data:image/png;base64,test'}),'')
  assert.equal(account.getAccount().name,'New Admin');account.clearAccount();assert.equal(account.getAccount().photo,'')
  console.log('PASS '+(mobile?'mobile':'web')+': fixed modules, admission validation/profile data, training deduplication and settings')
 }
 const {default:Workspace}=await server.ssrLoadModule('/src/dashboard/SchoolWorkspace.jsx')
 const render=route=>renderToString(React.createElement(Workspace,{route}))
 for(const route of ['#school-dashboard','#gym-dashboard','#barber-dashboard','#school-alerts','#gym-alerts','#barber-alerts','#school-reports','#gym-reports','#barber-reports','#school-admission','#school-settings','#school-fees','#gym-training','#gym-renewal']){
  const html=render(route);assert.doesNotMatch(html,/Students \/ Tasks|Membership Renewal|Feature not enabled|Gym Overview/)
  assert.match(html,/href="#school-settings"/)
 }
 assert.match(render('#school-fees'),/All classes/);assert.match(render('#gym-training'),/New Student/)
 assert.doesNotMatch(render('#gym-training'),/Marcus Thompson \(MS-/)
 assert.match(render('#gym-alerts'),/Workspace Alerts/);assert.match(render('#barber-dashboard'),/Student records/)
 console.log('PASS shared routes, sidebar destinations, class selector and student-based Gym training')
}finally{await server.close()}
