import { pool, closeDatabase } from './init.js'
import { createUser, createTask } from '../models/index.js'
import { hashPassword } from '../utils/crypto.js'

async function seed() {
	try {
		await pool.query('DELETE FROM tasks; DELETE FROM users;')

		const hashedPassword = await hashPassword('password123')

		const user1 = await createUser('test1@example.com', hashedPassword, 'Test User 1')
		const user2 = await createUser('test2@example.com', hashedPassword, 'Test User 2')

		if (user1) {
			await createTask('Learn TypeScript', 'Complete TypeScript course', user1.id)
			await createTask('Build API', 'Create REST API with Express', user1.id)
			await createTask('Setup Database', 'Configure PostgreSQL database', user1.id)
			await createTask('Write Tests', 'Add unit and integration tests', user1.id)
			await createTask('Deploy App', 'Deploy to production', user1.id)
		}

		if (user2) {
			await createTask('Design UI', 'Create mobile app UI mockups', user2.id)
			await createTask('Implement Auth', 'Add JWT authentication', user2.id)
			await createTask('Setup CI/CD', 'Configure GitHub Actions', user2.id)
		}

		console.log('✅ Database seeded successfully')
		await closeDatabase()
		process.exit(0)
	} catch (error) {
		console.error('❌ Seed failed:', error)
		await closeDatabase()
		process.exit(1)
	}
}

seed()
