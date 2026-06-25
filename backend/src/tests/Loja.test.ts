import { Loja } from '../domain/entities/Loja'
import { Produto } from '../domain/entities/Produto'
import { TipoLoja } from '../domain/enums/TipoLoja'

// ─── Fábricas auxiliares ──────────────────────────────────────────────────────

function makeLoja(overrides: Partial<ConstructorParameters<typeof Loja>[0]> = {}): Loja {
  return new Loja({
    id: 'loja-1',
    nome: 'Burger Place',
    tipo: TipoLoja.HAMBURGUERIA,
    descricao: 'Os melhores burgers',
    imagemUrl: 'http://img.com/loja.jpg',
    aberta: true,
    horarioAbertura: '08:00',
    horarioFechamento: '22:00',
    avaliacaoMedia: 4.5,
    totalAvaliacoes: 100,
    latitude: -23.5,
    longitude: -46.6,
    ...overrides,
  })
}

function makeProduto(id: string, disponivel = true): Produto {
  return new Produto({
    id,
    lojaId: 'loja-1',
    nome: `Produto ${id}`,
    descricao: '',
    preco: 20,
    disponivel,
    imagemUrl: '',
    categoria: 'Lanche',
  })
}

// ─── calcularFrete ───────────────────────────────────────────────────────────

describe('Loja.calcularFrete()', () => {
  const loja = makeLoja()

  it('cobra R$ 5 para distâncias de até 3 km', () => {
    expect(loja.calcularFrete(0)).toBe(5)
    expect(loja.calcularFrete(1)).toBe(5)
    expect(loja.calcularFrete(3)).toBe(5)
  })

  it('cobra R$ 10 para distâncias entre 3,01 km e 7 km', () => {
    expect(loja.calcularFrete(3.01)).toBe(10)
    expect(loja.calcularFrete(5)).toBe(10)
    expect(loja.calcularFrete(7)).toBe(10)
  })

  it('cobra R$ 15 para distâncias entre 7,01 km e 12 km', () => {
    expect(loja.calcularFrete(7.01)).toBe(15)
    expect(loja.calcularFrete(10)).toBe(15)
    expect(loja.calcularFrete(12)).toBe(15)
  })

  it('lança erro para distâncias acima de 12 km', () => {
    expect(() => loja.calcularFrete(12.01)).toThrow('Distância acima de 12 km fora da área de entrega')
    expect(() => loja.calcularFrete(100)).toThrow()
  })
})

// ─── calcularAvaliacao ───────────────────────────────────────────────────────

describe('Loja.calcularAvaliacao()', () => {
  it('calcula a média corretamente com uma nova avaliação', () => {
    const loja = makeLoja({ avaliacaoMedia: 4, totalAvaliacoes: 1 })
    loja.calcularAvaliacao(5)
    // (4 * 1 + 5) / 2 = 4.5
    expect(loja.avaliacaoMedia).toBe(4.5)
    expect(loja.totalAvaliacoes).toBe(2)
  })

  it('primeira avaliação (sem histórico)', () => {
    const loja = makeLoja({ avaliacaoMedia: 0, totalAvaliacoes: 0 })
    loja.calcularAvaliacao(5)
    expect(loja.avaliacaoMedia).toBe(5)
    expect(loja.totalAvaliacoes).toBe(1)
  })
})

// ─── getProdutosDisponiveis ──────────────────────────────────────────────────

describe('Loja.getProdutosDisponiveis()', () => {
  it('retorna apenas produtos disponíveis', () => {
    const loja = makeLoja({
      cardapio: [
        makeProduto('p1', true),
        makeProduto('p2', false),
        makeProduto('p3', true),
      ],
    })
    const disponiveis = loja.getProdutosDisponiveis()
    expect(disponiveis).toHaveLength(2)
    expect(disponiveis.every((p) => p.disponivel)).toBe(true)
  })

  it('retorna lista vazia quando nenhum produto está disponível', () => {
    const loja = makeLoja({ cardapio: [makeProduto('p1', false)] })
    expect(loja.getProdutosDisponiveis()).toHaveLength(0)
  })
})

// ─── adicionarProduto / removerProduto ───────────────────────────────────────

describe('Loja gerenciamento de cardápio', () => {
  it('adiciona produto ao cardápio', () => {
    const loja = makeLoja()
    loja.adicionarProduto(makeProduto('p1'))
    expect(loja.cardapio).toHaveLength(1)
  })

  it('remove produto do cardápio pelo id', () => {
    const loja = makeLoja({ cardapio: [makeProduto('p1'), makeProduto('p2')] })
    loja.removerProduto('p1')
    expect(loja.cardapio).toHaveLength(1)
    expect(loja.cardapio[0].id).toBe('p2')
  })

  it('não altera cardápio ao remover id inexistente', () => {
    const loja = makeLoja({ cardapio: [makeProduto('p1')] })
    loja.removerProduto('xxx')
    expect(loja.cardapio).toHaveLength(1)
  })
})
