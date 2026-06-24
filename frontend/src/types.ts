// Tipos espelhando as entidades do backend.
// Servem para o frontend saber o formato dos dados que chegam da API.

export type StatusPedido =
  | 'AGUARDANDO_ACEITE'
  | 'EM_PREPARO'
  | 'AGUARDANDO_MOTORISTA'
  | 'A_CAMINHO'
  | 'ENTREGUE'
  | 'CANCELADO'

export type TipoCupom = 'PERCENTUAL' | 'VALOR_FIXO' | 'FRETE_GRATIS'

export type NivelFidelidade = 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE'

export type TipoLoja = 'CONFEITARIA' | 'PIZZARIA' | 'HAMBURGUERIA'

export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  pontosFidelidade: number
  nivelFidelidade: NivelFidelidade
}

export interface Produto {
  id: string
  lojaId: string
  nome: string
  descricao: string
  preco: number
  imagemUrl: string
  disponivel: boolean
  categoria: string
}

export interface Loja {
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
}

export interface Motorista {
  id: string
  nome: string
  email: string
  telefone: string
  cnh: string
  veiculo: string
  disponivel: boolean
  pedidoAtualId: string | null
}

export interface Cupom {
  id: string
  codigo: string
  tipo: TipoCupom
  valor: number
  validade: string
  usoMaximo: number
  usoAtual: number
  ativo: boolean
}

export interface Endereco {
  id: string
  clienteId: string
  apelido: string
  cep: string
  rua: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  latitude: number
  longitude: number
  principal: boolean
}

export interface ItemPedido {
  produtoId: string
  nomeProduto: string
  precoProduto: number
  quantidade: number
  observacao: string
}

export interface Pedido {
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
  dataCriacao: string
  dataAtualizacao: string
  observacao: string
}

// Retorno do endpoint de validação de cupom
export interface ResultadoValidacaoCupom {
  valido: boolean
  cupom: Cupom | null
  mensagem: string
}

// Retorno do endpoint de rota (mapa)
export interface ResultadoRota {
  distanciaKm: number
  geometria: GeoJSON.LineString
}

// Retorno do endpoint de cálculo de frete (preview no carrinho)
export interface ResultadoFrete {
  distanciaKm: number
  taxaEntrega: number
}
