import { Pedido } from '../../../domain/entities/Pedido'
import { StatusPedido } from '../../../domain/enums/StatusPedido'
import { PedidoRepository } from '../../../infra/database/repositories/PedidoRepository'
import { MotoristaRepository } from '../../../infra/database/repositories/MotoristaRepository'

const pedidoRepo = new PedidoRepository()
const motoristaRepo = new MotoristaRepository()

export class AvancarStatusPedido {
  async executar(pedidoId: string): Promise<Pedido> {
    const pedido = await pedidoRepo.findById(pedidoId)
    if (!pedido) throw new Error('Pedido não encontrado')

    // Se vai sair de AGUARDANDO_MOTORISTA para A_CAMINHO,
    // precisa atribuir um motorista disponível antes
    if (pedido.status === StatusPedido.AGUARDANDO_MOTORISTA) {
      const disponiveis = await motoristaRepo.findAllDisponiveis()
      if (disponiveis.length === 0) {
        throw new Error('Nenhum motorista disponível no momento')
      }

      // escolhe um motorista aleatório entre os disponíveis
      const indice = Math.floor(Math.random() * disponiveis.length)
      const motorista = disponiveis[indice]

      motorista.atribuirPedido(pedido.id)
      pedido.motoristaId = motorista.id
      await motoristaRepo.update(motorista)
    }

    pedido.avancarStatus()
    await pedidoRepo.update(pedido)

    return pedido
  }
}
