const prefix = 'CRM_STUDENT_DETAILS_V1:'
export function readStudentNotes(notes = '') {
  if (notes.startsWith(prefix)) {
    try { const value = JSON.parse(notes.slice(prefix.length)); if (value && typeof value.address === 'string') return value } catch { /* Preserve legacy notes. */ }
  }
  return { address: notes }
}
export function updateStudentAddress(notes, address) {
  return notes?.startsWith(prefix) ? prefix + JSON.stringify({ ...readStudentNotes(notes), address }) : address
}
