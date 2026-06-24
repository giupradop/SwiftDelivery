import { Pedido } from '../../../domain/entities/Pedido'
import { StatusPedido } from '../../../domain/enums/StatusPedido'
import { PedidoRepository } from '../../../infra/database/repositories/PedidoRepository'
import { ClienteRepository } from '../../../infra/database/repositories/ClienteRepository'
import { MotoristaRepository } from '../../../infra/database/repositories/MotoristaRepository'

const pedidoRepo = new PedidoRepository()
const clienteRepo = new ClienteRepository()
const motoristaRepo = new MotoristaRepository()

export class ConfirmarEntrega {
  async executar(pedidoId: string): Promise<Pedido> {
    const pedido = await pedidoRepo.findById(pedidoId)
    if (!pedido) throw new Error('Pedido não encontrado')

    if (pedido.status !== StatusPedido.A_CAMINHO) {
      throw new Error('Só é possível confirmar entrega de pedidos a caminho')
    }

    // avança A_CAMINHO -> ENTREGUE
    pedido.avancarStatus()

    // credita pontos no cliente (1 ponto por R$1 do total)
    const cliente = await clienteRepo.findById(pedido.clienteId)
    if (cliente) {
      cliente.adicionarPontos(pedido.calcularPontosGerados())
      await clienteRepo.update(cliente)
    }

    // libera o motorista para novas entregas
    if (pedido.motoristaId) {
      const motorista = await motoristaRepo.findById(pedido.motoristaId)
      if (motorista) {
        motorista.liberarPedido()
        await motoristaRepo.update(motorista)
      }
    }

    await pedidoRepo.update(pedido)

    return pedido
  }
}
