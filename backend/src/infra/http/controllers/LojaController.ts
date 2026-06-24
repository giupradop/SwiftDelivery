import { Request, Response } from 'express'
import { LojaRepository } from '../../database/repositories/LojaRepository'
import { ProdutoRepository } from '../../database/repositories/ProdutoRepository'
import { PedidoRepository } from '../../database/repositories/PedidoRepository'

const lojaRepo = new LojaRepository()
const produtoRepo = new ProdutoRepository()
const pedidoRepo = new PedidoRepository()

export class LojaController {
  async listar(_req: Request, res: Response) {
    const lojas = await lojaRepo.findAll()
    res.json(lojas)
  }

  async listarProdutos(req: Request, res: Response) {
    const produtos = await produtoRepo.findByLoja(req.params.id)
    res.json(produtos)
  }

  async listarPedidos(req: Request, res: Response) {
    const pedidos = await pedidoRepo.findByLoja(req.params.id)
    res.json(pedidos)
  }
}
