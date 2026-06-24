import { Request, Response } from 'express'
import { MotoristaRepository } from '../../database/repositories/MotoristaRepository'

const motoristaRepo = new MotoristaRepository()

export class MotoristaController {
  async listar(_req: Request, res: Response) {
    const motoristas = await motoristaRepo.findAll()
    res.json(motoristas)
  }

  async listarDisponiveis(_req: Request, res: Response) {
    const motoristas = await motoristaRepo.findAllDisponiveis()
    res.json(motoristas)
  }
}
