import bcrypt from 'bcrypt';
import { db, createUser, createTask } from '../config/database.js';

async function seed() {
  try {
    db.exec('DELETE FROM tasks; DELETE FROM users;');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const user1 = createUser('test1@example.com', hashedPassword, 'Test User 1');
    const user2 = createUser('test2@example.com', hashedPassword, 'Test User 2');

    if (user1) {
      createTask('Learn TypeScript', 'Complete TypeScript course', user1.id);
      createTask('Build API', 'Create REST API with Express', user1.id);
      createTask('Setup Database', 'Configure SQLite database', user1.id);
      createTask('Write Tests', 'Add unit and integration tests', user1.id);
      createTask('Deploy App', 'Deploy to production', user1.id);
    }

    if (user2) {
      createTask('Design UI', 'Create mobile app UI mockups', user2.id);
      createTask('Implement Auth', 'Add JWT authentication', user2.id);
      createTask('Setup CI/CD', 'Configure GitHub Actions', user2.id);
    }

    console.log('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
