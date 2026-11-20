import { addStudent, getStudent, generateStudentId } from './students-store';
import { updateProfile } from './profile-store';

export function admitStudent(input) {
    if (!input.id || !input.id.trim()) {
        input.id = generateStudentId();
    }
    const value = Object.fromEntries(Object.entries(input).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]));
    if (!value.name || !value.grade || !value.guardian)
        return 'Student name, class and guardian are required.';
    if (!value.birthDate)
        return 'Please enter date of birth.';
    if (!value.gender)
        return 'Please select a gender.';
    if (!value.bloodGroup)
        return 'Please select a blood group.';
    if (!/^[a-z0-9-]+$/i.test(value.id))
        return 'Enter a student ID using letters, numbers or hyphens.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))
        return 'Enter a valid guardian email.';
    if (value.phone.replace(/\D/g, '').length < 7)
        return 'Enter a valid guardian phone number.';
    if (!value.emergencyPhone || value.emergencyPhone.replace(/\D/g, '').length < 7)
        return 'Enter a valid emergency contact number.';
    const section = value.section || (value.gender === 'Female' ? 'Section B (Girls)' : 'Section A (Boys)');
    if (getStudent(value.id) || !addStudent({ id: value.id, name: value.name, grade: value.grade, section, gender: value.gender, status: 'Pending' }))
        return 'Student ID already exists.';
    updateProfile(value.id, { ...value, section });
    return '';
}
