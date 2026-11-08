import { queueAlert } from './alerts-store';
import { useSyncExternalStore } from 'react';
import { getBarber, services } from './barber-store';
export const barbers = ['Marcus Thorne', 'Liam Vance'];
export type Booking = { id: string; clientId: string; serviceId: string; date: string; time: string; barber?: string; status: 'Confirmed' | 'Pending' | 'In Progress' | 'Cancelled' };
export function dateKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export const timeSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
export function timeLabel(time: string) { const hour=Number(time.split(':')[0]);return `${String(hour%12 || 12).padStart(2,'0')}:${time.split(':')[1]} ${hour>=12?'PM':'AM'}`; }
export function monthDays(month: Date) { const first=new Date(month.getFullYear(),month.getMonth(),1);return Array.from({length:42},(_,i)=>new Date(first.getFullYear(),first.getMonth(),1-first.getDay()+i)); }
let bookings: Booking[] = [
  {id:'b1',clientId:'sample-0',serviceId:'fade',date:dateKey(),time:'09:00',status:'Confirmed'},
  {id:'b2',clientId:'sample-1',serviceId:'haircut',date:dateKey(),time:'11:00',status:'Pending'},
  {id:'b3',clientId:'james',serviceId:'shave',date:dateKey(),time:'12:00',status:'In Progress'},
  {id:'b4',clientId:'alex',serviceId:'beard',date:dateKey(),time:'14:00',status:'Cancelled'},
];
const listeners=new Set<()=>void>();
const subscribe=(listener:()=>void)=>{listeners.add(listener);return()=>{listeners.delete(listener);};};
export const getBookings=()=>bookings;
export const useBookings=()=>useSyncExternalStore(subscribe,getBookings,getBookings);
const minutes=(time:string)=>Number(time.slice(0,2))*60+Number(time.slice(3));
export function slotAvailable(date:string,time:string,serviceId:string,now=new Date()) {
  const duration=services.find(s=>s.id===serviceId)?.minutes;
  const start=new Date(`${date}T${time}:00`);
  if(!duration || !timeSlots.includes(time) || Number.isNaN(start.getTime()) || dateKey(start)!==date || start<=now)return false;
  return !bookings.some(b=>b.date===date && b.status!=='Cancelled' && minutes(time)<minutes(b.time)+(services.find(s=>s.id===b.serviceId)?.minutes || 60) && minutes(time)+duration>minutes(b.time));
}
export function bookAppointment(clientId:string,serviceId:string,date:string,time:string,barber=barbers[0]) {
  if(!getBarber().clients.some(c=>c.id===clientId))return 'Select a client from the list.';
  if(!slotAvailable(date,time,serviceId))return 'This time is unavailable. Select a future available slot.';
  if(!barbers.includes(barber))return 'Select a barber.';
  const id=`booking-${Date.now()}`;
  bookings=[...bookings,{id,clientId,serviceId,date,time,barber,status:'Confirmed'}];
  const client=getBarber().clients.find(c=>c.id===clientId)!;
  queueAlert({module:'barber',eventId:id,type:'Appointment Reminder',recipient:client.name,contact:client.phone,channel:'SMS',message:`${services.find(s=>s.id===serviceId)?.name} appointment for ${client.name} on ${date} at ${timeLabel(time)} with barber ${barber}.`});
  listeners.forEach(l=>l());return '';
}
export function cancelBooking(id:string) { bookings=bookings.map(b=>b.id===id?{...b,status:'Cancelled'}:b);listeners.forEach(l=>l()); }
export const report = { revenue:85000,appointments:12,trend:[270,360,300,510,420,330,540],days:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],popularity:[{name:'Fade & Beard Trim',count:42},{name:'Classic Haircut',count:28},{name:'Hot Towel Shave',count:15}],staff:[{name:'Marcus Thorne',bookings:32,cents:245000},{name:'Liam Vance',bookings:24,cents:189000}] };
export function reportRows() { return [['Barber Report','Sample data — not live accounts'],['Today revenue','850.00'],['Appointments','12'],['Average ticket','70.83'],...report.days.map((d,i)=>[`Revenue ${d}`,String(report.trend[i])]),...report.popularity.map(s=>[s.name,`${s.count} bookings`]),...report.staff.map(s=>[s.name,`${s.bookings} bookings / $${(s.cents/100).toFixed(2)}`])]; }
export function reportCsv() { return reportRows().map(row=>row.map(cell=>`"${cell.replace(/"/g,'""')}"`).join(',')).join('\r\n'); }
export function reportHtml() { return `<!doctype html><html><head><meta charset="utf-8"><title>Barber Report</title><style>body{font-family:Arial;padding:32px;color:#24344a}h1{color:#0755d7}table{width:100%;border-collapse:collapse}td{padding:12px;border-bottom:1px solid #ddd}</style></head><body><h1>Barber Reports</h1><p>Sample report · Last 7 days. Backend connection pending.</p><table>${reportRows().map(row=>`<tr>${row.map(cell=>`<td>${cell.replace(/&/g,'&amp;').replace(/</g,'&lt;')}</td>`).join('')}</tr>`).join('')}</table></body></html>`; }
