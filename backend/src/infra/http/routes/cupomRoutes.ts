import { Router } from 'express'
import { CupomController } from '../controllers/CupomController'

const router = Router()
const controller = new CupomController()

router.get('/:codigo', (req, res) => controller.validar(req, res))

export default router
