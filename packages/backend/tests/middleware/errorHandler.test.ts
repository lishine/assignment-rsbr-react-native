import { describe, it, expect, vi, beforeEach } from 'vitest'
import { errorHandler } from '../../src/middleware/errorHandler'

describe('Error Handler Middleware', () => {
	let mockReq: any
	let mockRes: any
	let mockNext: any

	beforeEach(() => {
		vi.clearAllMocks()
		mockReq = {}
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
		mockNext = vi.fn()

		// Mock console.error to avoid noise in tests
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('should handle regular errors with status 500', async () => {
		const error = new Error('Test error')

		errorHandler(error, mockReq, mockRes, mockNext)

		expect(console.error).toHaveBeenCalledWith(error)
		expect(mockRes.status).toHaveBeenCalledWith(500)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Test error',
		})
	})

	it('should handle errors with custom status', async () => {
		const customError = new Error('Custom error')
		;(customError as any).status = 400

		errorHandler(customError, mockReq, mockRes, mockNext)

		expect(console.error).toHaveBeenCalledWith(customError)
		expect(mockRes.status).toHaveBeenCalledWith(400)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Custom error',
		})
	})

	it('should include stack trace in development mode', () => {
		process.env.NODE_ENV = 'development'
		const error = new Error('Development error')

		errorHandler(error, mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(500)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Development error',
			stack: expect.any(String),
		})
	})

	it('should not include stack trace in production mode', () => {
		process.env.NODE_ENV = 'production'
		const error = new Error('Production error')

		errorHandler(error, mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(500)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Production error',
		})
		const response = mockRes.json.mock.calls[0][0]
		expect(response.stack).toBeUndefined()
	})

	it('should handle errors without message', () => {
		const error = new Error()

		errorHandler(error, mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(500)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Internal server error',
		})
	})

	it('should handle errors with null message', () => {
		const error = new Error()
		error.message = null as any

		errorHandler(error, mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(500)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Internal server error',
		})
	})

	it('should use provided status and default to 500', () => {
		const error = new Error('Test error')
		;(error as any).status = undefined

		errorHandler(error, mockReq, mockRes, mockNext)

		expect(mockRes.status).toHaveBeenCalledWith(500)
		expect(mockRes.json).toHaveBeenCalledWith({
			error: 'Test error',
		})
	})
})
