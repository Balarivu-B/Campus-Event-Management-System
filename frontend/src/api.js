// Centralized API client for Campus Event Management System (CEMS)
// Uses native fetch() and manages JWT tokens in localStorage

const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('cems_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('cems_token', token);
  } else {
    localStorage.removeItem('cems_token');
  }
}

export function getUser() {
  const userJson = localStorage.getItem('cems_user');
  try {
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    return null;
  }
}

export function setUser(user) {
  if (user) {
    localStorage.setItem('cems_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('cems_user');
  }
}

export function logout() {
  localStorage.removeItem('cems_token');
  localStorage.removeItem('cems_user');
}

// Universal fetch wrapper with automatic Authorization header
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { message: 'Failed to parse response from server.' };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// 1. Authentication
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (data.token && data.user) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
}

export async function register(userData) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  if (data.token && data.user) {
    setToken(data.token);
    setUser(data.user);
  }
  return data;
}

export async function getMe() {
  return request('/auth/me');
}

// 2. Events
export async function getEvents(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/events${queryString}`);
}

export async function getEvent(id) {
  return request(`/events/${id}`);
}

export async function createEvent(eventData) {
  return request('/events', {
    method: 'POST',
    body: JSON.stringify(eventData)
  });
}

export async function updateEvent(id, eventData) {
  return request(`/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(eventData)
  });
}

export async function deleteEvent(id) {
  return request(`/events/${id}`, {
    method: 'DELETE'
  });
}

export async function approveEvent(id) {
  return request(`/events/${id}/approve`, {
    method: 'PUT'
  });
}

export async function rejectEvent(id, reason) {
  return request(`/events/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason })
  });
}

export async function cancelEvent(id) {
  return request(`/events/${id}/cancel`, {
    method: 'PUT'
  });
}

// 3. Registrations
export async function registerEvent(eventId) {
  return request('/registrations', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId })
  });
}

export async function getMyRegistrations() {
  return request('/registrations/my');
}

export async function cancelRegistration(registrationId) {
  return request(`/registrations/${registrationId}`, {
    method: 'DELETE'
  });
}

export async function getEventParticipants(eventId) {
  return request(`/events/${eventId}/participants`);
}

// 4. Users (Admin)
export async function getUsers(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== '') {
      query.append(key, val);
    }
  });
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return request(`/users${queryString}`);
}

export async function getUserById(id) {
  return request(`/users/${id}`);
}

export async function updateUser(id, userData) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, {
    method: 'DELETE'
  });
}

// 5. Notifications
export async function getNotifications() {
  return request('/notifications');
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, {
    method: 'PUT'
  });
}

export async function markAllNotificationsRead() {
  return request('/notifications/read-all', {
    method: 'PUT'
  });
}

// 6. Dashboard Statistics
export async function getDashboardStats() {
  return request('/stats/dashboard');
}

// 7. Check Faculty by Institution
export async function getFacultyByInstitution(institution) {
  return request(`/auth/faculty-list?institution=${encodeURIComponent(institution)}`);
}
