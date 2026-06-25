// Contrato genérico de leitura para os repositórios.
// O domínio define a interface; a camada de infraestrutura (banco) a implementa.
// O <T> torna a interface genérica: serve para qualquer entidade.
export interface IRepositorio<T> {
  findById(id: string): Promise<T | null>
  findAll(): Promise<T[]>
}
