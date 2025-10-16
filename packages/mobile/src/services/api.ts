import { $fetch } from 'ofetch';
import { getToken } from '../utils/storage.js';
import { AuthRequest, RegisterRequest, Task, TaskRequest } from '../types.js';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = $fetch.create({
  baseURL: API_URL,
});

async function getAuthHeader() {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function register(data: RegisterRequest) {
  return api('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export async function login(data: AuthRequest) {
  return api('/auth/login', {
    method: 'POST',
    body: data,
  });
}

export async function getTasks() {
  const headers = await getAuthHeader();
  return api<{ tasks: Task[] }>('/tasks', {
    headers,
  });
}

export async function createTask(data: TaskRequest) {
  const headers = await getAuthHeader();
  return api('/tasks', {
    method: 'POST',
    body: data,
    headers,
  });
}

export async function updateTask(id: number, data: Partial<TaskRequest>) {
  const headers = await getAuthHeader();
  return api(`/tasks/${id}`, {
    method: 'PUT',
    body: data,
    headers,
  });
}

export async function deleteTask(id: number) {
  const headers = await getAuthHeader();
  return api(`/tasks/${id}`, {
    method: 'DELETE',
    headers,
  });
}

export async function toggleTaskCompletion(id: number, completed: boolean) {
  return updateTask(id, { completed });
}
