import { Produto } from './Produto'
import { TipoLoja } from '../enums/TipoLoja'

export class Loja {
  id: string
  nome: string
  tipo: TipoLoja
  descricao: string
  imagemUrl: string
  aberta: boolean
  horarioAbertura: string
  horarioFechamento: string
  avaliacaoMedia: number
  totalAvaliacoes: number
  cardapio: Produto[]
  latitude: number
  longitude: number

  constructor(dados: {
    id: string
    nome: string
    tipo: TipoLoja
    descricao: string
    imagemUrl: string
    aberta: boolean
    horarioAbertura: string
    horarioFechamento: string
    avaliacaoMedia: number
    totalAvaliacoes: number
    cardapio?: Produto[]
    latitude: number
    longitude: number
  }) {
    this.id = dados.id
    this.nome = dados.nome
    this.tipo = dados.tipo
    this.descricao = dados.descricao
    this.imagemUrl = dados.imagemUrl
    this.aberta = dados.aberta
    this.horarioAbertura = dados.horarioAbertura
    this.horarioFechamento = dados.horarioFechamento
    this.avaliacaoMedia = dados.avaliacaoMedia
    this.totalAvaliacoes = dados.totalAvaliacoes
    this.cardapio = dados.cardapio ?? []
    this.latitude = dados.latitude
    this.longitude = dados.longitude
  }

  estaAberta(): boolean {
    const agora = new Date()
    const hora = agora.getHours().toString().padStart(2, '0')
    const minuto = agora.getMinutes().toString().padStart(2, '0')
    const horaAtual = `${hora}:${minuto}`
    return this.aberta && horaAtual >= this.horarioAbertura && horaAtual <= this.horarioFechamento
  }

  adicionarProduto(produto: Produto): void {
    this.cardapio.push(produto)
  }

  removerProduto(produtoId: string): void {
    this.cardapio = this.cardapio.filter(p => p.id !== produtoId)
  }

  getProdutosDisponiveis(): Produto[] {
    return this.cardapio.filter(p => p.disponivel)
  }

  calcularAvaliacao(novaNota: number): void {
    const somaAtual = this.avaliacaoMedia * this.totalAvaliacoes
    this.totalAvaliacoes++
    this.avaliacaoMedia = (somaAtual + novaNota) / this.totalAvaliacoes
  }

  calcularFrete(distanciaKm: number): number {
    if (distanciaKm <= 3) return 5
    if (distanciaKm <= 7) return 10
    if (distanciaKm <= 12) return 15
    throw new Error('Distância acima de 12 km fora da área de entrega')
  }
}
