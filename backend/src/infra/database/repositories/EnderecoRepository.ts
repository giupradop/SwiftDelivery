import { getPool } from '../connection'
import { Endereco } from '../../../domain/entities/Endereco'

function mapear(row: any): Endereco {
  return new Endereco({
    id: row.id,
    clienteId: row.cliente_id,
    apelido: row.apelido,
    cep: row.cep,
    rua: row.rua,
    numero: row.numero,
    complemento: row.complemento,
    bairro: row.bairro,
    cidade: row.cidade,
    latitude: row.latitude,
    longitude: row.longitude,
    principal: !!row.principal,
  })
}

export class EnderecoRepository {
  async findById(id: string): Promise<Endereco | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM enderecos WHERE id = @id')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async findByCliente(clienteId: string): Promise<Endereco[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('clienteId', clienteId)
      .query('SELECT * FROM enderecos WHERE cliente_id = @clienteId')

    return result.recordset.map(mapear)
  }
}
