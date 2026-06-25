import { ItemPedido } from '../domain/entities/ItemPedido'

function makeItem(preco: number, qtd: number): ItemPedido {
  return new ItemPedido({
    produtoId: 'p1',
    nomeProduto: 'Pizza',
    precoProduto: preco,
    quantidade: qtd,
    observacao: '',
  })
}

describe('ItemPedido.calcularSubtotal()', () => {
  it('multiplica preço pela quantidade', () => {
    expect(makeItem(25, 3).calcularSubtotal()).toBe(75)
  })

  it('retorna zero quando quantidade é 0', () => {
    expect(makeItem(25, 0).calcularSubtotal()).toBe(0)
  })

  it('funciona com preços decimais', () => {
    expect(makeItem(9.99, 2).calcularSubtotal()).toBeCloseTo(19.98)
  })
})
