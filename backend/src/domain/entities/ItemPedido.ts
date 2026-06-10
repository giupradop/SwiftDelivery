export class ItemPedido {
  produtoId: string
  nomeProduto: string
  precoProduto: number
  quantidade: number
  observacao: string

  constructor(dados: {
    produtoId: string
    nomeProduto: string
    precoProduto: number
    quantidade: number
    observacao: string
  }) {
    this.produtoId = dados.produtoId
    this.nomeProduto = dados.nomeProduto
    this.precoProduto = dados.precoProduto
    this.quantidade = dados.quantidade
    this.observacao = dados.observacao
  }

  calcularSubtotal(): number {
    return this.precoProduto * this.quantidade
  }
}
