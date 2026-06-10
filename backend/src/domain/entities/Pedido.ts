import { ItemPedido } from './ItemPedido'
import { Cupom } from './Cupom'
import { Endereco } from './Endereco'
import { StatusPedido } from '../enums/StatusPedido'

const PROXIMOS_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  [StatusPedido.AGUARDANDO_ACEITE]: StatusPedido.EM_PREPARO,
  [StatusPedido.EM_PREPARO]: StatusPedido.AGUARDANDO_MOTORISTA,
  [StatusPedido.AGUARDANDO_MOTORISTA]: StatusPedido.A_CAMINHO,
  [StatusPedido.A_CAMINHO]: StatusPedido.ENTREGUE,
}

export class Pedido {
  id: string
  clienteId: string
  lojaId: string
  motoristaId: string | null
  itens: ItemPedido[]
  status: StatusPedido
  enderecoEntrega: Endereco
  subtotal: number
  taxaEntrega: number
  desconto: number
  total: number
  cupomAplicado: Cupom | null
  dataCriacao: Date
  dataAtualizacao: Date
  observacao: string

  constructor(dados: {
    id: string
    clienteId: string
    lojaId: string
    itens: ItemPedido[]
    enderecoEntrega: Endereco
    taxaEntrega: number
    observacao?: string
    motoristaId?: string | null
    cupomAplicado?: Cupom | null
    status?: StatusPedido
    dataCriacao?: Date
    dataAtualizacao?: Date
  }) {
    this.id = dados.id
    this.clienteId = dados.clienteId
    this.lojaId = dados.lojaId
    this.motoristaId = dados.motoristaId ?? null
    this.itens = dados.itens
    this.status = dados.status ?? StatusPedido.AGUARDANDO_ACEITE
    this.enderecoEntrega = dados.enderecoEntrega
    this.taxaEntrega = dados.taxaEntrega
    this.observacao = dados.observacao ?? ''
    this.cupomAplicado = dados.cupomAplicado ?? null
    this.dataCriacao = dados.dataCriacao ?? new Date()
    this.dataAtualizacao = dados.dataAtualizacao ?? new Date()
    this.subtotal = this.calcularSubtotal()
    this.desconto = this.cupomAplicado
      ? this.cupomAplicado.calcularDesconto(this.subtotal, this.taxaEntrega)
      : 0
    this.total = this.calcularTotal()
  }

  calcularSubtotal(): number {
    return this.itens.reduce((acc, item) => acc + item.calcularSubtotal(), 0)
  }

  aplicarCupom(cupom: Cupom): void {
    if (!cupom.estaValido()) throw new Error('Cupom inválido')
    this.cupomAplicado = cupom
    this.desconto = cupom.calcularDesconto(this.subtotal, this.taxaEntrega)
    this.total = this.calcularTotal()
  }

  calcularTotal(): number {
    const totalBruto = this.subtotal - this.desconto + this.taxaEntrega
    return Math.max(totalBruto, 1)
  }

  avancarStatus(): void {
    const proximo = PROXIMOS_STATUS[this.status]
    if (!proximo) throw new Error(`Não é possível avançar o status '${this.status}'`)
    this.status = proximo
    this.dataAtualizacao = new Date()
  }

  cancelar(): void {
    if (this.status !== StatusPedido.AGUARDANDO_ACEITE) {
      throw new Error(`Pedido não pode ser cancelado no status '${this.status}'`)
    }
    this.status = StatusPedido.CANCELADO
    this.dataAtualizacao = new Date()
  }

  calcularPontosGerados(): number {
    if (this.status !== StatusPedido.ENTREGUE) return 0
    return Math.floor(this.total)
  }
}
