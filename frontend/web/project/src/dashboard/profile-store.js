import { useStudents, getStudent, updateStudent } from './students-store'
// Each student's optional details are isolated by ID for this demo session.
const details = new Map()
const empty = { birthDate: '', address: '', guardian: '', phone: '', email: '' }
export function getProfileSnapshot(id) {
  const student = getStudent(id)
  return student ? { student: { ...empty, ...details.get(id), ...student } } : null
}
export function useProfile(id) { useStudents(); return getProfileSnapshot(id) }
export function updateProfile(id, fields) {
  if (!getStudent(id) || !fields.name?.trim() || !fields.grade?.trim()) return false
  details.set(id, { ...details.get(id), ...fields })
  return updateStudent(id, { name: fields.name.trim(), grade: fields.grade.trim() })
}
