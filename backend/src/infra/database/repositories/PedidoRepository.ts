import { getPool } from '../connection'
import { Pedido } from '../../../domain/entities/Pedido'
import { StatusPedido } from '../../../domain/enums/StatusPedido'
import { EnderecoRepository } from './EnderecoRepository'
import { CupomRepository } from './CupomRepository'
import { ItemPedidoRepository } from './ItemPedidoRepository'

const enderecoRepo = new EnderecoRepository()
const cupomRepo = new CupomRepository()
const itemRepo = new ItemPedidoRepository()

async function mapear(row: any): Promise<Pedido | null> {
  const endereco = await enderecoRepo.findById(row.endereco_entrega_id)
  if (!endereco) return null

  const itens = await itemRepo.findByPedido(row.id)
  const cupom = row.cupom_id ? await cupomRepo.findById(row.cupom_id) : null

  const pedido = new Pedido({
    id: row.id,
    clienteId: row.cliente_id,
    lojaId: row.loja_id,
    motoristaId: row.motorista_id ?? null,
    itens,
    enderecoEntrega: endereco,
    taxaEntrega: parseFloat(row.taxa_entrega),
    observacao: row.observacao ?? '',
    cupomAplicado: cupom,
    status: row.status as StatusPedido,
    dataCriacao: new Date(row.data_criacao),
    dataAtualizacao: new Date(row.data_atualizacao),
  })

  // usa os valores armazenados no banco ao invés de recalcular
  pedido.subtotal = parseFloat(row.subtotal)
  pedido.desconto = parseFloat(row.desconto)
  pedido.total = parseFloat(row.total)

  return pedido
}

export class PedidoRepository {
  async findById(id: string): Promise<Pedido | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM pedidos WHERE id = @id')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async findByCliente(clienteId: string): Promise<Pedido[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('clienteId', clienteId)
      .query('SELECT * FROM pedidos WHERE cliente_id = @clienteId ORDER BY data_criacao DESC')

    const pedidos = await Promise.all(result.recordset.map(mapear))
    return pedidos.filter((p): p is Pedido => p !== null)
  }

  async findByLoja(lojaId: string): Promise<Pedido[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('lojaId', lojaId)
      .query('SELECT * FROM pedidos WHERE loja_id = @lojaId ORDER BY data_criacao DESC')

    const pedidos = await Promise.all(result.recordset.map(mapear))
    return pedidos.filter((p): p is Pedido => p !== null)
  }

  async save(pedido: Pedido): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', pedido.id)
      .input('clienteId', pedido.clienteId)
      .input('lojaId', pedido.lojaId)
      .input('motoristaId', pedido.motoristaId)
      .input('status', pedido.status)
      .input('enderecoEntregaId', pedido.enderecoEntrega.id)
      .input('subtotal', pedido.subtotal)
      .input('taxaEntrega', pedido.taxaEntrega)
      .input('desconto', pedido.desconto)
      .input('total', pedido.total)
      .input('cupomId', pedido.cupomAplicado?.id ?? null)
      .input('dataCriacao', pedido.dataCriacao)
      .input('dataAtualizacao', pedido.dataAtualizacao)
      .input('observacao', pedido.observacao)
      .query(`
        INSERT INTO pedidos (id, cliente_id, loja_id, motorista_id, status, endereco_entrega_id, subtotal, taxa_entrega, desconto, total, cupom_id, data_criacao, data_atualizacao, observacao)
        VALUES (@id, @clienteId, @lojaId, @motoristaId, @status, @enderecoEntregaId, @subtotal, @taxaEntrega, @desconto, @total, @cupomId, @dataCriacao, @dataAtualizacao, @observacao)
      `)

    await itemRepo.saveMany(pedido.id, pedido.itens)
  }

  async update(pedido: Pedido): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', pedido.id)
      .input('status', pedido.status)
      .input('motoristaId', pedido.motoristaId)
      .input('desconto', pedido.desconto)
      .input('total', pedido.total)
      .input('cupomId', pedido.cupomAplicado?.id ?? null)
      .input('dataAtualizacao', pedido.dataAtualizacao)
      .query(`
        UPDATE pedidos
        SET status           = @status,
            motorista_id     = @motoristaId,
            desconto         = @desconto,
            total            = @total,
            cupom_id         = @cupomId,
            data_atualizacao = @dataAtualizacao
        WHERE id = @id
      `)
  }
}
