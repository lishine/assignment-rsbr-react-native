import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest'

// Set test environment variables before all tests
beforeAll(async () => {
	process.env.JWT_SECRET = 'test-jwt-secret'
	process.env.JWT_EXPIRES_IN = '7d'
	process.env.NODE_ENV = 'test'
	process.env.PORT = '3001' // Use different port for tests
})

beforeEach(async () => {
	// Clean up test data before each test
	const { pool } = await import('../src/db/init')
	await pool.query('DELETE FROM tasks')
	await pool.query('DELETE FROM users')
})

afterEach(async () => {
	// Clean up test data after each test
	const { pool } = await import('../src/db/init')
	await pool.query('DELETE FROM tasks')
	await pool.query('DELETE FROM users')
})
