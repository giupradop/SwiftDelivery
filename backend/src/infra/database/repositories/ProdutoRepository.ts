import { getPool } from '../connection'
import { Produto } from '../../../domain/entities/Produto'

function mapear(row: any): Produto {
  return new Produto({
    id: row.id,
    lojaId: row.loja_id,
    nome: row.nome,
    descricao: row.descricao,
    preco: parseFloat(row.preco),
    imagemUrl: row.imagem_url,
    disponivel: !!row.disponivel,
    categoria: row.categoria,
  })
}

export class ProdutoRepository {
  async findById(id: string): Promise<Produto | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM produtos WHERE id = @id')

    if (!result.recordset[0]) return null
    return mapear(result.recordset[0])
  }

  async findByLoja(lojaId: string): Promise<Produto[]> {
    const pool = await getPool()
    const result = await pool.request()
      .input('lojaId', lojaId)
      .query('SELECT * FROM produtos WHERE loja_id = @lojaId')

    return result.recordset.map(mapear)
  }
}
