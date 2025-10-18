import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listTasks, createNewTask, updateTaskHandler, deleteTaskHandler } from '../src/controllers/tasks.controller'
import { getTasksByUserId, getTaskById, createTask, updateTask, deleteTask } from '../src/models/index'

// Mock the dependencies
vi.mock('../src/models/index')

const mockGetTasksByUserId = vi.mocked(getTasksByUserId)
const mockGetTaskById = vi.mocked(getTaskById)
const mockCreateTask = vi.mocked(createTask)
const mockUpdateTask = vi.mocked(updateTask)
const mockDeleteTask = vi.mocked(deleteTask)

describe('Tasks Controller', () => {
	let mockRes: any

	beforeEach(() => {
		vi.clearAllMocks()
		mockRes = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn().mockReturnThis(),
		}
	})

	describe('listTasks', () => {
		it('should return tasks for the authenticated user', async () => {
			const mockReq = {
				userId: 1,
			}

			const mockTasks = [
				{ id: 1, title: 'Task 1', description: 'Description 1' },
				{ id: 2, title: 'Task 2', description: 'Description 2' },
			]

			mockGetTasksByUserId.mockResolvedValue(mockTasks as any)

			await listTasks(mockReq as any, mockRes)

			expect(mockGetTasksByUserId).toHaveBeenCalledWith(1)
			expect(mockRes.json).toHaveBeenCalledWith({ tasks: mockTasks })
		})

		it('should handle errors when fetching tasks', async () => {
			const mockReq = {
				userId: 1,
			}

			mockGetTasksByUserId.mockRejectedValue(new Error('Database error'))

			await listTasks(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(500)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch tasks' })
		})
	})

	describe('createNewTask', () => {
		it('should create a new task', async () => {
			const mockReq = {
				userId: 1,
				body: {
					title: 'New Task',
					description: 'New Description',
					image: 'data:image/png;base64,image',
					drawing: 'drawing-data',
					image_type: 'png',
				},
			}

			const mockTask = {
				id: 1,
				title: 'New Task',
				description: 'New Description',
				user_id: 1,
				image: 'data:image/png;base64,image',
				drawing: 'drawing-data',
				image_type: 'png',
			}

			mockCreateTask.mockResolvedValue(mockTask as any)

			await createNewTask(mockReq as any, mockRes)

			expect(mockCreateTask).toHaveBeenCalledWith(
				'New Task',
				'New Description',
				1,
				'data:image/png;base64,image',
				'drawing-data',
				'png'
			)
			expect(mockRes.status).toHaveBeenCalledWith(201)
			expect(mockRes.json).toHaveBeenCalledWith({ task: mockTask })
		})

		it('should create a task with only title', async () => {
			const mockReq = {
				userId: 1,
				body: {
					title: 'Simple Task',
				},
			}

			const mockTask = {
				id: 1,
				title: 'Simple Task',
				description: null,
				user_id: 1,
				image: null,
				drawing: null,
				image_type: null,
			}

			mockCreateTask.mockResolvedValue(mockTask as any)

			await createNewTask(mockReq as any, mockRes)

			expect(mockCreateTask).toHaveBeenCalledWith('Simple Task', undefined, 1, undefined, undefined, undefined)
			expect(mockRes.status).toHaveBeenCalledWith(201)
			expect(mockRes.json).toHaveBeenCalledWith({ task: mockTask })
		})

		it('should return 400 if title is missing', async () => {
			const mockReq = {
				userId: 1,
				body: {
					description: 'Description without title',
				},
			}

			await createNewTask(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(400)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Title is required' })
		})

		it('should handle errors when creating task', async () => {
			const mockReq = {
				userId: 1,
				body: {
					title: 'New Task',
				},
			}

			mockCreateTask.mockRejectedValue(new Error('Database error'))

			await createNewTask(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(500)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to create task' })
		})
	})

	describe('updateTaskHandler', () => {
		it('should update an existing task', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '1' },
				body: {
					title: 'Updated Task',
					description: 'Updated Description',
					completed: true,
				},
			}

			const existingTask = {
				id: 1,
				title: 'Old Task',
				user_id: 1,
			}

			const updatedTask = {
				id: 1,
				title: 'Updated Task',
				description: 'Updated Description',
				completed: true,
				user_id: 1,
			}

			mockGetTaskById.mockResolvedValue(existingTask as any)
			mockUpdateTask.mockResolvedValue(updatedTask as any)

			await updateTaskHandler(mockReq as any, mockRes)

			expect(mockGetTaskById).toHaveBeenCalledWith(1, 1)
			expect(mockUpdateTask).toHaveBeenCalledWith(1, 1, {
				title: 'Updated Task',
				description: 'Updated Description',
				completed: true,
			})
			expect(mockRes.json).toHaveBeenCalledWith({ task: updatedTask })
		})

		it('should return 404 if task not found', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '999' },
				body: {
					title: 'Updated Task',
				},
			}

			mockGetTaskById.mockResolvedValue(undefined)

			await updateTaskHandler(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(404)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' })
		})

		it('should handle errors when updating task', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '1' },
				body: {
					title: 'Updated Task',
				},
			}

			const existingTask = {
				id: 1,
				title: 'Old Task',
				user_id: 1,
			}

			mockGetTaskById.mockResolvedValue(existingTask as any)
			mockUpdateTask.mockRejectedValue(new Error('Database error'))

			await updateTaskHandler(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(500)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to update task' })
		})
	})

	describe('deleteTaskHandler', () => {
		it('should delete an existing task', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '1' },
			}

			const existingTask = {
				id: 1,
				title: 'Task to delete',
				user_id: 1,
			}

			mockGetTaskById.mockResolvedValue(existingTask as any)
			mockDeleteTask.mockResolvedValue(true)

			await deleteTaskHandler(mockReq as any, mockRes)

			expect(mockGetTaskById).toHaveBeenCalledWith(1, 1)
			expect(mockDeleteTask).toHaveBeenCalledWith(1, 1)
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Task deleted' })
		})

		it('should return 404 if task not found', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '999' },
			}

			mockGetTaskById.mockResolvedValue(undefined)

			await deleteTaskHandler(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(404)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Task not found' })
		})

		it('should handle errors when deleting task', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '1' },
			}

			const existingTask = {
				id: 1,
				title: 'Task to delete',
				user_id: 1,
			}

			mockGetTaskById.mockResolvedValue(existingTask as any)
			mockDeleteTask.mockRejectedValue(new Error('Database error'))

			await deleteTaskHandler(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(500)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to delete task' })
		})

		it('should return 500 if delete operation fails', async () => {
			const mockReq = {
				userId: 1,
				params: { id: '1' },
			}

			const existingTask = {
				id: 1,
				title: 'Task to delete',
				user_id: 1,
			}

			mockGetTaskById.mockResolvedValue(existingTask as any)
			mockDeleteTask.mockResolvedValue(false)

			await deleteTaskHandler(mockReq as any, mockRes)

			expect(mockRes.status).toHaveBeenCalledWith(500)
			expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to delete task' })
		})
	})
})
