import { Cupom } from '../domain/entities/Cupom'
import { TipoCupom } from '../domain/enums/TipoCupom'

// Fábrica auxiliar para reduzir repetição nos testes
function makeCupom(overrides: Partial<ConstructorParameters<typeof Cupom>[0]> = {}): Cupom {
  return new Cupom({
    id: '1',
    codigo: 'TESTE10',
    tipo: TipoCupom.PERCENTUAL,
    valor: 10,
    validade: new Date(Date.now() + 86_400_000), // amanhã
    usoMaximo: 100,
    usoAtual: 0,
    ativo: true,
    ...overrides,
  })
}

// ─── estaValido ───────────────────────────────────────────────────────────────

describe('Cupom.estaValido()', () => {
  it('retorna true para cupom ativo, dentro da validade e com usos disponíveis', () => {
    expect(makeCupom().estaValido()).toBe(true)
  })

  it('retorna false quando ativo = false', () => {
    expect(makeCupom({ ativo: false }).estaValido()).toBe(false)
  })

  it('retorna false quando a data de validade já passou', () => {
    const ontem = new Date(Date.now() - 86_400_000)
    expect(makeCupom({ validade: ontem }).estaValido()).toBe(false)
  })

  it('retorna false quando usoAtual >= usoMaximo', () => {
    expect(makeCupom({ usoMaximo: 5, usoAtual: 5 }).estaValido()).toBe(false)
    expect(makeCupom({ usoMaximo: 5, usoAtual: 6 }).estaValido()).toBe(false)
  })

  it('retorna true quando usoAtual < usoMaximo', () => {
    expect(makeCupom({ usoMaximo: 5, usoAtual: 4 }).estaValido()).toBe(true)
  })
})

// ─── calcularDesconto ────────────────────────────────────────────────────────

describe('Cupom.calcularDesconto()', () => {
  const subtotal = 100
  const taxaEntrega = 10

  it('PERCENTUAL: desconta percentual sobre o subtotal', () => {
    const cupom = makeCupom({ tipo: TipoCupom.PERCENTUAL, valor: 20 })
    expect(cupom.calcularDesconto(subtotal, taxaEntrega)).toBe(20) // 100 * 20% = 20
  })

  it('PERCENTUAL: desconto é zero quando valor = 0', () => {
    const cupom = makeCupom({ tipo: TipoCupom.PERCENTUAL, valor: 0 })
    expect(cupom.calcularDesconto(subtotal, taxaEntrega)).toBe(0)
  })

  it('VALOR_FIXO: desconta o valor fixo quando menor que o subtotal', () => {
    const cupom = makeCupom({ tipo: TipoCupom.VALOR_FIXO, valor: 30 })
    expect(cupom.calcularDesconto(subtotal, taxaEntrega)).toBe(30)
  })

  it('VALOR_FIXO: desconto é limitado ao subtotal (não pode ficar negativo)', () => {
    const cupom = makeCupom({ tipo: TipoCupom.VALOR_FIXO, valor: 150 })
    expect(cupom.calcularDesconto(subtotal, taxaEntrega)).toBe(100) // Math.min(150, 100)
  })

  it('FRETE_GRATIS: devolve exatamente a taxa de entrega', () => {
    const cupom = makeCupom({ tipo: TipoCupom.FRETE_GRATIS, valor: 0 })
    expect(cupom.calcularDesconto(subtotal, taxaEntrega)).toBe(10)
  })
})

// ─── incrementarUso ──────────────────────────────────────────────────────────

describe('Cupom.incrementarUso()', () => {
  it('incrementa usoAtual em 1 a cada chamada', () => {
    const cupom = makeCupom({ usoAtual: 3 })
    cupom.incrementarUso()
    expect(cupom.usoAtual).toBe(4)
    cupom.incrementarUso()
    expect(cupom.usoAtual).toBe(5)
  })

  it('após atingir usoMaximo, estaValido() retorna false', () => {
    const cupom = makeCupom({ usoMaximo: 2, usoAtual: 1 })
    cupom.incrementarUso()
    expect(cupom.estaValido()).toBe(false)
  })
})
