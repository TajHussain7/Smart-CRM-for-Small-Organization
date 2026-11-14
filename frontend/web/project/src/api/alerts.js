/**
 * api/alerts.js
 * Frontend API calls for Notifications and Alerts.
 */

import { request } from './client.js';

export async function getAlerts(params = {}) {
  const query = new URLSearchParams();
  if (params.module) query.append('module', params.module);
  if (params.status) query.append('status', params.status);
  if (params.read !== undefined) query.append('read', params.read);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const qs = query.toString();
  return request(`/alerts${qs ? `?${qs}` : ''}`);
}

export async function getUnreadCount() {
  return request('/alerts/unread-count');
}

export async function markAlertRead(id) {
  return request(`/alerts/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllAlertsRead() {
  return request('/alerts/mark-all-read', {
    method: 'PATCH',
  });
}

export async function retryAlert(id) {
  return request(`/alerts/${id}/retry`, {
    method: 'POST',
  });
}

