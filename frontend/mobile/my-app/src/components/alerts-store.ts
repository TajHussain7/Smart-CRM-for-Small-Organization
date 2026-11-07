import { useSyncExternalStore } from 'react';
export type AlertModule = 'school' | 'gym' | 'barber';
export type AlertType = 'Fee Reminder' | 'Membership Reminder' | 'Appointment Reminder';
export type AlertEntry = { id:string; eventId:string; module:AlertModule; type:AlertType; recipient:string; contact:string; message:string; channel:'SMS'|'Email'|'WhatsApp'; status:'Sent'|'Pending'|'Failed'; createdAt:string; sample?:boolean; read?:boolean };
let sequence=0;
export type FeeInvoice={id:string;eventId:string;studentId:string;student:string;parent:string;contact:string;amount:string;due:string};
let invoices:FeeInvoice[]=[];
let entries:AlertEntry[] = [
  {id:'sample-fee',eventId:'sample-fee',module:'school',type:'Fee Reminder',recipient:'Parent of Sarah Jenkins',contact:'Sample recipient',message:'Tuition fees for Sarah Jenkins (Grade 4) are due tomorrow.',channel:'SMS',status:'Sent',createdAt:'2026-10-28T09:00:00',sample:true},
  {id:'sample-membership',eventId:'sample-membership',module:'gym',type:'Membership Reminder',recipient:'John Doe',contact:'Sample recipient',message:'Annual gym membership expires in 5 days. Please renew your plan.',channel:'Email',status:'Pending',createdAt:'2026-10-28T08:00:00',sample:true},
  {id:'sample-appointment',eventId:'sample-appointment',module:'barber',type:'Appointment Reminder',recipient:'Marcus',contact:'Sample recipient',message:'Haircut appointment at 4:30 PM with your selected barber.',channel:'WhatsApp',status:'Sent',createdAt:'2026-10-28T07:00:00',sample:true},
  {id:'sample-failed',eventId:'sample-failed',module:'school',type:'Fee Reminder',recipient:'Parent of Alex River',contact:'Sample recipient',message:'Fee reminder could not be delivered. Check the recipient contact before retrying.',channel:'SMS',status:'Failed',createdAt:'2026-10-27T09:00:00',sample:true},
];
const listeners=new Set<()=>void>();
const publish=()=>listeners.forEach(l=>l());
const subscribe=(l:()=>void)=>{listeners.add(l);return()=>{listeners.delete(l);};};
export const getInvoices=()=>invoices;
export const useFeeInvoices=()=>useSyncExternalStore(subscribe,getInvoices,getInvoices);
export const getAlerts=()=>entries;
export const useAlerts=()=>useSyncExternalStore(subscribe,getAlerts,getAlerts);
export function queueAlert(input:Omit<AlertEntry,'id'|'createdAt'|'status'|'sample'|'read'>) {
  if(entries.some(e=>e.eventId===input.eventId&&e.module===input.module))return;
  entries=[{...input,id:`alert-${++sequence}`,createdAt:new Date().toISOString(),status:'Pending'},...entries];publish();
}
export function markAlertRead(id:string) {entries=entries.map(e=>e.id===id?{...e,read:true}:e);publish();}
export function retryAlert(id:string) {entries=entries.map(e=>e.id===id&&e.status==='Failed'?{...e,status:'Pending',read:false}:e);publish();}
export const alertTypes:AlertType[]=['Fee Reminder','Membership Reminder','Appointment Reminder'];
export function filterAlerts(status:string,type:string,search:string,module:AlertModule='school') { const q=search.trim().toLowerCase();return entries.filter(e=>e.module===module&&e.status===status&&(type==='All Types'||e.type===type)&&`${e.message} ${e.recipient} ${e.contact}`.toLowerCase().includes(q)); }
export function generateFeeInvoice(input:{studentId:string;studentName:string;parent:string;contact:string;amount:string;due:string}) {
  if(!input.studentId||!input.parent.trim()||!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact.trim())||/^\+?[\d ()-]{7,20}$/.test(input.contact.trim())))return 'Enter a student, parent name and valid parent email or phone.';
  if(!/^\d+(\.\d{1,2})?$/.test(input.amount)||Number(input.amount)<=0)return 'Enter a positive fee amount with up to two decimal places.';
  const due=new Date(`${input.due}T12:00:00`);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.due)||Number.isNaN(due.getTime())||due.getFullYear()!==Number(input.due.slice(0,4))||due.getMonth()+1!==Number(input.due.slice(5,7))||due.getDate()!==Number(input.due.slice(8)))return 'Enter a valid due date (YYYY-MM-DD).';
  const eventId=`invoice:${input.studentId}:${input.due}:${Number(input.amount).toFixed(2)}:${input.contact.trim().toLowerCase()}`;
  if(!invoices.some(i=>i.eventId===eventId))invoices=[{id:`INV-${invoices.length+1}`,eventId,studentId:input.studentId,student:input.studentName,parent:input.parent,contact:input.contact,amount:Number(input.amount).toFixed(2),due:input.due},...invoices];
  queueAlert({eventId,module:'school',type:'Fee Reminder',recipient:input.parent.trim(),contact:input.contact.trim(),channel:input.contact.includes('@')?'Email':'SMS',message:`Fee invoice for ${input.studentName} (${input.studentId}): $${Number(input.amount).toFixed(2)}, due ${input.due}. Recipient: ${input.parent.trim()}.`});return '';
}

export function moduleAlertTypes(module:AlertModule,features:readonly string[]):AlertType[] {
  if(module==='school')return ['Fee Reminder'];
  if(module==='gym')return [...(features.includes('renewal')?['Membership Reminder' as const]:[]),...(features.includes('training')?['Appointment Reminder' as const]:[])];
  return features.includes('appointments')?['Appointment Reminder']:[];
}
