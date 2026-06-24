import { Router } from 'express'
import { ClienteController } from '../controllers/ClienteController'

const router = Router()
const controller = new ClienteController()

router.get('/', (req, res) => controller.listar(req, res))
router.get('/:id/pedidos', (req, res) => controller.listarPedidos(req, res))
router.get('/:id', (req, res) => controller.buscarPorId(req, res))

export default router
