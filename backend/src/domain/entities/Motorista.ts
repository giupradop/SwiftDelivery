import { Usuario } from './Usuario'

export class Motorista extends Usuario {
  cnh: string
  veiculo: string
  disponivel: boolean
  pedidoAtualId: string | null

  constructor(dados: {
    id: string
    nome: string
    email: string
    senhaHash: string
    telefone: string
    dataCadastro: Date
    cnh: string
    veiculo: string
    disponivel?: boolean
    pedidoAtualId?: string | null
  }) {
    super(dados)
    this.cnh = dados.cnh
    this.veiculo = dados.veiculo
    this.disponivel = dados.disponivel ?? true
    this.pedidoAtualId = dados.pedidoAtualId ?? null
  }

  getNivelAcesso(): string {
    return 'MOTORISTA'
  }

  atribuirPedido(pedidoId: string): void {
    this.disponivel = false
    this.pedidoAtualId = pedidoId
  }

  liberarPedido(): void {
    this.disponivel = true
    this.pedidoAtualId = null
  }
}
