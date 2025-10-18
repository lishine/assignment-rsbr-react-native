import { describe, it, expect, vi, beforeEach } from 'vitest'
import { register, login } from '../src/controllers/auth.controller'
import { createUser, getUserByEmail } from '../src/models/index'
import { hashPassword, comparePassword } from '../src/utils/crypto'

// Mock the dependencies
vi.mock('../src/models/index')
vi.mock('../src/utils/crypto')

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => {
	let mockSign = vi.fn(() => 'mock-jwt-token')
	return {
		default: {
			verify: vi.fn(),
			sign: mockSign,
		},
		verify: vi.fn(),
		sign: mockSign,
	}
})

const mockCreateUser = vi.mocked(createUser)
const mockGetUserByEmail = vi.mocked(getUserByEmail)
const mockHashPassword = vi.mocked(hashPassword)
const mockComparePassword = vi.mocked(comparePassword)

describe('Auth Controller', () => {
	let mockRes: any

	beforeEach(() => {
		vi.clearAllMocks()
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	describe('register', () => {
		it('should successfully register a new user', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: 'password123',
					name: 'Test User',
				},
			}

			const mockUser = {
				id: 1,
				email: 'test@example.com',
				name: 'Test User',
				created_at: '2023-01-01T00:00:00Z',
			}

			mockGetUserByEmail.mockResolvedValue(undefined)
			mockHashPassword.mockResolvedValue('hashedPassword')
			mockCreateUser.mockResolvedValue(mockUser as any)

			await register(mockReq as any, mockRes)

			expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
			expect(mockHashPassword).toHaveBeenCalledWith('password123')
			expect(mockCreateUser).toHaveBeenCalledWith('test@example.com', 'hashedPassword', 'Test User')
			expect(mockRes.status).toHaveBeenCalledWith(201)
			expect(mockRes.json).toHaveBeenCalledWith({
				token: expect.any(String),
				user: mockUser,
			})
		})

		it('should return 400 if required fields are missing', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: 'password123',
					// missing name
				},
			}

			await register(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(400)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing required fields' })
		})

		it('should return 400 if password is too short', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: '123',
					name: 'Test User',
				},
			}

			await register(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(400)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters' })
		})

		it('should return 409 if email already exists', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: 'password123',
					name: 'Test User',
				},
			}

			const existingUser = { id: 1, email: 'test@example.com' }
			mockGetUserByEmail.mockResolvedValue(existingUser as any)

			await register(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(409)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email already in use' })
		})

		it('should return 500 if user creation fails', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: 'password123',
					name: 'Test User',
				},
			}

			mockGetUserByEmail.mockResolvedValue(undefined)
			mockHashPassword.mockResolvedValue('hashedPassword')
			mockCreateUser.mockResolvedValue(undefined)

			await register(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(500)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to create user' })
		})
	})

	describe('login', () => {
		it('should successfully login with valid credentials', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: 'password123',
				},
			}

			const mockUser = {
				id: 1,
				email: 'test@example.com',
				name: 'Test User',
				password: 'hashedPassword',
				created_at: '2023-01-01T00:00:00Z',
			}

			mockGetUserByEmail.mockResolvedValue(mockUser as any)
			mockComparePassword.mockResolvedValue(true)

			await login(mockReq as any, mockRes)

			expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com')
			expect(mockComparePassword).toHaveBeenCalledWith('password123', 'hashedPassword')
			expect(mockRes.json).toHaveBeenCalledWith({
				token: expect.any(String),
				user: {
					id: 1,
					email: 'test@example.com',
					name: 'Test User',
					created_at: '2023-01-01T00:00:00Z',
				},
			})
		})

		it('should return 400 if email or password missing', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					// missing password
				},
			}

			await login(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(400)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Email and password required' })
		})

		it('should return 401 if user not found', async () => {
			const mockReq = {
				body: {
					email: 'nonexistent@example.com',
					password: 'password123',
				},
			}

			mockGetUserByEmail.mockResolvedValue(undefined)

			await login(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(401)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
		})

		it('should return 401 if password is invalid', async () => {
			const mockReq = {
				body: {
					email: 'test@example.com',
					password: 'wrongpassword',
				},
			}

			const mockUser = {
				id: 1,
				email: 'test@example.com',
				password: 'hashedPassword',
			}

			mockGetUserByEmail.mockResolvedValue(mockUser as any)
			mockComparePassword.mockResolvedValue(false)

			await login(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(401)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid credentials' })
		})
	})
})
