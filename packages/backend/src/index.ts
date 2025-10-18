import express, { Request, Response } from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { initializeDatabase } from './db/init'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/auth.routes'
import tasksRoutes from './routes/tasks.routes'
import { swaggerDoc } from './swagger'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json({ limit: '5mb' }))
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(cors())

await initializeDatabase()

app.use('/api/auth', authRoutes)
app.use('/api/tasks', tasksRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

app.get('/health', (req: Request, res: Response) => {
	res.json({ status: 'ok' })
})

app.use(errorHandler)

app.listen(PORT, () => {
	console.log(`🚀 Server running on http://localhost:${PORT}`)
	console.log(`📚 API docs at http://localhost:${PORT}/api-docs`)
})
