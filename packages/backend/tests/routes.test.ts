import { describe, it, expect } from 'vitest'
import authRoutes from '../src/routes/auth.routes.js'
import tasksRoutes from '../src/routes/tasks.routes.js'

describe('API Routes', () => {
	describe('Auth Routes', () => {
		it('should export auth routes', () => {
			expect(authRoutes).toBeDefined()
			expect(typeof authRoutes).toBe('function')
		})
	})

	describe('Tasks Routes', () => {
		it('should export tasks routes', () => {
			expect(tasksRoutes).toBeDefined()
			expect(typeof tasksRoutes).toBe('function')
		})
	})
})
