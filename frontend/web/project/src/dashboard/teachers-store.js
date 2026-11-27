import { useSyncExternalStore } from 'react';
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function validDate(value) { const [y, m, d] = value.split('-').map(Number); const date = new Date(y, m - 1, d); return /^\d{4}-\d{2}-\d{2}$/.test(value) && y >= 1900 && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d; }
export function minutes(time) { const [h, m] = time.split(':').map(Number); return h * 60 + m; }
export function lessonStatus(lesson, now = new Date(), date = lesson.date || localDate(now)) { const start = new Date(`${date}T${lesson.start}:00`); const end = new Date(`${date}T${lesson.end}:00`); return now >= end ? 'Completed' : now >= start ? 'Ongoing' : 'Upcoming'; }
export function weekDates(value) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() - (date.getDay() + 6) % 7); return Array.from({ length: 7 }, (_, i) => { const day = new Date(date); day.setDate(day.getDate() + i); return localDate(day); }); }
export function timeLabel(value) { const [h, m] = value.split(':').map(Number); return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; }
const listeners = new Set();
let state = { teachers: [], lessons: [] };
const emit = () => listeners.forEach(listener => listener());
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
export const getTeacherSnapshot = () => state;
export function useTeachers() { return useSyncExternalStore(subscribe, getTeacherSnapshot, getTeacherSnapshot); }
export function setTeachersFromAPI(records = []) { state = { ...state, teachers: records.map(record => ({ ...record, id: record._id, phone: record.phone || '' })) }; emit(); }
export function setScheduleFromAPI(records = []) {
 state = { ...state, lessons: records.map(record => ({ ...record, id: record._id, teacherId: typeof record.teacherId === 'string' ? record.teacherId : record.teacherId?._id || '', title: record.subject, grade: record.classLevel, start: record.startTime, end: record.endTime })) }; emit();
}
export function addTeacher(record) { setTeachersFromAPI([...state.teachers.filter(item => item.id !== record._id), record]); }
export function clearTeachers() { state = { teachers: [], lessons: [] }; emit(); }
