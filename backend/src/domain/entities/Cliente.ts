import { Usuario } from './Usuario'
import { Endereco } from './Endereco'
import { Cupom } from './Cupom'
import { NivelFidelidade } from '../enums/NivelFidelidade'

export class Cliente extends Usuario {
  enderecos: Endereco[]
  pontosFidelidade: number
  nivelFidelidade: NivelFidelidade
  historicoPedidos: string[]
  cuponsAtivos: Cupom[]

  constructor(dados: {
    id: string
    nome: string
    email: string
    senhaHash: string
    telefone: string
    dataCadastro: Date
    enderecos?: Endereco[]
    pontosFidelidade?: number
    historicoPedidos?: string[]
    cuponsAtivos?: Cupom[]
  }) {
    super(dados)
    this.enderecos = dados.enderecos ?? []
    this.pontosFidelidade = dados.pontosFidelidade ?? 0
    this.nivelFidelidade = this.calcularNivelFidelidade()
    this.historicoPedidos = dados.historicoPedidos ?? []
    this.cuponsAtivos = dados.cuponsAtivos ?? []
  }

  getNivelAcesso(): string {
    return 'CLIENTE'
  }

  calcularNivelFidelidade(): NivelFidelidade {
    if (this.pontosFidelidade >= 1000) return NivelFidelidade.DIAMANTE
    if (this.pontosFidelidade >= 500) return NivelFidelidade.OURO
    if (this.pontosFidelidade >= 200) return NivelFidelidade.PRATA
    return NivelFidelidade.BRONZE
  }

  adicionarEndereco(endereco: Endereco): void {
    this.enderecos.push(endereco)
  }

  adicionarPontos(quantidade: number): void {
    this.pontosFidelidade += quantidade
    this.nivelFidelidade = this.calcularNivelFidelidade()
  }
}
