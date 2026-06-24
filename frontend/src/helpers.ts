import type { StatusPedido } from './types'

// Formata um número como moeda brasileira: 53.8 -> "R$ 53,80"
export function formatBRL(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// Rótulos legíveis para cada status
export const STATUS_LABEL: Record<StatusPedido, string> = {
  AGUARDANDO_ACEITE: 'Aguardando aceite',
  EM_PREPARO: 'Em preparo',
  AGUARDANDO_MOTORISTA: 'Aguardando motorista',
  A_CAMINHO: 'A caminho',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
}

// Ordem das etapas do pedido (usada na timeline de acompanhamento)
export const ETAPAS: StatusPedido[] = [
  'AGUARDANDO_ACEITE',
  'EM_PREPARO',
  'AGUARDANDO_MOTORISTA',
  'A_CAMINHO',
  'ENTREGUE',
]
