import { Router } from 'express'
import { MotoristaController } from '../controllers/MotoristaController'

const router = Router()
const controller = new MotoristaController()

// /disponiveis precisa vir antes de qualquer rota com :id para não conflitar
router.get('/disponiveis', (req, res) => controller.listarDisponiveis(req, res))
router.get('/', (req, res) => controller.listar(req, res))

export default router
