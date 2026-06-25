import { Motorista } from '../domain/entities/Motorista'

function makeMotorista(disponivel = true, pedidoAtualId: string | null = null): Motorista {
  return new Motorista({
    id: 'mot-1',
    nome: 'Carlos Souza',
    email: 'carlos@email.com',
    senhaHash: 'hash',
    telefone: '11988887777',
    dataCadastro: new Date(),
    cnh: '12345678900',
    veiculo: 'Honda CG 160',
    disponivel,
    pedidoAtualId,
  })
}

// ─── atribuirPedido ──────────────────────────────────────────────────────────

describe('Motorista.atribuirPedido()', () => {
  it('marca motorista como indisponível e registra o pedido', () => {
    const motorista = makeMotorista(true)
    motorista.atribuirPedido('ped-99')
    expect(motorista.disponivel).toBe(false)
    expect(motorista.pedidoAtualId).toBe('ped-99')
  })
})

// ─── liberarPedido ───────────────────────────────────────────────────────────

describe('Motorista.liberarPedido()', () => {
  it('marca motorista como disponível e limpa o pedido atual', () => {
    const motorista = makeMotorista(false, 'ped-99')
    motorista.liberarPedido()
    expect(motorista.disponivel).toBe(true)
    expect(motorista.pedidoAtualId).toBeNull()
  })
})

// ─── fluxo completo ──────────────────────────────────────────────────────────

describe('Motorista: fluxo atribuir → liberar', () => {
  it('fica disponível depois de concluir entrega', () => {
    const motorista = makeMotorista()
    motorista.atribuirPedido('ped-1')
    expect(motorista.disponivel).toBe(false)
    motorista.liberarPedido()
    expect(motorista.disponivel).toBe(true)
    expect(motorista.pedidoAtualId).toBeNull()
  })
})

// ─── getNivelAcesso ──────────────────────────────────────────────────────────

describe('Motorista.getNivelAcesso()', () => {
  it('retorna MOTORISTA', () => {
    expect(makeMotorista().getNivelAcesso()).toBe('MOTORISTA')
  })
})

// ─── defaults do construtor ──────────────────────────────────────────────────

describe('Motorista: valores padrão', () => {
  it('disponivel padrão é true', () => {
    const motorista = new Motorista({
      id: 'm1', nome: 'A', email: 'a@b.com', senhaHash: 'h',
      telefone: '1', dataCadastro: new Date(), cnh: '123', veiculo: 'Moto',
    })
    expect(motorista.disponivel).toBe(true)
    expect(motorista.pedidoAtualId).toBeNull()
  })
})
