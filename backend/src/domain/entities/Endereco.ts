export class Endereco {
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

  constructor(dados: {
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
  }) {
    this.id = dados.id
    this.clienteId = dados.clienteId
    this.apelido = dados.apelido
    this.cep = dados.cep
    this.rua = dados.rua
    this.numero = dados.numero
    this.complemento = dados.complemento
    this.bairro = dados.bairro
    this.cidade = dados.cidade
    this.latitude = dados.latitude
    this.longitude = dados.longitude
    this.principal = dados.principal
  }
}
