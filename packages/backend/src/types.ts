export type User = {
	id: number
	email: string
	name: string
	password: string
	created_at: string
}

export type Task = {
	id: number
	title: string
	description?: string
	completed: boolean
	user_id: number
	created_at: string
	updated_at: string
	image?: string
	drawing?: string
	image_type?: string
}

export type AuthRequest = {
	email: string
	password: string
}

export type RegisterRequest = AuthRequest & {
	name: string
}

export type AuthResponse = {
	token: string
	user: Omit<User, 'password'>
}

export type TaskRequest = {
	title: string
	description?: string
	completed?: boolean
	image?: string
	drawing?: string
	image_type?: string
}

export type ApiResponse<T> = {
	data?: T
	error?: string
	message?: string
}

export type JwtPayload = {
	userId: number
	email: string
}
