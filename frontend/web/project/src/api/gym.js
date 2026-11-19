/**
 * api/gym.js
 * Frontend API calls for Gym Management Module.
 */

import { request } from './client.js';

// ─── Dashboard ─────────────────────────────────────────────────────────────
export async function getGymDashboard() {
  return request('/gym/dashboard');
}

// ─── Members ───────────────────────────────────────────────────────────────
export async function getMembers(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append('search', params.search);
  if (params.plan) query.append('plan', params.plan);
  if (params.status) query.append('status', params.status);

  const qs = query.toString();
  return request(`/gym/members${qs ? `?${qs}` : ''}`);
}

export async function getMemberById(id) {
  return request(`/gym/members/${id}`);
}

export async function createMember(data) {
  return request('/gym/members', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMember(id, data) {
  return request(`/gym/members/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function renewMember(id, data) {
  return request(`/gym/members/${id}/renew`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Training Sessions ─────────────────────────────────────────────────────
export async function getSessions(params = {}) {
  const query = new URLSearchParams();
  if (params.trainerId) query.append('trainerId', params.trainerId);
  if (params.memberId) query.append('memberId', params.memberId);
  if (params.status) query.append('status', params.status);

  const qs = query.toString();
  return request(`/gym/sessions${qs ? `?${qs}` : ''}`);
}

export async function createSession(data) {
  return request('/gym/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSessionStatus(id, status) {
  return request(`/gym/sessions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ─── Reports ───────────────────────────────────────────────────────────────
export async function getGymReports() {
  return request('/gym/reports');
}

