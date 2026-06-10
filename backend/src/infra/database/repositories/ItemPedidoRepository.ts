import { getPool } from '../connection'
import { ItemPedido } from '../../../domain/entities/ItemPedido'

function mapear(row: any): ItemPedido {
  return new ItemPedido({
    produtoId: row.produto_id,
    nomeProduto: row.nome_produto,
    precoProduto: parseFloat(row.preco_produto),
    quantidade: row.quantidade,
    observacao: row.observacao ?? '',
  })
}

export class ItemPedidoRepository {
  async findByPedido(pedidoId: string): Promise<ItemPedido[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('pedidoId', pedidoId)
      .query('SELECT * FROM itens_pedido WHERE pedido_id = @pedidoId')

    return result.recordset.map(mapear)
  }

  async saveMany(pedidoId: string, itens: ItemPedido[]): Promise<void> {
    const pool = await getPool()
    for (const item of itens) {
      await pool.request()
        .input('id', crypto.randomUUID())
        .input('pedidoId', pedidoId)
        .input('produtoId', item.produtoId)
        .input('nomeProduto', item.nomeProduto)
        .input('precoProduto', item.precoProduto)
        .input('quantidade', item.quantidade)
        .input('observacao', item.observacao)
        .query(`
          INSERT INTO itens_pedido (id, pedido_id, produto_id, nome_produto, preco_produto, quantidade, observacao)
          VALUES (@id, @pedidoId, @produtoId, @nomeProduto, @precoProduto, @quantidade, @observacao)
        `)
    }
  }
}
