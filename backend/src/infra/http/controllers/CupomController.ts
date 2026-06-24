import { Request, Response } from 'express'
import { ValidarCupom } from '../../../application/use-cases/pedido/ValidarCupom'

export class CupomController {
  async validar(req: Request, res: Response) {
    const useCase = new ValidarCupom()
    const resultado = await useCase.executar(req.params.codigo)
    res.json(resultado)
  }
}
