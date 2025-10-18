import { pool, closeDatabase } from './init'

async function dropDatabase() {
	try {
		console.log('🗑️  Dropping database tables...')

		await pool.query('DROP TABLE IF EXISTS tasks CASCADE')
		await pool.query('DROP TABLE IF EXISTS users CASCADE')

		console.log('✅ Database tables dropped successfully')
		await closeDatabase()
		process.exit(0)
	} catch (error) {
		console.error('❌ Failed to drop database:', error)
		await closeDatabase()
		process.exit(1)
	}
}

dropDatabase()
