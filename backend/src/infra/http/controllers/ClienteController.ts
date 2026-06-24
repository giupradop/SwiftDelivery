import { Request, Response } from 'express'
import { ClienteRepository } from '../../database/repositories/ClienteRepository'

const clienteRepo = new ClienteRepository()

export class ClienteController {
  async listar(_req: Request, res: Response) {
    const clientes = await clienteRepo.findAll()
    res.json(clientes)
  }

  async buscarPorId(req: Request, res: Response) {
    const cliente = await clienteRepo.findById(req.params.id)
    if (!cliente) {
      return res.status(404).json({ erro: 'Cliente não encontrado' })
    }
    res.json(cliente)
  }
}
