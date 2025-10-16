import express, { Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import tasksRoutes from './routes/tasks.routes.js';
import { swaggerDoc } from './swagger.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs at http://localhost:${PORT}/api-docs`);
});
