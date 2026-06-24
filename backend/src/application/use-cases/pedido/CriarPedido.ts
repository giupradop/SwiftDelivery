import { Pedido } from '../../../domain/entities/Pedido'
import { ItemPedido } from '../../../domain/entities/ItemPedido'
import { ClienteRepository } from '../../../infra/database/repositories/ClienteRepository'
import { LojaRepository } from '../../../infra/database/repositories/LojaRepository'
import { ProdutoRepository } from '../../../infra/database/repositories/ProdutoRepository'
import { EnderecoRepository } from '../../../infra/database/repositories/EnderecoRepository'
import { CupomRepository } from '../../../infra/database/repositories/CupomRepository'
import { PedidoRepository } from '../../../infra/database/repositories/PedidoRepository'
import { calcularRota } from '../../../infra/services/OpenRouteService'

const clienteRepo = new ClienteRepository()
const lojaRepo = new LojaRepository()
const produtoRepo = new ProdutoRepository()
const enderecoRepo = new EnderecoRepository()
const cupomRepo = new CupomRepository()
const pedidoRepo = new PedidoRepository()

interface ItemEntrada {
  produtoId: string
  quantidade: number
  observacao?: string
}

interface EntradaCriarPedido {
  clienteId: string
  lojaId: string
  itens: ItemEntrada[]
  codigoCupom?: string
  observacao?: string
}

export class CriarPedido {
  async executar(entrada: EntradaCriarPedido): Promise<Pedido> {
    // 1. Valida cliente
    const cliente = await clienteRepo.findById(entrada.clienteId)
    if (!cliente) throw new Error('Cliente não encontrado')

    // 2. Valida loja
    const loja = await lojaRepo.findById(entrada.lojaId)
    if (!loja) throw new Error('Loja não encontrada')

    // 3. Pega o endereço do cliente
    const enderecos = await enderecoRepo.findByCliente(entrada.clienteId)
    if (enderecos.length === 0) throw new Error('Cliente não possui endereço cadastrado')
    const endereco = enderecos.find(e => e.principal) ?? enderecos[0]

    // 4. Monta os itens com snapshot de nome e preço
    const itens: ItemPedido[] = []
    for (const itemEntrada of entrada.itens) {
      const produto = await produtoRepo.findById(itemEntrada.produtoId)
      if (!produto) throw new Error(`Produto ${itemEntrada.produtoId} não encontrado`)

      itens.push(new ItemPedido({
        produtoId: produto.id,
        nomeProduto: produto.nome,
        precoProduto: produto.preco,
        quantidade: itemEntrada.quantidade,
        observacao: itemEntrada.observacao ?? '',
      }))
    }

    // 5. Calcula a distância real loja -> cliente via OpenRouteService
    const rota = await calcularRota(
      { latitude: loja.latitude, longitude: loja.longitude },
      { latitude: endereco.latitude, longitude: endereco.longitude },
    )

    // 6. Calcula o frete pela distância (lança erro se > 12 km)
    const taxaEntrega = loja.calcularFrete(rota.distanciaKm)

    // 7. Cria o pedido (subtotal e total são calculados no construtor)
    const pedido = new Pedido({
      id: crypto.randomUUID(),
      clienteId: cliente.id,
      lojaId: loja.id,
      itens,
      enderecoEntrega: endereco,
      taxaEntrega,
      observacao: entrada.observacao ?? '',
    })

    // 8. Aplica o cupom, se informado
    if (entrada.codigoCupom) {
      const cupom = await cupomRepo.findByCodigo(entrada.codigoCupom)
      if (!cupom) throw new Error('Cupom não encontrado')

      pedido.aplicarCupom(cupom) // lança erro se inválido
      cupom.incrementarUso()
      await cupomRepo.update(cupom)
    }

    // 9. Salva o pedido
    await pedidoRepo.save(pedido)

    return pedido
  }
}
