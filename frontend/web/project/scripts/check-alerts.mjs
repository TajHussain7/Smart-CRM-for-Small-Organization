import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
const server=await createServer({server:{middlewareMode:true},appType:'custom'})
try {
  for(const mobile of [false,true]) {
    const root=fileURLToPath(new URL('../../../mobile/my-app/src/components/',import.meta.url))
    const alerts=await server.ssrLoadModule(mobile?`${root}alerts-store.ts`:'/src/alerts-store.js')
    const bookings=await server.ssrLoadModule(mobile?`${root}barber-bookings-store.ts`:'/src/barber/barber-bookings-store.js')
    const future=new Date();future.setDate(future.getDate()+3);const date=bookings.dateKey(future)
    const initial=alerts.getAlerts().length
    assert.match(bookings.bookAppointment('missing','haircut',date,'10:00'),/Select/)
    assert.equal(alerts.getAlerts().length,initial)
    assert.equal(bookings.bookAppointment('james','haircut',date,'10:00','Liam Vance'),'')
    assert.equal(alerts.getAlerts()[0].status,'Pending')
    assert.equal(alerts.getAlerts()[0].recipient,'James Dalton')
    assert.match(alerts.getAlerts()[0].message,/Liam Vance/)
    const invoice={studentId:'S102',studentName:'Alex Johnson',parent:'Parent Johnson',contact:'parent@example.com',amount:'250.50',due:date}
    assert.match(alerts.generateFeeInvoice({...invoice,contact:'bad'}),/valid/)
    assert.equal(alerts.generateFeeInvoice(invoice),'')
    assert.equal(alerts.getInvoices()[0].amount,'250.50')
    assert.equal(alerts.getAlerts()[0].contact,'parent@example.com')
    assert.equal(alerts.getAlerts()[0].status,'Pending')
    const count=alerts.getAlerts().length
    alerts.generateFeeInvoice(invoice)
    assert.equal(alerts.getAlerts().length,count)
    alerts.queueAlert({eventId:'trainer:test',module:'gym',type:'Appointment Reminder',recipient:'Member A',contact:'a@example.com',channel:'Email',message:'Training with Sarah Chen'})
    assert.equal(alerts.filterAlerts('Pending','Appointment Reminder','Sarah Chen','gym').length,1)
    assert.equal(alerts.filterAlerts('Pending','All Types','Liam Vance','school').length,0)
    assert.equal(alerts.filterAlerts('Pending','All Types','Liam Vance','gym').length,0)
    assert.equal(alerts.filterAlerts('Pending','All Types','Liam Vance','barber').length,1)
    assert.equal(alerts.filterAlerts('Pending','All Types','Parent Johnson','barber').length,0)
    assert.deepEqual(alerts.moduleAlertTypes('gym',['training']),['Appointment Reminder'])
    assert.deepEqual(alerts.moduleAlertTypes('barber',['clients']),[])
    alerts.markAlertRead(alerts.getAlerts()[0].id)
    assert.equal(alerts.getAlerts()[0].read,true)
    alerts.retryAlert('sample-failed')
    assert.equal(alerts.getAlerts().find(e=>e.id==='sample-failed').status,'Pending')
    assert.equal(alerts.getAlerts().filter(e=>!e.sample&&e.status==='Sent').length,0)
  }
  const {default:Alerts}=await server.ssrLoadModule('/src/dashboard/Alerts.jsx')
  const html=renderToString(React.createElement(Alerts))
  assert.match(html,/Parent Johnson/)
  assert.match(html,/PENDING/)
  assert.match(html,/Sarah Chen/)
  assert.match(html,/Liam Vance/)
  assert.doesNotMatch(html,/Membership Reminder/)
  assert.match(html,/GYM/)
  assert.match(html,/BARBER/)
  assert.match(html,/SCHOOL/)
  console.log('PASS: booking and invoice notifications, recipient identity, validation, deduplication, filters, read/retry and truthful pending delivery')
} finally {await server.close()}
