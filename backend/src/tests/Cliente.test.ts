import { Cliente } from '../domain/entities/Cliente'
import { Endereco } from '../domain/entities/Endereco'
import { NivelFidelidade } from '../domain/enums/NivelFidelidade'

// ─── Fábricas auxiliares ──────────────────────────────────────────────────────

function makeCliente(pontos = 0): Cliente {
  return new Cliente({
    id: 'cli-1',
    nome: 'João Silva',
    email: 'joao@email.com',
    senhaHash: 'hash',
    telefone: '11999999999',
    dataCadastro: new Date(),
    pontosFidelidade: pontos,
  })
}

function makeEndereco(principal = true): Endereco {
  return new Endereco({
    id: 'end-1',
    clienteId: 'cli-1',
    apelido: 'Casa',
    cep: '01310-100',
    rua: 'Av. Paulista',
    numero: '1000',
    complemento: 'Ap 10',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    latitude: -23.56,
    longitude: -46.65,
    principal,
  })
}

// ─── calcularNivelFidelidade ─────────────────────────────────────────────────

describe('Cliente.calcularNivelFidelidade()', () => {
  it('BRONZE: 0 pontos', () => {
    expect(makeCliente(0).nivelFidelidade).toBe(NivelFidelidade.BRONZE)
  })

  it('BRONZE: 199 pontos (limite inferior de PRATA menos 1)', () => {
    expect(makeCliente(199).nivelFidelidade).toBe(NivelFidelidade.BRONZE)
  })

  it('PRATA: exatamente 200 pontos', () => {
    expect(makeCliente(200).nivelFidelidade).toBe(NivelFidelidade.PRATA)
  })

  it('PRATA: 499 pontos', () => {
    expect(makeCliente(499).nivelFidelidade).toBe(NivelFidelidade.PRATA)
  })

  it('OURO: exatamente 500 pontos', () => {
    expect(makeCliente(500).nivelFidelidade).toBe(NivelFidelidade.OURO)
  })

  it('OURO: 999 pontos', () => {
    expect(makeCliente(999).nivelFidelidade).toBe(NivelFidelidade.OURO)
  })

  it('DIAMANTE: exatamente 1000 pontos', () => {
    expect(makeCliente(1000).nivelFidelidade).toBe(NivelFidelidade.DIAMANTE)
  })

  it('DIAMANTE: muitos pontos', () => {
    expect(makeCliente(9999).nivelFidelidade).toBe(NivelFidelidade.DIAMANTE)
  })
})

// ─── adicionarPontos ─────────────────────────────────────────────────────────

describe('Cliente.adicionarPontos()', () => {
  it('acumula pontos corretamente', () => {
    const cliente = makeCliente(100)
    cliente.adicionarPontos(150)
    expect(cliente.pontosFidelidade).toBe(250)
  })

  it('atualiza nível de fidelidade após adicionar pontos', () => {
    const cliente = makeCliente(190)
    expect(cliente.nivelFidelidade).toBe(NivelFidelidade.BRONZE)
    cliente.adicionarPontos(10) // atinge 200
    expect(cliente.nivelFidelidade).toBe(NivelFidelidade.PRATA)
  })

  it('sobe até DIAMANTE ao acumular 1000 pontos', () => {
    const cliente = makeCliente(0)
    cliente.adicionarPontos(1000)
    expect(cliente.nivelFidelidade).toBe(NivelFidelidade.DIAMANTE)
  })
})

// ─── adicionarEndereco ───────────────────────────────────────────────────────

describe('Cliente.adicionarEndereco()', () => {
  it('adiciona endereço à lista', () => {
    const cliente = makeCliente()
    expect(cliente.enderecos).toHaveLength(0)
    cliente.adicionarEndereco(makeEndereco())
    expect(cliente.enderecos).toHaveLength(1)
  })

  it('permite múltiplos endereços', () => {
    const cliente = makeCliente()
    cliente.adicionarEndereco(makeEndereco(true))
    cliente.adicionarEndereco(makeEndereco(false))
    expect(cliente.enderecos).toHaveLength(2)
  })
})

// ─── getNivelAcesso ──────────────────────────────────────────────────────────

describe('Cliente.getNivelAcesso()', () => {
  it('retorna CLIENTE', () => {
    expect(makeCliente().getNivelAcesso()).toBe('CLIENTE')
  })
})
