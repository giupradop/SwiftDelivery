import { getPool } from '../connection'
import { Cliente } from '../../../domain/entities/Cliente'

function mapear(row: any): Cliente {
  return new Cliente({
    id: row.id,
    nome: row.nome,
    email: row.email,
    senhaHash: row.senha_hash,
    telefone: row.telefone,
    dataCadastro: new Date(row.data_cadastro),
    pontosFidelidade: row.pontos_fidelidade,
  })
}

export class ClienteRepository {
  async findById(id: string): Promise<Cliente | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM clientes WHERE id = @id')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async findAll(): Promise<Cliente[]> {
    const pool = await getPool()
    const result = await pool.request()
      .query('SELECT * FROM clientes')

    return result.recordset.map(mapear)
  }

  async update(cliente: Cliente): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', cliente.id)
      .input('pontosFidelidade', cliente.pontosFidelidade)
      .input('nivelFidelidade', cliente.nivelFidelidade)
      .query(`
        UPDATE clientes
        SET pontos_fidelidade = @pontosFidelidade,
            nivel_fidelidade  = @nivelFidelidade
        WHERE id = @id
      `)
  }
}
