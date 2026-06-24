import { Pedido } from '../../../domain/entities/Pedido'
import { PedidoRepository } from '../../../infra/database/repositories/PedidoRepository'

const pedidoRepo = new PedidoRepository()

export class CancelarPedido {
  async executar(pedidoId: string): Promise<Pedido> {
    const pedido = await pedidoRepo.findById(pedidoId)
    if (!pedido) throw new Error('Pedido não encontrado')

    // lança erro se não estiver em AGUARDANDO_ACEITE
    pedido.cancelar()
    await pedidoRepo.update(pedido)

    return pedido
  }
}
