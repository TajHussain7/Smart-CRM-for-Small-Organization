import { useSyncExternalStore } from 'react'

let students = []
const listeners = new Set()
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener) }
const getSnapshot = () => students

export function useStudents() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function setStudents(list = []) {
  students = list.map(student => ({
    id: student.studentId || student.id,
    _id: student._id,
    name: student.name,
    grade: student.grade,
    status: student.feeStatus || student.status || 'Pending',
    classLevel: student.classLevel,
    section: student.section,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    guardianEmail: student.guardianEmail,
    monthlyFee: student.monthlyFee,
    admissionDate: student.admissionDate,
    tone: 'slate',
    ...student,
  }))
  listeners.forEach(listener => listener())
}

export function addStudent(student) {
  const studentId = student.studentId || student.id
  if (students.some(item => item.id.toLowerCase() === studentId.toLowerCase())) return false
  students = [...students, { ...student, id: studentId, tone: 'slate' }]
  listeners.forEach(listener => listener())
  return true
}

export const getStudent = id => students.find(student => student.id === id || student._id === id)

export function updateStudent(id, fields) {
  if (!getStudent(id)) return false
  students = students.map(student => (student.id === id || student._id === id) ? { ...student, ...fields } : student)
  listeners.forEach(listener => listener())
  return true
}
