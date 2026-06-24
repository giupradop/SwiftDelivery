import { Cupom } from '../../../domain/entities/Cupom'
import { CupomRepository } from '../../../infra/database/repositories/CupomRepository'

const cupomRepo = new CupomRepository()

interface ResultadoValidacao {
  valido: boolean
  cupom: Cupom | null
  mensagem: string
}

export class ValidarCupom {
  async executar(codigo: string): Promise<ResultadoValidacao> {
    const cupom = await cupomRepo.findByCodigo(codigo)

    if (!cupom) {
      return { valido: false, cupom: null, mensagem: 'Cupom não encontrado' }
    }

    if (!cupom.estaValido()) {
      return { valido: false, cupom, mensagem: 'Cupom expirado ou esgotado' }
    }

    return { valido: true, cupom, mensagem: 'Cupom válido' }
  }
}
