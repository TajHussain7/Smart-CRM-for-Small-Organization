/**
 * api/school.js
 * Frontend API calls for School Management Module.
 */

import { request } from './client.js';

// ─── Dashboard ─────────────────────────────────────────────────────────────
export async function getSchoolDashboard() {
  return request('/school/dashboard');
}

// ─── Students ──────────────────────────────────────────────────────────────
export async function getStudents(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.grade) query.append('grade', params.grade);
  if (params.classLevel) query.append('classLevel', params.classLevel);
  if (params.section) query.append('section', params.section);
  if (params.feeStatus) query.append('feeStatus', params.feeStatus);

  const qs = query.toString();
  return request(`/school/students${qs ? `?${qs}` : ''}`);
}

export async function getStudentById(id) {
  return request(`/school/students/${id}`);
}

export async function createStudent(data) {
  return request('/school/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id, data) {
  return request(`/school/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id) {
  return request(`/school/students/${id}`, {
    method: 'DELETE',
  });
}

// ─── Teachers ──────────────────────────────────────────────────────────────
export async function getTeachers(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/school/teachers${qs}`);
}

export async function getTeacherById(id) {
  return request(`/school/teachers/${id}`);
}

export async function createTeacher(data) {
  return request('/school/teachers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTeacher(id, data) {
  return request(`/school/teachers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTeacher(id) {
  return request(`/school/teachers/${id}`, {
    method: 'DELETE',
  });
}

// ─── Schedule / Timetable ──────────────────────────────────────────────────
export async function getSchedule() {
  return request('/school/schedule');
}

export async function createScheduleEntry(data) {
  return request('/school/schedule', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Invoices & Fees ───────────────────────────────────────────────────────
export async function getInvoices(params = {}) {
  const query = new URLSearchParams();
  if (params.month) query.append('month', params.month);
  if (params.year) query.append('year', params.year);
  if (params.status) query.append('status', params.status);
  if (params.studentId) query.append('studentId', params.studentId);

  const qs = query.toString();
  return request(`/school/invoices${qs ? `?${qs}` : ''}`);
}

export async function generateInvoices(month, year) {
  return request('/school/invoices/generate', {
    method: 'POST',
    body: JSON.stringify({ month, year }),
  });
}

export async function recordPayment(data) {
  return request('/school/invoices/pay', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPayments() {
  return request('/school/invoices/payments');
}

