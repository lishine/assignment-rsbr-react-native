import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyToken } from '../../src/middleware/auth'

// Use vi.hoisted to create the mock before vi.mock is hoisted
const { mockVerify } = vi.hoisted(() => {
	return {
		mockVerify: vi.fn(),
	}
})

// Mock jsonwebtoken before importing the module
vi.mock('jsonwebtoken', () => ({
	default: {
		verify: mockVerify,
	},
	verify: mockVerify,
}))

describe('Auth Middleware', () => {
	let mockReq: any
	let mockRes: any
	let mockNext: any

	beforeEach(() => {
		vi.clearAllMocks()
		mockReq = {
			headers: {},
			userId: undefined,
			user: undefined,
		}
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		mockNext = vi.fn()
	})

	it('should pass with valid token', () => {
		const mockDecoded = { userId: 1, email: 'test@example.com' }
		mockVerify.mockReturnValue(mockDecoded as never)
		mockReq.headers.authorization = 'Bearer valid-token'

		verifyToken(mockReq, mockRes, mockNext)

		expect(mockVerify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET)
		expect(mockReq.userId).toBe(1)
		expect(mockReq.user).toEqual(mockDecoded)
		expect(mockNext).toHaveBeenCalledWith()
	})

	it('should return 401 if no token provided', () => {
		verifyToken(mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(401)
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' })
		expect(mockNext).not.toHaveBeenCalled()
	})

	it('should return 401 if token is malformed', () => {
		mockReq.headers.authorization = 'InvalidFormat'

		verifyToken(mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(401)
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' })
		expect(mockNext).not.toHaveBeenCalled()
	})

	it('should return 401 if token is invalid', () => {
		mockVerify.mockImplementation(() => {
			throw new Error('Invalid token')
		})
		mockReq.headers.authorization = 'Bearer invalid-token'

		verifyToken(mockReq, mockRes, mockNext)

		expect(mockVerify).toHaveBeenCalledWith('invalid-token', process.env.JWT_SECRET)
		expect(mockRes.status).toHaveBeenCalledWith(401)
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' })
		expect(mockNext).not.toHaveBeenCalled()
	})

	it('should return 401 if token is expired', () => {
		mockVerify.mockImplementation(() => {
			const error = new Error('Token expired')
			error.name = 'TokenExpiredError'
			throw error
		})
		mockReq.headers.authorization = 'Bearer expired-token'

		verifyToken(mockReq, mockRes, mockNext)

		expect(mockVerify).toHaveBeenCalledWith('expired-token', process.env.JWT_SECRET)
		expect(mockRes.status).toHaveBeenCalledWith(401)
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' })
		expect(mockNext).not.toHaveBeenCalled()
	})

	it('should handle empty token string', () => {
		mockReq.headers.authorization = 'Bearer '

		verifyToken(mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(401)
		expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' })
		expect(mockNext).not.toHaveBeenCalled()
	})

	it('should set userId and user correctly', () => {
		const mockDecoded = { userId: 42, email: 'user@example.com' }
		mockVerify.mockReturnValue(mockDecoded as never)
		mockReq.headers.authorization = 'Bearer user-token'

		verifyToken(mockReq, mockRes, mockNext)

		expect(mockReq.userId).toBe(42)
		expect(mockReq.user).toEqual({ userId: 42, email: 'user@example.com' })
	})
})
