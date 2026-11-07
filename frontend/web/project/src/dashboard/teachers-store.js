import { useSyncExternalStore } from 'react';
export function localDate(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function validDate(value) { const [y, m, d] = value.split('-').map(Number); const date = new Date(y, m - 1, d); return /^\d{4}-\d{2}-\d{2}$/.test(value) && y >= 1900 && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d; }
export function minutes(time) { const [h, m] = time.split(':').map(Number); return h * 60 + m; }
export function lessonStatus(lesson, now = new Date()) { const start = new Date(`${lesson.date}T${lesson.start}:00`); const end = new Date(`${lesson.date}T${lesson.end}:00`); return now >= end ? 'Completed' : now >= start ? 'Ongoing' : 'Upcoming'; }
export function weekDates(value) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() - (date.getDay() + 6) % 7); return Array.from({ length: 7 }, (_, i) => { const day = new Date(date); day.setDate(day.getDate() + i); return localDate(day); }); }
export function timeLabel(value) { const [h, m] = value.split(':').map(Number); return `${String(h % 12 || 12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; }
let state = {
    teachers: [{ id: 'T001', name: 'Daniel Carter', email: 'daniel.carter@example.com', subject: 'Mathematics' }],
    lessons: [
        { id: 'L1', teacherId: 'T001', date: localDate(), title: 'Mathematics 101', grade: '10-B', room: 'Room 4B', start: '09:00', end: '10:30' },
        { id: 'L2', teacherId: 'T001', date: localDate(), title: 'Advanced Calculus', grade: '12-A', room: 'Room 1C', start: '11:00', end: '12:30' },
        { id: 'L3', teacherId: 'T001', date: localDate(), title: 'Statistics & Logic', grade: '11-C', room: 'Lab 2', start: '14:00', end: '15:30' },
        { id: 'L4', teacherId: 'T001', date: localDate(), title: 'Homeroom Prep', grade: '10-B', room: 'Room 4B', start: '07:30', end: '08:45' },
    ],
};
let sequence = 1;
const listeners = new Set();
const subscribe = (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getTeacherSnapshot = () => state;
export function useTeachers() { return useSyncExternalStore(subscribe, getTeacherSnapshot, getTeacherSnapshot); }
export function addTeacher(input) {
    const name = input.name.trim(), email = input.email.trim().toLowerCase(), subject = input.subject.trim();
    if (!name || !subject || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        return { error: 'Enter a name, subject and valid email.' };
    if (state.teachers.some(teacher => teacher.email === email))
        return { error: 'A teacher with this email already exists.' };
    const teacher = { id: `T-${Date.now()}-${sequence++}`, name, email, subject };
    state = { ...state, teachers: [...state.teachers, teacher] };
    listeners.forEach(listener => listener());
    return { teacher };
}
export function addLesson(input) {
    if (!state.teachers.some(teacher => teacher.id === input.teacherId))
        return 'Select a teacher.';
    if (!validDate(input.date))
        return 'Enter a valid date (YYYY-MM-DD).';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.end) || input.end <= input.start)
        return 'Use HH:MM (24-hour); end time must be after start time.';
    if (![input.title, input.grade, input.room].every(value => value.trim()))
        return 'Class title, grade and room are required.';
    const sameDay = state.lessons.filter(item => item.date === input.date && input.start < item.end && input.end > item.start);
    if (sameDay.some(item => item.teacherId === input.teacherId))
        return 'This teacher already has a class during that time.';
    if (sameDay.some(item => item.room.toLowerCase() === input.room.trim().toLowerCase()))
        return 'This room is already booked during that time.';
    if (sameDay.some(item => item.grade.toLowerCase() === input.grade.trim().toLowerCase()))
        return 'This grade already has a class during that time.';
    state = { ...state, lessons: [...state.lessons, { ...input, title: input.title.trim(), grade: input.grade.trim(), room: input.room.trim(), id: `L-${Date.now()}-${sequence++}` }] };
    listeners.forEach(listener => listener());
    return null;
}
