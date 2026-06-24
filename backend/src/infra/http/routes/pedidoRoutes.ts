import { Router } from 'express'
import { PedidoController } from '../controllers/PedidoController'

const router = Router()
const controller = new PedidoController()

router.post('/', (req, res) => controller.criar(req, res))
router.get('/:id', (req, res) => controller.buscarPorId(req, res))
router.get('/:id/rota', (req, res) => controller.buscarRota(req, res))
router.patch('/:id/status', (req, res) => controller.avancarStatus(req, res))
router.patch('/:id/cancelar', (req, res) => controller.cancelar(req, res))
router.post('/:id/confirmar-entrega', (req, res) => controller.confirmarEntrega(req, res))

export default router
