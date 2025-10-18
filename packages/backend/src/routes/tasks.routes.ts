import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import { listTasks, createNewTask, updateTaskHandler, deleteTaskHandler } from '../controllers/tasks.controller'

const router: Router = Router()

router.use(verifyToken)

router.get('/', listTasks)
router.post('/', createNewTask)
router.put('/:id', updateTaskHandler)
router.delete('/:id', deleteTaskHandler)

export default router
