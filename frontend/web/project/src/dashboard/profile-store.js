import { useStudents, getStudent, updateStudent } from './students-store'

const details = new Map()
const empty = { birthDate: '', address: '', guardian: '', phone: '', email: '' }

export function getProfileSnapshot(id) {
  const student = getStudent(id)
  if (!student) return null
  return {
    student: {
      ...empty,
      guardian: student.guardianName || student.guardian || '',
      phone: student.guardianPhone || student.phone || '',
      email: student.guardianEmail || student.email || '',
      ...details.get(id),
      ...student,
    }
  }
}

export function useProfile(id) {
  useStudents()
  return getProfileSnapshot(id)
}

export function updateProfile(id, fields) {
  if (!getStudent(id) || !fields.name?.trim() || !fields.grade?.trim()) return false
  details.set(id, { ...details.get(id), ...fields })
  return updateStudent(id, {
    name: fields.name.trim(),
    grade: fields.grade.trim(),
    guardianName: fields.guardian || fields.guardianName,
    guardianPhone: fields.phone || fields.guardianPhone,
    guardianEmail: fields.email || fields.guardianEmail,
    address: fields.address,
  })
}
