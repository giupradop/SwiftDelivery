import { TipoCupom } from '../enums/TipoCupom'

export class Cupom {
  id: string
  codigo: string
  tipo: TipoCupom
  valor: number
  validade: Date
  usoMaximo: number
  usoAtual: number
  ativo: boolean

  constructor(dados: {
    id: string
    codigo: string
    tipo: TipoCupom
    valor: number
    validade: Date
    usoMaximo: number
    usoAtual: number
    ativo: boolean
  }) {
    this.id = dados.id
    this.codigo = dados.codigo
    this.tipo = dados.tipo
    this.valor = dados.valor
    this.validade = dados.validade
    this.usoMaximo = dados.usoMaximo
    this.usoAtual = dados.usoAtual
    this.ativo = dados.ativo
  }

  estaValido(): boolean {
    if (!this.ativo) return false
    if (new Date() > this.validade) return false
    if (this.usoAtual >= this.usoMaximo) return false
    return true
  }

  calcularDesconto(subtotal: number, taxaEntrega: number): number {
    if (this.tipo === TipoCupom.PERCENTUAL) {
      return subtotal * (this.valor / 100)
    }
    if (this.tipo === TipoCupom.VALOR_FIXO) {
      return Math.min(this.valor, subtotal)
    }
    if (this.tipo === TipoCupom.FRETE_GRATIS) {
      return taxaEntrega
    }
    return 0
  }

  incrementarUso(): void {
    this.usoAtual++
  }
}
