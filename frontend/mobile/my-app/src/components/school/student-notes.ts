export type StudentDetails = { address: string; birthDate?: string; gender?: string; bloodGroup?: string; emergencyPhone?: string };
const prefix = 'CRM_STUDENT_DETAILS_V1:';
export function readStudentNotes(notes = ''): StudentDetails {
  if (notes.startsWith(prefix)) { try { const value = JSON.parse(notes.slice(prefix.length)); if (value && typeof value.address === 'string') return value; } catch { /* Legacy notes remain readable. */ } }
  return { address: notes };
}
export function writeStudentNotes(details: StudentDetails) { return prefix + JSON.stringify(details); }
