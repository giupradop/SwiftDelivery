import { getPool } from '../connection'
import { Loja } from '../../../domain/entities/Loja'
import { TipoLoja } from '../../../domain/enums/TipoLoja'
import { ProdutoRepository } from './ProdutoRepository'

const produtoRepo = new ProdutoRepository()

function mapear(row: any): Loja {
  return new Loja({
    id: row.id,
    nome: row.nome,
    tipo: row.tipo as TipoLoja,
    descricao: row.descricao,
    imagemUrl: row.imagem_url,
    aberta: !!row.aberta,
    horarioAbertura: row.horario_abertura,
    horarioFechamento: row.horario_fechamento,
    avaliacaoMedia: parseFloat(row.avaliacao_media),
    totalAvaliacoes: row.total_avaliacoes,
    latitude: row.latitude,
    longitude: row.longitude,
  })
}

export class LojaRepository {
  async findAll(): Promise<Loja[]> {
    const pool = await getPool()
    const result = await pool.request()
      .query('SELECT * FROM lojas')

    return result.recordset.map(mapear)
  }

  async findById(id: string): Promise<Loja | null> {
    const pool = await getPool()
    const result = await pool.request()
      .input('id', id)
      .query('SELECT * FROM lojas WHERE id = @id')

    if (!result.recordset[0]) return null

    const loja = mapear(result.recordset[0])
    loja.cardapio = await produtoRepo.findByLoja(id)
    return loja
  }
}
