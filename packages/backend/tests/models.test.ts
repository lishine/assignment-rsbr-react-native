import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
	getUserByEmail,
	getUserById,
	createUser,
	getTasksByUserId,
	getTaskById,
	createTask,
	updateTask,
	deleteTask,
} from '../src/models/index'

// Mock the database pool
vi.mock('../src/db/init', () => ({
	pool: {
		query: vi.fn(),
	},
}))

describe('Database Models', () => {
	let mockPool: any

	beforeEach(async () => {
		vi.clearAllMocks()
		const { pool } = await import('../src/db/init')
		mockPool = pool
	})

	describe('User Models', () => {
		it('should get user by email', async () => {
			const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
			mockPool.query.mockResolvedValue({ rows: [mockUser] })

			const result = await getUserByEmail('test@example.com')

			expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', ['test@example.com'])
			expect(result).toEqual(mockUser)
		})

		it('should return undefined when user by email not found', async () => {
			mockPool.query.mockResolvedValue({ rows: [] })

			const result = await getUserByEmail('nonexistent@example.com')

			expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE email = $1', [
				'nonexistent@example.com',
			])
			expect(result).toBeUndefined()
		})

		it('should get user by id', async () => {
			const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
			mockPool.query.mockResolvedValue({ rows: [mockUser] })

			const result = await getUserById(1)

			expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = $1', [1])
			expect(result).toEqual(mockUser)
		})

		it('should create a new user', async () => {
			const mockUser = { id: 1, email: 'test@example.com', name: 'Test User' }
			mockPool.query.mockResolvedValue({ rows: [mockUser] })

			const result = await createUser('test@example.com', 'hashedPassword', 'Test User')

			expect(mockPool.query).toHaveBeenCalledWith(
				'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *',
				['test@example.com', 'hashedPassword', 'Test User']
			)
			expect(result).toEqual(mockUser)
		})
	})

	describe('Task Models', () => {
		it('should get tasks by user id', async () => {
			const mockTasks = [
				{ id: 1, title: 'Task 1', user_id: 1 },
				{ id: 2, title: 'Task 2', user_id: 1 },
			]
			mockPool.query.mockResolvedValue({ rows: mockTasks })

			const result = await getTasksByUserId(1)

			expect(mockPool.query).toHaveBeenCalledWith(
				'SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC',
				[1]
			)
			expect(result).toEqual(mockTasks)
		})

		it('should get task by id and user id', async () => {
			const mockTask = { id: 1, title: 'Task 1', user_id: 1 }
			mockPool.query.mockResolvedValue({ rows: [mockTask] })

			const result = await getTaskById(1, 1)

			expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [1, 1])
			expect(result).toEqual(mockTask)
		})

		it('should return undefined when task by id not found', async () => {
			mockPool.query.mockResolvedValue({ rows: [] })

			const result = await getTaskById(999, 1)

			expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [999, 1])
			expect(result).toBeUndefined()
		})

		it('should create a new task with all fields', async () => {
			const mockTask = {
				id: 1,
				title: 'New Task',
				description: 'Description',
				user_id: 1,
				image: 'image-data',
				drawing: 'drawing-data',
				image_type: 'png',
			}
			mockPool.query.mockResolvedValue({ rows: [mockTask] })

			const result = await createTask('New Task', 'Description', 1, 'image-data', 'drawing-data', 'png')

			expect(mockPool.query).toHaveBeenCalledWith(
				'INSERT INTO tasks (title, description, user_id, image, drawing, image_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
				['New Task', 'Description', 1, 'image-data', 'drawing-data', 'png']
			)
			expect(result).toEqual(mockTask)
		})

		it('should create a new task with minimal fields', async () => {
			const mockTask = {
				id: 1,
				title: 'Simple Task',
				description: null,
				user_id: 1,
				image: null,
				drawing: null,
				image_type: null,
			}
			mockPool.query.mockResolvedValue({ rows: [mockTask] })

			const result = await createTask('Simple Task', undefined, 1)

			expect(mockPool.query).toHaveBeenCalledWith(
				'INSERT INTO tasks (title, description, user_id, image, drawing, image_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
				['Simple Task', null, 1, null, null, null]
			)
			expect(result).toEqual(mockTask)
		})

		it('should update a task with all fields', async () => {
			const mockTask = {
				id: 1,
				title: 'Updated Task',
				description: 'Updated Description',
				completed: true,
				user_id: 1,
			}
			mockPool.query.mockResolvedValue({ rows: [mockTask] })

			const updates = {
				title: 'Updated Task',
				description: 'Updated Description',
				completed: true,
			}
			const result = await updateTask(1, 1, updates)

			expect(mockPool.query).toHaveBeenCalledWith(
				expect.stringContaining(
					'UPDATE tasks SET title = $1, description = $2, completed = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5 RETURNING *'
				),
				['Updated Task', 'Updated Description', true, 1, 1]
			)
			expect(result).toEqual(mockTask)
		})

		it('should update a task with partial fields', async () => {
			const mockTask = {
				id: 1,
				title: 'Updated Title',
				description: 'Old Description',
				completed: false,
				user_id: 1,
			}
			mockPool.query.mockResolvedValue({ rows: [mockTask] })

			const updates = { title: 'Updated Title' }
			const result = await updateTask(1, 1, updates)

			expect(mockPool.query).toHaveBeenCalledWith(
				expect.stringContaining(
					'UPDATE tasks SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *'
				),
				['Updated Title', 1, 1]
			)
			expect(result).toEqual(mockTask)
		})

		it('should delete a task successfully', async () => {
			mockPool.query.mockResolvedValue({ rowCount: 1 })

			const result = await deleteTask(1, 1)

			expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [1, 1])
			expect(result).toBe(true)
		})

		it('should return false when task to delete not found', async () => {
			mockPool.query.mockResolvedValue({ rowCount: 0 })

			const result = await deleteTask(999, 1)

			expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [999, 1])
			expect(result).toBe(false)
		})

		it('should handle missing rowCount in delete response', async () => {
			mockPool.query.mockResolvedValue({})

			const result = await deleteTask(1, 1)

			expect(mockPool.query).toHaveBeenCalledWith('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [1, 1])
			expect(result).toBe(false)
		})
	})
})
