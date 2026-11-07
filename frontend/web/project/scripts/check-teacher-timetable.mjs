import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import React from 'react'
import { renderToString } from 'react-dom/server'
const server=await createServer({root:fileURLToPath(new URL('../',import.meta.url)),server:{middlewareMode:true},appType:'custom'})
try {
  for (const path of ['/src/dashboard/teachers-store.js',fileURLToPath(new URL('../../../mobile/my-app/src/components/school/teachers-store.ts',import.meta.url))]) {
    const store=await server.ssrLoadModule(path)
    assert.equal(store.validDate('2026-02-30'),false)
    assert.equal(store.validDate('2028-02-29'),true)
    assert.equal(store.weekDates('2026-11-01').length,7)
    const {teacher}=store.addTeacher({name:'Test Teacher',email:'test@example.com',subject:'Science'})
    assert.ok(teacher)
    assert.ok(store.addTeacher({name:'Duplicate',email:'TEST@example.com',subject:'Science'}).error)
    assert.equal(store.getTeacherSnapshot().lessons.filter(item=>item.teacherId===teacher.id).length,0)
    const lesson={teacherId:teacher.id,date:'2030-01-15',title:'Science',grade:'8-B',room:'Lab 8',start:'09:00',end:'10:00'}
    assert.equal(store.addLesson(lesson),null)
    assert.match(store.addLesson({...lesson,start:'09:30',end:'10:30'}),/teacher/)
    assert.equal(store.addLesson({...lesson,start:'10:00',end:'11:00'}),null)
    assert.match(store.addLesson({...lesson,teacherId:'T001',grade:'9-A'}),/room/)
    assert.match(store.addLesson({...lesson,teacherId:'T001',room:'Room 9'}),/grade/)
    assert.match(store.addLesson({...lesson,teacherId:'missing'}),/teacher/)
    assert.match(store.addLesson({...lesson,start:'11:00',end:'10:00'}),/end time/)
    assert.match(store.addLesson({...lesson,date:'2030-02-30'}),/date/)
    assert.equal(store.lessonStatus(lesson,new Date('2030-01-15T08:59:00')),'Upcoming')
    assert.equal(store.lessonStatus(lesson,new Date('2030-01-15T09:00:00')),'Ongoing')
    assert.equal(store.lessonStatus(lesson,new Date('2030-01-15T10:00:00')),'Completed')
    assert.equal(store.getTeacherSnapshot().lessons.filter(item=>item.teacherId===teacher.id&&item.date===lesson.date).length,2)
    console.log('PASS teacher creation, duplicate validation, per-teacher isolation, scheduling, overlaps, date/time and status:',path)
  }
  const {default:Timetable}=await server.ssrLoadModule('/src/dashboard/TeacherTimetable.jsx')
  const html=renderToString(React.createElement(Timetable,{teacherId:'T001'}))
  assert.match(html,/Daniel Carter/)
  assert.match(html,/Mathematics 101/)
  assert.match(html,/Schedule a Class/)
  const {default:Students}=await server.ssrLoadModule('/src/dashboard/Students.jsx')
  const list=renderToString(React.createElement(Students))
  assert.match(list,/Add New Student/)
  assert.match(list,/Add Teacher/)
  console.log('PASS timetable render and student/teacher actions')
} finally {await server.close()}
