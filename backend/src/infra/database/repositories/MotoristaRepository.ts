import { getPool } from '../connection'
import { Motorista } from '../../../domain/entities/Motorista'

function mapear(row: any): Motorista {
  return new Motorista({
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    telefone: row.telefone,
    dataCadastro: new Date(row.data_cadastro),
    cnh: row.cnh,
    veiculo: row.veiculo,
    disponivel: !!row.disponivel,
    pedidoAtualId: row.pedido_atual_id ?? null,
  })
}

export class MotoristaRepository {
  async findById(id: string): Promise<Motorista | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM motoristas WHERE id = @id')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async findAll(): Promise<Motorista[]> {
    const pool = await getPool()
    const result = await pool.request()
      .query('SELECT * FROM motoristas')

    return result.recordset.map(mapear)
  }

  async findAllDisponiveis(): Promise<Motorista[]> {
    const pool = await getPool()
    const result = await pool.request()
      .query('SELECT * FROM motoristas WHERE disponivel = 1')

    return result.recordset.map(mapear)
  }

  async update(motorista: Motorista): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', motorista.id)
      .input('disponivel', motorista.disponivel)
      .input('pedidoAtualId', motorista.pedidoAtualId)
      .query(`
        UPDATE motoristas
        SET disponivel      = @disponivel,
            pedido_atual_id = @pedidoAtualId
        WHERE id = @id
      `)
  }
}
