// Camada de acesso à API do backend.
// Centraliza todas as chamadas HTTP num lugar só (como um "repositório" do frontend).

import type {
  Cliente,
  Loja,
  Produto,
  Motorista,
  Pedido,
  ResultadoValidacaoCupom,
  ResultadoRota,
  ResultadoFrete,
} from './types'

const BASE_URL = 'http://localhost:3000'

// Função auxiliar: faz a requisição e trata erros de forma uniforme.
async function request<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  })

  if (!resposta.ok) {
    // o backend devolve { erro: "mensagem" } nos casos de falha
    const corpo = await resposta.json().catch(() => ({}))
    throw new Error(corpo.erro || `Erro na requisição (${resposta.status})`)
  }

  return resposta.json()
}

// ----- Clientes -----
export const listarClientes = () => request<Cliente[]>('/clientes')
export const buscarCliente = (id: string) => request<Cliente>(`/clientes/${id}`)
export const listarPedidosDoCliente = (id: string) =>
  request<Pedido[]>(`/clientes/${id}/pedidos`)

// ----- Lojas -----
export const listarLojas = () => request<Loja[]>('/lojas')
export const buscarCardapio = (lojaId: string) =>
  request<Produto[]>(`/lojas/${lojaId}/produtos`)
export const listarPedidosDaLoja = (lojaId: string) =>
  request<Pedido[]>(`/lojas/${lojaId}/pedidos`)
export const calcularFrete = (lojaId: string, clienteId: string) =>
  request<ResultadoFrete>(`/lojas/${lojaId}/frete/${clienteId}`)

// ----- Motoristas -----
export const listarMotoristas = () => request<Motorista[]>('/motoristas')

// ----- Cupons -----
export const validarCupom = (codigo: string) =>
  request<ResultadoValidacaoCupom>(`/cupons/${codigo}`)

// ----- Pedidos -----
interface ItemEntrada {
  produtoId: string
  quantidade: number
  observacao?: string
}

interface EntradaCriarPedido {
  clienteId: string
  lojaId: string
  itens: ItemEntrada[]
  codigoCupom?: string
  observacao?: string
}

export const criarPedido = (dados: EntradaCriarPedido) =>
  request<Pedido>('/pedidos', { method: 'POST', body: JSON.stringify(dados) })

export const buscarPedido = (id: string) => request<Pedido>(`/pedidos/${id}`)

export const buscarRota = (pedidoId: string) =>
  request<ResultadoRota>(`/pedidos/${pedidoId}/rota`)

export const avancarStatus = (pedidoId: string) =>
  request<Pedido>(`/pedidos/${pedidoId}/status`, { method: 'PATCH' })

export const cancelarPedido = (pedidoId: string) =>
  request<Pedido>(`/pedidos/${pedidoId}/cancelar`, { method: 'PATCH' })

export const confirmarEntrega = (pedidoId: string) =>
  request<Pedido>(`/pedidos/${pedidoId}/confirmar-entrega`, { method: 'POST' })
