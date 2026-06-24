import { Request, Response } from 'express'
import { CriarPedido } from '../../../application/use-cases/pedido/CriarPedido'
import { AvancarStatusPedido } from '../../../application/use-cases/pedido/AvancarStatusPedido'
import { CancelarPedido } from '../../../application/use-cases/pedido/CancelarPedido'
import { ConfirmarEntrega } from '../../../application/use-cases/pedido/ConfirmarEntrega'
import { PedidoRepository } from '../../database/repositories/PedidoRepository'
import { LojaRepository } from '../../database/repositories/LojaRepository'
import { EnderecoRepository } from '../../database/repositories/EnderecoRepository'
import { calcularRota } from '../../services/OpenRouteService'

const pedidoRepo = new PedidoRepository()
const lojaRepo = new LojaRepository()
const enderecoRepo = new EnderecoRepository()

export class PedidoController {
  async criar(req: Request, res: Response) {
    try {
      const useCase = new CriarPedido()
      const pedido = await useCase.executar(req.body)
      res.status(201).json(pedido)
    } catch (erro) {
      res.status(400).json({ erro: (erro as Error).message })
    }
  }

  async buscarPorId(req: Request, res: Response) {
    const pedido = await pedidoRepo.findById(req.params.id)
    if (!pedido) {
      return res.status(404).json({ erro: 'Pedido não encontrado' })
    }
    res.json(pedido)
  }

  async avancarStatus(req: Request, res: Response) {
    try {
      const useCase = new AvancarStatusPedido()
      const pedido = await useCase.executar(req.params.id)
      res.json(pedido)
    } catch (erro) {
      res.status(400).json({ erro: (erro as Error).message })
    }
  }

  async cancelar(req: Request, res: Response) {
    try {
      const useCase = new CancelarPedido()
      const pedido = await useCase.executar(req.params.id)
      res.json(pedido)
    } catch (erro) {
      res.status(400).json({ erro: (erro as Error).message })
    }
  }

  async confirmarEntrega(req: Request, res: Response) {
    try {
      const useCase = new ConfirmarEntrega()
      const pedido = await useCase.executar(req.params.id)
      res.json(pedido)
    } catch (erro) {
      res.status(400).json({ erro: (erro as Error).message })
    }
  }

  async buscarRota(req: Request, res: Response) {
    try {
      const pedido = await pedidoRepo.findById(req.params.id)
      if (!pedido) {
        return res.status(404).json({ erro: 'Pedido não encontrado' })
      }

      const loja = await lojaRepo.findById(pedido.lojaId)
      const endereco = await enderecoRepo.findById(pedido.enderecoEntrega.id)
      if (!loja || !endereco) {
        return res.status(404).json({ erro: 'Loja ou endereço não encontrado' })
      }

      const rota = await calcularRota(
        { latitude: loja.latitude, longitude: loja.longitude },
        { latitude: endereco.latitude, longitude: endereco.longitude },
      )
      res.json(rota)
    } catch (erro) {
      res.status(400).json({ erro: (erro as Error).message })
    }
  }
}
