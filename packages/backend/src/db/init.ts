import { Pool } from 'pg'

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
	} finally {
		client.release()
	}
}

export async function closeDatabase() {
	await pool.end()
}

export { pool }
