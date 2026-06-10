export class Produto {
  id: string
  lojaId: string
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  disponivel: boolean
  categoria: string

  constructor(dados: {
    id: string
    lojaId: string
    nome: string
    descricao: string
    preco: number
    imagemUrl: string
    disponivel: boolean
    categoria: string
  }) {
    this.id = dados.id
    this.lojaId = dados.lojaId
    this.nome = dados.nome
    this.descricao = dados.descricao
    this.preco = dados.preco
    this.imagemUrl = dados.imagemUrl
    this.disponivel = dados.disponivel
    this.categoria = dados.categoria
  }

  aplicarDesconto(percentual: number): number {
    return this.preco * (1 - percentual / 100)
  }
}
