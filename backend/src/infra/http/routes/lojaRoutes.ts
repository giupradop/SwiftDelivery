import { Router } from 'express'
import { LojaController } from '../controllers/LojaController'

const router = Router()
const controller = new LojaController()

router.get('/', (req, res) => controller.listar(req, res))
router.get('/:id/produtos', (req, res) => controller.listarProdutos(req, res))
router.get('/:id/pedidos', (req, res) => controller.listarPedidos(req, res))

export default router
