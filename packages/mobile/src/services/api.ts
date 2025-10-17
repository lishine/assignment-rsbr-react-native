import { $fetch } from 'ofetch'
import type { AuthRequest, RegisterRequest, Task, TaskRequest, AuthResponse } from '../types'
import { getToken } from '../utils/storage'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'

const api = $fetch.create({
	baseURL: API_URL,
	timeout: 10000,
	retry: 1,
	onRequestError({ error }) {
		console.error('API Request Error:', error)
	},
	onResponseError({ response }) {
		console.error('API Response Error:', response.status, response.statusText)
	},
})

async function getAuthHeader() {
	const token = await getToken()
	return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
	return api<AuthResponse>('/auth/register', {
		method: 'POST',
		body: data,
	})
}

export async function login(data: AuthRequest): Promise<AuthResponse> {
	return api<AuthResponse>('/auth/login', {
		method: 'POST',
		body: data,
	})
}

export async function getTasks(): Promise<{ tasks: Task[] }> {
	const headers = await getAuthHeader()
	return api<{ tasks: Task[] }>('/tasks', {
		headers: headers as Record<string, string>,
	})
}

export async function createTask(data: TaskRequest): Promise<{ task: Task }> {
	const headers = await getAuthHeader()
	return api<{ task: Task }>('/tasks', {
		method: 'POST',
		body: data,
		headers: headers as Record<string, string>,
	})
}

export async function updateTask(id: number, data: Partial<TaskRequest>): Promise<{ task: Task }> {
	const headers = await getAuthHeader()
	return api<{ task: Task }>(`/tasks/${id}`, {
		method: 'PUT',
		body: data,
		headers: headers as Record<string, string>,
	})
}

export async function deleteTask(id: number): Promise<void> {
	const headers = await getAuthHeader()
	return api<void>(`/tasks/${id}`, {
		method: 'DELETE',
		headers: headers as Record<string, string>,
	})
}

export async function toggleTaskCompletion(id: number, completed: boolean): Promise<{ task: Task }> {
	return updateTask(id, { completed })
}
