export const swaggerDoc = {
	openapi: '3.0.0',
	info: {
		title: 'Task Management API',
		version: '1.0.0',
		description: 'Simple CRUD API for task management',
	},
	servers: [
		{
			url: 'http://localhost:3000',
			description: 'Development server',
		},
	],
	components: {
		securitySchemes: {
			BearerAuth: {
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
		},
		schemas: {
			User: {
				type: 'object',
				properties: {
					id: { type: 'number' },
					email: { type: 'string' },
					name: { type: 'string' },
					created_at: { type: 'string' },
				},
			},
			Task: {
				type: 'object',
				properties: {
					id: { type: 'number' },
					title: { type: 'string' },
					description: { type: 'string' },
					completed: { type: 'boolean' },
					user_id: { type: 'number' },
					created_at: { type: 'string' },
					updated_at: { type: 'string' },
				},
			},
			AuthResponse: {
				type: 'object',
				properties: {
					token: { type: 'string' },
					user: { $ref: '#/components/schemas/User' },
				},
			},
		},
	},
	paths: {
		'/api/auth/register': {
			post: {
				summary: 'Register a new user',
				tags: ['Auth'],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: { type: 'string' },
									password: { type: 'string' },
									name: { type: 'string' },
								},
								required: ['email', 'password', 'name'],
							},
						},
					},
				},
				responses: {
					201: {
						description: 'User created successfully',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/AuthResponse' },
							},
						},
					},
					400: { description: 'Bad request' },
					409: { description: 'Email already in use' },
				},
			},
		},
		'/api/auth/login': {
			post: {
				summary: 'Login user',
				tags: ['Auth'],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									email: { type: 'string' },
									password: { type: 'string' },
								},
								required: ['email', 'password'],
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Login successful',
						content: {
							'application/json': {
								schema: { $ref: '#/components/schemas/AuthResponse' },
							},
						},
					},
					401: { description: 'Invalid credentials' },
				},
			},
		},
		'/api/tasks': {
			get: {
				summary: 'Get all tasks',
				tags: ['Tasks'],
				security: [{ BearerAuth: [] }],
				responses: {
					200: {
						description: 'List of tasks',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										tasks: {
											type: 'array',
											items: { $ref: '#/components/schemas/Task' },
										},
									},
								},
							},
						},
					},
					401: { description: 'Unauthorized' },
				},
			},
			post: {
				summary: 'Create a new task',
				tags: ['Tasks'],
				security: [{ BearerAuth: [] }],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									title: { type: 'string' },
									description: { type: 'string' },
								},
								required: ['title'],
							},
						},
					},
				},
				responses: {
					201: {
						description: 'Task created',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										task: { $ref: '#/components/schemas/Task' },
									},
								},
							},
						},
					},
					401: { description: 'Unauthorized' },
				},
			},
		},
		'/api/tasks/{id}': {
			put: {
				summary: 'Update a task',
				tags: ['Tasks'],
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: { type: 'number' },
					},
				],
				requestBody: {
					required: true,
					content: {
						'application/json': {
							schema: {
								type: 'object',
								properties: {
									title: { type: 'string' },
									description: { type: 'string' },
									completed: { type: 'boolean' },
								},
							},
						},
					},
				},
				responses: {
					200: {
						description: 'Task updated',
						content: {
							'application/json': {
								schema: {
									type: 'object',
									properties: {
										task: { $ref: '#/components/schemas/Task' },
									},
								},
							},
						},
					},
					401: { description: 'Unauthorized' },
					404: { description: 'Task not found' },
				},
			},
			delete: {
				summary: 'Delete a task',
				tags: ['Tasks'],
				security: [{ BearerAuth: [] }],
				parameters: [
					{
						name: 'id',
						in: 'path',
						required: true,
						schema: { type: 'number' },
					},
				],
				responses: {
					200: { description: 'Task deleted' },
					401: { description: 'Unauthorized' },
					404: { description: 'Task not found' },
				},
			},
		},
	},
}
