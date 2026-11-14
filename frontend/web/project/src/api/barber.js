/**
 * api/barber.js
 * Frontend API calls for Barber Shop Module.
 */

import { request } from './client.js';

// ─── Dashboard ─────────────────────────────────────────────────────────────
export async function getBarberDashboard() {
  return request('/barber/dashboard');
}

// ─── Clients ───────────────────────────────────────────────────────────────
export async function getClients(search = '') {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return request(`/barber/clients${qs}`);
}

export async function getClientById(id) {
  return request(`/barber/clients/${id}`);
}

export async function createClient(data) {
  return request('/barber/clients', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateClient(id, data) {
  return request(`/barber/clients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Services ──────────────────────────────────────────────────────────────
export async function getServices() {
  return request('/barber/services');
}

// ─── Appointments ──────────────────────────────────────────────────────────
export async function getAppointments(params = {}) {
  const query = new URLSearchParams();
  if (params.date) query.append('date', params.date);
  if (params.barberId) query.append('barberId', params.barberId);
  if (params.clientId) query.append('clientId', params.clientId);
  if (params.status) query.append('status', params.status);

  const qs = query.toString();
  return request(`/barber/appointments${qs ? `?${qs}` : ''}`);
}

export async function getAppointmentById(id) {
  return request(`/barber/appointments/${id}`);
}

export async function createAppointment(data) {
  return request('/barber/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAppointmentStatus(id, status) {
  return request(`/barber/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Payments ──────────────────────────────────────────────────────────────
export async function recordPayment(data) {
  return request('/barber/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ─── Reports ───────────────────────────────────────────────────────────────
export async function getBarberReports() {
  return request('/barber/reports');
}

