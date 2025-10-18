import { Pool } from 'pg'
import { createUser, createTask } from '../models/index'
import { hashPassword } from '../utils/crypto'

const pool = new Pool({
	connectionString: process.env.DATABASE_URL || 'postgresql://taskapp:taskapp_password@localhost:5432/taskapp',
})

export async function initializeDatabase() {
	const client = await pool.connect()
	try {
		await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        image TEXT,
        drawing TEXT,
        image_type VARCHAR(20),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `)
		console.log('✅ Database initialized')

		// Check if database is empty and seed if needed
		const userCount = await client.query('SELECT COUNT(*) as count FROM users')
		if (parseInt(userCount.rows[0].count) === 0) {
			console.log('🌱 Database is empty, seeding...')
			await seedDatabase()
		}
	} finally {
		client.release()
	}
}

async function seedDatabase() {
	try {
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

		console.log('✅ Database seeded automatically')
	} catch (error) {
		console.error('❌ Auto-seed failed:', error)
		throw error
	}
}

export async function closeDatabase() {
	await pool.end()
}

export { pool }
