import { LojaRepository } from '../../../infra/database/repositories/LojaRepository'
import { EnderecoRepository } from '../../../infra/database/repositories/EnderecoRepository'
import { calcularRota } from '../../../infra/services/OpenRouteService'

const lojaRepo = new LojaRepository()
const enderecoRepo = new EnderecoRepository()

interface ResultadoFrete {
  distanciaKm: number
  taxaEntrega: number
}

// Calcula o frete entre uma loja e o endereço de um cliente, SEM criar pedido.
// Usado pelo frontend para mostrar o frete no carrinho antes de confirmar.
export class CalcularFrete {
  async executar(lojaId: string, clienteId: string): Promise<ResultadoFrete> {
    const loja = await lojaRepo.findById(lojaId)
    if (!loja) throw new Error('Loja não encontrada')

    const enderecos = await enderecoRepo.findByCliente(clienteId)
    if (enderecos.length === 0) throw new Error('Cliente não possui endereço cadastrado')
    const endereco = enderecos.find((e) => e.principal) ?? enderecos[0]

    // a primeira chamada calcula e guarda no cache; a criação do pedido reaproveita
    const rota = await calcularRota(
      { latitude: loja.latitude, longitude: loja.longitude },
      { latitude: endereco.latitude, longitude: endereco.longitude },
    )

    const taxaEntrega = loja.calcularFrete(rota.distanciaKm)

    return { distanciaKm: rota.distanciaKm, taxaEntrega }
  }
}
