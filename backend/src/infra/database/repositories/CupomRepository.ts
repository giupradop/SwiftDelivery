import { getPool } from '../connection'
import { Cupom } from '../../../domain/entities/Cupom'
import { TipoCupom } from '../../../domain/enums/TipoCupom'

function mapear(row: any): Cupom {
  return new Cupom({
    id: row.id,
    codigo: row.codigo,
    tipo: row.tipo as TipoCupom,
    valor: parseFloat(row.valor),
    validade: new Date(row.validade),
    usoMaximo: row.uso_maximo,
    usoAtual: row.uso_atual,
    ativo: !!row.ativo,
  })
}

export class CupomRepository {
  async findById(id: string): Promise<Cupom | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM cupons WHERE id = @id')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async findByCodigo(codigo: string): Promise<Cupom | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('codigo', codigo)
      .query('SELECT * FROM cupons WHERE codigo = @codigo')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async update(cupom: Cupom): Promise<void> {
    const pool = await getPool()
    await pool.request()
      .input('id', cupom.id)
      .input('usoAtual', cupom.usoAtual)
      .input('ativo', cupom.ativo)
      .query(`
        UPDATE cupons
        SET uso_atual = @usoAtual,
            ativo     = @ativo
        WHERE id = @id
      `)
  }
}
