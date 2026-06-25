import { Pedido } from '../domain/entities/Pedido'
import { ItemPedido } from '../domain/entities/ItemPedido'
import { Cupom } from '../domain/entities/Cupom'
import { Endereco } from '../domain/entities/Endereco'
import { StatusPedido } from '../domain/enums/StatusPedido'
import { TipoCupom } from '../domain/enums/TipoCupom'

// ─── Fábricas auxiliares ──────────────────────────────────────────────────────

function makeEndereco(): Endereco {
  return new Endereco({
    id: 'end-1',
    clienteId: 'cli-1',
    apelido: 'Casa',
    cep: '12345-000',
    rua: 'Rua A',
    numero: '10',
    complemento: '',
    bairro: 'Centro',
    cidade: 'São Paulo',
    latitude: -23.5,
    longitude: -46.6,
    principal: true,
  })
}

function makeItem(preco: number, quantidade: number): ItemPedido {
  return new ItemPedido({
    produtoId: 'prod-1',
    nomeProduto: 'X-Burguer',
    precoProduto: preco,
    quantidade,
    observacao: '',
  })
}

function makePedido(overrides: Partial<ConstructorParameters<typeof Pedido>[0]> = {}): Pedido {
  return new Pedido({
    id: 'ped-1',
    clienteId: 'cli-1',
    lojaId: 'loja-1',
    itens: [makeItem(30, 2)], // subtotal = 60
    enderecoEntrega: makeEndereco(),
    taxaEntrega: 10,
    ...overrides,
  })
}

function makeCupomValido(tipo: TipoCupom, valor: number): Cupom {
  return new Cupom({
    id: 'cup-1',
    codigo: 'PROMO',
    tipo,
    valor,
    validade: new Date(Date.now() + 86_400_000),
    usoMaximo: 10,
    usoAtual: 0,
    ativo: true,
  })
}

// ─── calcularSubtotal ────────────────────────────────────────────────────────

describe('Pedido.calcularSubtotal()', () => {
  it('soma o subtotal de todos os itens', () => {
    const pedido = makePedido({
      itens: [makeItem(20, 3), makeItem(10, 2)], // 60 + 20 = 80
    })
    expect(pedido.subtotal).toBe(80)
  })

  it('retorna 0 com lista de itens vazia', () => {
    const pedido = makePedido({ itens: [] })
    expect(pedido.subtotal).toBe(0)
  })
})

// ─── calcularTotal ───────────────────────────────────────────────────────────

describe('Pedido.calcularTotal()', () => {
  it('total = subtotal - desconto + taxaEntrega', () => {
    const pedido = makePedido() // subtotal=60, taxa=10, desconto=0
    expect(pedido.total).toBe(70)
  })

  it('total mínimo é R$ 1,00 mesmo que os descontos superem tudo', () => {
    const cupom = makeCupomValido(TipoCupom.VALOR_FIXO, 999)
    const pedido = makePedido({ cupomAplicado: cupom })
    expect(pedido.total).toBeGreaterThanOrEqual(1)
  })
})

// ─── aplicarCupom ────────────────────────────────────────────────────────────

describe('Pedido.aplicarCupom()', () => {
  it('aplica desconto percentual corretamente', () => {
    const pedido = makePedido() // subtotal=60
    const cupom = makeCupomValido(TipoCupom.PERCENTUAL, 10) // 10% de 60 = 6
    pedido.aplicarCupom(cupom)
    expect(pedido.desconto).toBe(6)
    expect(pedido.total).toBe(64) // 60 - 6 + 10
  })

  it('aplica desconto frete grátis corretamente', () => {
    const pedido = makePedido() // taxa=10
    const cupom = makeCupomValido(TipoCupom.FRETE_GRATIS, 0)
    pedido.aplicarCupom(cupom)
    expect(pedido.desconto).toBe(10) // desconto = taxa
    expect(pedido.total).toBe(60)   // 60 - 10 + 10
  })

  it('lança erro ao aplicar cupom inválido (inativo)', () => {
    const pedido = makePedido()
    const cupomInativo = makeCupomValido(TipoCupom.PERCENTUAL, 10)
    cupomInativo.ativo = false
    expect(() => pedido.aplicarCupom(cupomInativo)).toThrow('Cupom inválido')
  })

  it('lança erro ao aplicar cupom expirado', () => {
    const pedido = makePedido()
    const cupomExpirado = makeCupomValido(TipoCupom.PERCENTUAL, 10)
    cupomExpirado.validade = new Date(Date.now() - 86_400_000)
    expect(() => pedido.aplicarCupom(cupomExpirado)).toThrow('Cupom inválido')
  })

  it('lança erro ao aplicar cupom esgotado', () => {
    const pedido = makePedido()
    const cupomEsgotado = makeCupomValido(TipoCupom.PERCENTUAL, 10)
    cupomEsgotado.usoAtual = cupomEsgotado.usoMaximo
    expect(() => pedido.aplicarCupom(cupomEsgotado)).toThrow('Cupom inválido')
  })
})

// ─── avancarStatus ───────────────────────────────────────────────────────────

describe('Pedido.avancarStatus()', () => {
  const fluxo: StatusPedido[] = [
    StatusPedido.AGUARDANDO_ACEITE,
    StatusPedido.EM_PREPARO,
    StatusPedido.AGUARDANDO_MOTORISTA,
    StatusPedido.A_CAMINHO,
    StatusPedido.ENTREGUE,
  ]

  it('percorre todo o fluxo de status na ordem correta', () => {
    const pedido = makePedido()
    for (let i = 1; i < fluxo.length; i++) {
      pedido.avancarStatus()
      expect(pedido.status).toBe(fluxo[i])
    }
  })

  it('atualiza dataAtualizacao ao avançar status', () => {
    const pedido = makePedido()
    const antes = pedido.dataAtualizacao
    pedido.avancarStatus()
    expect(pedido.dataAtualizacao.getTime()).toBeGreaterThanOrEqual(antes.getTime())
  })

  it('lança erro ao tentar avançar do status ENTREGUE', () => {
    const pedido = makePedido({ status: StatusPedido.ENTREGUE })
    expect(() => pedido.avancarStatus()).toThrow("Não é possível avançar o status 'ENTREGUE'")
  })

  it('lança erro ao tentar avançar do status CANCELADO', () => {
    const pedido = makePedido({ status: StatusPedido.CANCELADO })
    expect(() => pedido.avancarStatus()).toThrow("Não é possível avançar o status 'CANCELADO'")
  })
})

// ─── cancelar ────────────────────────────────────────────────────────────────

describe('Pedido.cancelar()', () => {
  it('cancela pedido com status AGUARDANDO_ACEITE com sucesso', () => {
    const pedido = makePedido()
    pedido.cancelar()
    expect(pedido.status).toBe(StatusPedido.CANCELADO)
  })

  it('lança erro ao tentar cancelar pedido EM_PREPARO', () => {
    const pedido = makePedido({ status: StatusPedido.EM_PREPARO })
    expect(() => pedido.cancelar()).toThrow("Pedido não pode ser cancelado no status 'EM_PREPARO'")
  })

  it('lança erro ao tentar cancelar pedido A_CAMINHO', () => {
    const pedido = makePedido({ status: StatusPedido.A_CAMINHO })
    expect(() => pedido.cancelar()).toThrow()
  })

  it('lança erro ao tentar cancelar pedido já ENTREGUE', () => {
    const pedido = makePedido({ status: StatusPedido.ENTREGUE })
    expect(() => pedido.cancelar()).toThrow()
  })
})

// ─── calcularPontosGerados ───────────────────────────────────────────────────

describe('Pedido.calcularPontosGerados()', () => {
  it('retorna 0 quando pedido não está ENTREGUE', () => {
    const pedido = makePedido()
    expect(pedido.calcularPontosGerados()).toBe(0)
  })

  it('retorna o total arredondado para baixo quando ENTREGUE', () => {
    const pedido = makePedido({ status: StatusPedido.ENTREGUE }) // total = 70
    expect(pedido.calcularPontosGerados()).toBe(70)
  })

  it('arredonda pontos para baixo (Math.floor)', () => {
    // total = 60.5 - 0 + 10.5 = 71 → nesse caso exato sem casas
    // para garantir floor: subtotal = 25.75, taxa = 0
    const pedido = makePedido({
      itens: [makeItem(25.75, 1)],
      taxaEntrega: 0,
      status: StatusPedido.ENTREGUE,
    })
    // total = 25.75, pontos = Math.floor(25.75) = 25
    expect(pedido.calcularPontosGerados()).toBe(25)
  })
})
