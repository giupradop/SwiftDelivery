/**
 * Testes dos Use Cases de Pedido
 *
 * Estratégia: os use cases instanciam repositórios e serviços externos
 * diretamente no módulo. Para isolá-los do banco de dados real, usamos
 * jest.mock() antes de qualquer import dos módulos testados.
 */

import { StatusPedido } from '../domain/enums/StatusPedido'
import { TipoCupom } from '../domain/enums/TipoCupom'
import { Pedido } from '../domain/entities/Pedido'
import { ItemPedido } from '../domain/entities/ItemPedido'
import { Endereco } from '../domain/entities/Endereco'
import { Cupom } from '../domain/entities/Cupom'
import { Motorista } from '../domain/entities/Motorista'
import { Cliente } from '../domain/entities/Cliente'

// ─── Mocks dos repositórios e serviços externos ──────────────────────────────

jest.mock('../infra/database/repositories/PedidoRepository')
jest.mock('../infra/database/repositories/ClienteRepository')
jest.mock('../infra/database/repositories/MotoristaRepository')
jest.mock('../infra/database/repositories/CupomRepository')
jest.mock('../infra/database/repositories/LojaRepository')
jest.mock('../infra/database/repositories/EnderecoRepository')
jest.mock('../infra/database/repositories/ProdutoRepository')
jest.mock('../infra/services/OpenRouteService')

import { PedidoRepository } from '../infra/database/repositories/PedidoRepository'
import { ClienteRepository } from '../infra/database/repositories/ClienteRepository'
import { MotoristaRepository } from '../infra/database/repositories/MotoristaRepository'
import { CupomRepository } from '../infra/database/repositories/CupomRepository'
import { calcularRota } from '../infra/services/OpenRouteService'

// ─── Fábricas ────────────────────────────────────────────────────────────────

function makeEndereco(): Endereco {
  return new Endereco({
    id: 'end-1', clienteId: 'cli-1', apelido: 'Casa', cep: '00000-000',
    rua: 'Rua A', numero: '1', complemento: '', bairro: 'B', cidade: 'SP',
    latitude: -23.5, longitude: -46.6, principal: true,
  })
}

function makePedidoComStatus(status: StatusPedido, motoristaId: string | null = null): Pedido {
  return new Pedido({
    id: 'ped-1',
    clienteId: 'cli-1',
    lojaId: 'loja-1',
    itens: [new ItemPedido({ produtoId: 'p1', nomeProduto: 'X', precoProduto: 30, quantidade: 2, observacao: '' })],
    enderecoEntrega: makeEndereco(),
    taxaEntrega: 10,
    status,
    motoristaId,
  })
}

function makeCupomValido(): Cupom {
  return new Cupom({
    id: 'cup-1', codigo: 'PROMO', tipo: TipoCupom.PERCENTUAL, valor: 10,
    validade: new Date(Date.now() + 86_400_000), usoMaximo: 10, usoAtual: 0, ativo: true,
  })
}

function makeMotorista(disponivel = true): Motorista {
  return new Motorista({
    id: 'mot-1', nome: 'Carlos', email: 'c@c.com', senhaHash: 'h',
    telefone: '11', dataCadastro: new Date(), cnh: '111', veiculo: 'Moto', disponivel,
  })
}

function makeCliente(): Cliente {
  return new Cliente({
    id: 'cli-1', nome: 'Ana', email: 'ana@x.com', senhaHash: 'h',
    telefone: '99', dataCadastro: new Date(), pontosFidelidade: 0,
  })
}

// ─── AvancarStatusPedido ─────────────────────────────────────────────────────

describe('AvancarStatusPedido', () => {
  let pedidoRepo: jest.Mocked<PedidoRepository>
  let motoristaRepo: jest.Mocked<MotoristaRepository>

  beforeEach(() => {
    jest.resetAllMocks()
    pedidoRepo = new PedidoRepository() as jest.Mocked<PedidoRepository>
    motoristaRepo = new MotoristaRepository() as jest.Mocked<MotoristaRepository>
    ;(PedidoRepository as jest.Mock).mockImplementation(() => pedidoRepo)
    ;(MotoristaRepository as jest.Mock).mockImplementation(() => motoristaRepo)
  })

  it('avança de AGUARDANDO_ACEITE para EM_PREPARO', async () => {
    const pedido = makePedidoComStatus(StatusPedido.AGUARDANDO_ACEITE)
    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)
    pedidoRepo.update = jest.fn().mockResolvedValue(undefined)

    const { AvancarStatusPedido } = await import('../application/use-cases/pedido/AvancarStatusPedido')
    const result = await new AvancarStatusPedido().executar('ped-1')

    expect(result.status).toBe(StatusPedido.EM_PREPARO)
    expect(pedidoRepo.update).toHaveBeenCalledWith(result)
  })

  it('lança erro quando pedido não existe', async () => {
    pedidoRepo.findById = jest.fn().mockResolvedValue(null)
    pedidoRepo.update = jest.fn()

    const { AvancarStatusPedido } = await import('../application/use-cases/pedido/AvancarStatusPedido')
    await expect(new AvancarStatusPedido().executar('xxx')).rejects.toThrow('Pedido não encontrado')
  })

  it('atribui motorista disponível ao avançar de AGUARDANDO_MOTORISTA para A_CAMINHO', async () => {
    const pedido = makePedidoComStatus(StatusPedido.AGUARDANDO_MOTORISTA)
    const motorista = makeMotorista(true)
    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)
    pedidoRepo.update = jest.fn().mockResolvedValue(undefined)
    motoristaRepo.findAllDisponiveis = jest.fn().mockResolvedValue([motorista])
    motoristaRepo.update = jest.fn().mockResolvedValue(undefined)

    const { AvancarStatusPedido } = await import('../application/use-cases/pedido/AvancarStatusPedido')
    const result = await new AvancarStatusPedido().executar('ped-1')

    expect(result.status).toBe(StatusPedido.A_CAMINHO)
    expect(result.motoristaId).toBe(motorista.id)
    expect(motorista.disponivel).toBe(false)
  })

  it('lança erro quando não há motoristas disponíveis', async () => {
    const pedido = makePedidoComStatus(StatusPedido.AGUARDANDO_MOTORISTA)
    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)
    motoristaRepo.findAllDisponiveis = jest.fn().mockResolvedValue([])

    const { AvancarStatusPedido } = await import('../application/use-cases/pedido/AvancarStatusPedido')
    await expect(new AvancarStatusPedido().executar('ped-1')).rejects.toThrow('Nenhum motorista disponível')
  })
})

// ─── CancelarPedido ──────────────────────────────────────────────────────────

describe('CancelarPedido', () => {
  let pedidoRepo: jest.Mocked<PedidoRepository>

  beforeEach(() => {
    jest.resetAllMocks()
    pedidoRepo = new PedidoRepository() as jest.Mocked<PedidoRepository>
    ;(PedidoRepository as jest.Mock).mockImplementation(() => pedidoRepo)
  })

  it('cancela pedido em AGUARDANDO_ACEITE com sucesso', async () => {
    const pedido = makePedidoComStatus(StatusPedido.AGUARDANDO_ACEITE)
    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)
    pedidoRepo.update = jest.fn().mockResolvedValue(undefined)

    const { CancelarPedido } = await import('../application/use-cases/pedido/CancelarPedido')
    const result = await new CancelarPedido().executar('ped-1')

    expect(result.status).toBe(StatusPedido.CANCELADO)
    expect(pedidoRepo.update).toHaveBeenCalled()
  })

  it('lança erro ao cancelar pedido EM_PREPARO', async () => {
    const pedido = makePedidoComStatus(StatusPedido.EM_PREPARO)
    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)

    const { CancelarPedido } = await import('../application/use-cases/pedido/CancelarPedido')
    await expect(new CancelarPedido().executar('ped-1')).rejects.toThrow()
  })

  it('lança erro quando pedido não encontrado', async () => {
    pedidoRepo.findById = jest.fn().mockResolvedValue(null)

    const { CancelarPedido } = await import('../application/use-cases/pedido/CancelarPedido')
    await expect(new CancelarPedido().executar('xxx')).rejects.toThrow('Pedido não encontrado')
  })
})

// ─── ConfirmarEntrega ────────────────────────────────────────────────────────

describe('ConfirmarEntrega', () => {
  let pedidoRepo: jest.Mocked<PedidoRepository>
  let clienteRepo: jest.Mocked<ClienteRepository>
  let motoristaRepo: jest.Mocked<MotoristaRepository>

  beforeEach(() => {
    jest.resetAllMocks()
    pedidoRepo = new PedidoRepository() as jest.Mocked<PedidoRepository>
    clienteRepo = new ClienteRepository() as jest.Mocked<ClienteRepository>
    motoristaRepo = new MotoristaRepository() as jest.Mocked<MotoristaRepository>
    ;(PedidoRepository as jest.Mock).mockImplementation(() => pedidoRepo)
    ;(ClienteRepository as jest.Mock).mockImplementation(() => clienteRepo)
    ;(MotoristaRepository as jest.Mock).mockImplementation(() => motoristaRepo)
  })

  it('confirma entrega, credita pontos e libera motorista', async () => {
    const pedido = makePedidoComStatus(StatusPedido.A_CAMINHO, 'mot-1')
    const cliente = makeCliente()
    const motorista = makeMotorista(false)

    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)
    pedidoRepo.update = jest.fn().mockResolvedValue(undefined)
    clienteRepo.findById = jest.fn().mockResolvedValue(cliente)
    clienteRepo.update = jest.fn().mockResolvedValue(undefined)
    motoristaRepo.findById = jest.fn().mockResolvedValue(motorista)
    motoristaRepo.update = jest.fn().mockResolvedValue(undefined)

    const { ConfirmarEntrega } = await import('../application/use-cases/pedido/ConfirmarEntrega')
    const result = await new ConfirmarEntrega().executar('ped-1')

    expect(result.status).toBe(StatusPedido.ENTREGUE)
    expect(cliente.pontosFidelidade).toBeGreaterThan(0)
    expect(motorista.disponivel).toBe(true)
    expect(motorista.pedidoAtualId).toBeNull()
  })

  it('lança erro ao tentar confirmar pedido que não está A_CAMINHO', async () => {
    const pedido = makePedidoComStatus(StatusPedido.EM_PREPARO)
    pedidoRepo.findById = jest.fn().mockResolvedValue(pedido)

    const { ConfirmarEntrega } = await import('../application/use-cases/pedido/ConfirmarEntrega')
    await expect(new ConfirmarEntrega().executar('ped-1')).rejects.toThrow('Só é possível confirmar entrega de pedidos a caminho')
  })
})

// ─── ValidarCupom ────────────────────────────────────────────────────────────

describe('ValidarCupom', () => {
  let cupomRepo: jest.Mocked<CupomRepository>

  beforeEach(() => {
    jest.resetAllMocks()
    cupomRepo = new CupomRepository() as jest.Mocked<CupomRepository>
    ;(CupomRepository as jest.Mock).mockImplementation(() => cupomRepo)
  })

  it('retorna valido=true para cupom existente e válido', async () => {
    cupomRepo.findByCodigo = jest.fn().mockResolvedValue(makeCupomValido())

    const { ValidarCupom } = await import('../application/use-cases/pedido/ValidarCupom')
    const resultado = await new ValidarCupom().executar('PROMO')

    expect(resultado.valido).toBe(true)
    expect(resultado.mensagem).toBe('Cupom válido')
  })

  it('retorna valido=false quando cupom não encontrado', async () => {
    cupomRepo.findByCodigo = jest.fn().mockResolvedValue(null)

    const { ValidarCupom } = await import('../application/use-cases/pedido/ValidarCupom')
    const resultado = await new ValidarCupom().executar('INVALIDO')

    expect(resultado.valido).toBe(false)
    expect(resultado.mensagem).toBe('Cupom não encontrado')
    expect(resultado.cupom).toBeNull()
  })

  it('retorna valido=false quando cupom está expirado/esgotado', async () => {
    const cupomInvalido = makeCupomValido()
    cupomInvalido.ativo = false
    cupomRepo.findByCodigo = jest.fn().mockResolvedValue(cupomInvalido)

    const { ValidarCupom } = await import('../application/use-cases/pedido/ValidarCupom')
    const resultado = await new ValidarCupom().executar('PROMO')

    expect(resultado.valido).toBe(false)
    expect(resultado.mensagem).toBe('Cupom expirado ou esgotado')
  })
})
