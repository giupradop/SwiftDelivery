export abstract class Usuario {
  id: string
  nome: string
  email: string
  senhaHash: string
  telefone: string
  dataCadastro: Date

  constructor(dados: {
    id: string
    nome: string
    email: string
    senhaHash: string
    telefone: string
    dataCadastro: Date
  }) {
    this.id = dados.id
    this.nome = dados.nome
    this.email = dados.email
    this.senhaHash = dados.senhaHash
    this.telefone = dados.telefone
    this.dataCadastro = dados.dataCadastro
  }

  abstract getNivelAcesso(): string
}
