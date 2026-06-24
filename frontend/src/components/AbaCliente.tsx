import { useEffect, useState } from 'react'
import type {
  Cliente,
  Loja,
  Produto,
  Motorista,
  Pedido,
  ResultadoValidacaoCupom,
  ResultadoFrete,
} from '../types'
import * as api from '../api'
import { formatBRL, STATUS_LABEL, ETAPAS } from '../helpers'

interface ItemCarrinho {
  produto: Produto
  quantidade: number
}

// status que indicam que o pedido ainda está em andamento
const STATUS_FINALIZADOS = ['ENTREGUE', 'CANCELADO']

export function AbaCliente({ ativa }: { ativa: boolean }) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])

  const [clienteId, setClienteId] = useState('')
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [pedidosCliente, setPedidosCliente] = useState<Pedido[]>([])

  const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null)
  const [cardapio, setCardapio] = useState<Produto[]>([])
  const [frete, setFrete] = useState<ResultadoFrete | null>(null)
  const [freteCarregando, setFreteCarregando] = useState(false)

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [codigoCupom, setCodigoCupom] = useState('')
  const [cupomValidado, setCupomValidado] = useState<ResultadoValidacaoCupom | null>(null)
  const [observacao, setObservacao] = useState('')

  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    api.listarClientes().then(setClientes).catch((e) => setErro(e.message))
    api.listarLojas().then(setLojas).catch((e) => setErro(e.message))
    api.listarMotoristas().then(setMotoristas).catch(() => {})
  }, [])

  // Ao abrir a aba, atualiza os dados do cliente selecionado (pontos e pedidos),
  // refletindo mudanças feitas nas outras abas (ex: pedido entregue).
  useEffect(() => {
    if (!ativa || !clienteId) return
    api.buscarCliente(clienteId).then(setCliente).catch(() => {})
    api.listarPedidosDoCliente(clienteId).then(setPedidosCliente).catch(() => {})
    api.listarMotoristas().then(setMotoristas).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativa])

  function selecionarCliente(id: string) {
    setClienteId(id)
    setLojaSelecionada(null)
    setCardapio([])
    setCarrinho([])
    setFrete(null)
    setCupomValidado(null)
    setCodigoCupom('')
    if (id) {
      api.buscarCliente(id).then(setCliente).catch((e) => setErro(e.message))
      carregarPedidos(id)
    } else {
      setCliente(null)
      setPedidosCliente([])
    }
  }

  function carregarPedidos(id: string) {
    api.listarPedidosDoCliente(id).then(setPedidosCliente).catch(() => {})
  }

  async function selecionarLoja(loja: Loja) {
    setLojaSelecionada(loja)
    setCarrinho([])
    setCupomValidado(null)
    setCodigoCupom('')
    setFrete(null)
    api.buscarCardapio(loja.id).then(setCardapio).catch((e) => setErro(e.message))

    // calcula o frete assim que a loja é escolhida (depende só de loja + cliente)
    if (cliente) {
      setFreteCarregando(true)
      try {
        const f = await api.calcularFrete(loja.id, cliente.id)
        setFrete(f)
      } catch (e) {
        setErro((e as Error).message)
      } finally {
        setFreteCarregando(false)
      }
    }
  }

  function adicionarAoCarrinho(produto: Produto) {
    setCarrinho((atual) => {
      const existente = atual.find((i) => i.produto.id === produto.id)
      if (existente) {
        return atual.map((i) =>
          i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i,
        )
      }
      return [...atual, { produto, quantidade: 1 }]
    })
  }

  function mudarQuantidade(produtoId: string, delta: number) {
    setCarrinho((atual) =>
      atual
        .map((i) => (i.produto.id === produtoId ? { ...i, quantidade: i.quantidade + delta } : i))
        .filter((i) => i.quantidade > 0),
    )
  }

  async function validar() {
    if (!codigoCupom.trim()) return
    try {
      const resultado = await api.validarCupom(codigoCupom.trim().toUpperCase())
      setCupomValidado(resultado)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function confirmarPedido() {
    if (!cliente || !lojaSelecionada || carrinho.length === 0) return
    setEnviando(true)
    setErro('')
    try {
      await api.criarPedido({
        clienteId: cliente.id,
        lojaId: lojaSelecionada.id,
        itens: carrinho.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
        codigoCupom: cupomValidado?.valido ? codigoCupom.trim().toUpperCase() : undefined,
        observacao: observacao || undefined,
      })
      // recarrega os pedidos do cliente: o novo aparece em "em andamento"
      carregarPedidos(cliente.id)
      api.buscarCliente(cliente.id).then(setCliente).catch(() => {})
      setLojaSelecionada(null)
      setCardapio([])
      setCarrinho([])
      setCupomValidado(null)
      setCodigoCupom('')
      setObservacao('')
      setFrete(null)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  function atualizarPedidos() {
    if (cliente) {
      carregarPedidos(cliente.id)
      api.buscarCliente(cliente.id).then(setCliente).catch(() => {})
    }
  }

  function nomeMotorista(id: string | null) {
    if (!id) return null
    return motoristas.find((m) => m.id === id)?.nome ?? 'Atribuído'
  }

  // --- cálculos do carrinho ---
  const subtotal = carrinho.reduce((s, i) => s + i.produto.preco * i.quantidade, 0)
  const taxaEntrega = frete?.taxaEntrega ?? 0

  let desconto = 0
  let notaCupom = ''
  if (cupomValidado?.valido && cupomValidado.cupom) {
    const c = cupomValidado.cupom
    if (c.tipo === 'PERCENTUAL') desconto = subtotal * (c.valor / 100)
    else if (c.tipo === 'VALOR_FIXO') desconto = Math.min(c.valor, subtotal)
    else if (c.tipo === 'FRETE_GRATIS') {
      desconto = taxaEntrega
      notaCupom = 'Frete grátis'
    }
  }
  const total = Math.max(subtotal - desconto + taxaEntrega, 1)
  const pontosAGanhar = Math.floor(total)

  // --- separa pedido ativo do histórico ---
  const pedidoAtivo = pedidosCliente.find((p) => !STATUS_FINALIZADOS.includes(p.status))
  const historico = pedidosCliente.filter((p) => STATUS_FINALIZADOS.includes(p.status))

  return (
    <div>
      <h1 className="section-title">Fazer pedido</h1>
      <p className="section-sub">Selecione um cliente, escolha uma loja e monte seu pedido.</p>

      {erro && <div className="alert alert-erro">{erro}</div>}

      {/* Seleção de cliente + fidelidade */}
      <div className="card">
        <div className="field" style={{ marginBottom: cliente ? 16 : 0 }}>
          <label className="label">Cliente</label>
          <select className="select" value={clienteId} onChange={(e) => selecionarCliente(e.target.value)}>
            <option value="">Selecione um cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>

        {cliente && (
          <div className="fidelidade">
            <div>
              <div className="pontos">{cliente.pontosFidelidade}</div>
              <div className="pontos-label">pontos de fidelidade</div>
            </div>
            <span className={`nivel-badge nivel-${cliente.nivelFidelidade.toLowerCase()}`}>
              {cliente.nivelFidelidade}
            </span>
          </div>
        )}
      </div>

      {/* Pedido em andamento */}
      {cliente && pedidoAtivo && (
        <Acompanhamento
          pedido={pedidoAtivo}
          nomeMotorista={nomeMotorista(pedidoAtivo.motoristaId)}
          onAtualizar={atualizarPedidos}
        />
      )}

      {/* Fluxo de novo pedido */}
      {cliente && (
        <>
          <div className="spacer" />
          <div className="card-title">Lojas disponíveis</div>
          <div className="grid-2">
            {lojas.map((loja) => (
              <div
                key={loja.id}
                className={`loja-card ${lojaSelecionada?.id === loja.id ? 'selecionada' : ''}`}
                onClick={() => selecionarLoja(loja)}
              >
                <div className="loja-nome">{loja.nome}</div>
                <div className="loja-tipo">{loja.tipo.toLowerCase()}</div>
                <div className="loja-meta">
                  <span>★ {loja.avaliacaoMedia.toFixed(1)}</span>
                  <span>{loja.aberta ? 'Aberta' : 'Fechada'}</span>
                </div>
              </div>
            ))}
          </div>

          {lojaSelecionada && (
            <>
              <div className="spacer" />
              <div className="grid-2">
                {/* Cardápio */}
                <div className="card">
                  <div className="card-title">Cardápio · {lojaSelecionada.nome}</div>
                  {cardapio.map((p) => (
                    <div key={p.id} className="produto-row">
                      <div className="produto-info">
                        <div className="produto-nome">{p.nome}</div>
                        <div className="produto-desc">{p.descricao}</div>
                      </div>
                      <div className="produto-preco">{formatBRL(p.preco)}</div>
                      <button className="btn btn-ghost btn-sm" onClick={() => adicionarAoCarrinho(p)}>
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Carrinho */}
                <div className="card">
                  <div className="card-title">Seu carrinho</div>
                  {carrinho.length === 0 ? (
                    <div className="empty">Carrinho vazio</div>
                  ) : (
                    <>
                      {carrinho.map((item) => (
                        <div key={item.produto.id} className="cart-line">
                          <div className="cart-line-info">
                            <div className="produto-nome">{item.produto.nome}</div>
                            <div className="muted">{formatBRL(item.produto.preco)}</div>
                          </div>
                          <div className="qtd-control">
                            <button className="qtd-btn" onClick={() => mudarQuantidade(item.produto.id, -1)}>−</button>
                            <span>{item.quantidade}</span>
                            <button className="qtd-btn" onClick={() => mudarQuantidade(item.produto.id, 1)}>+</button>
                          </div>
                        </div>
                      ))}

                      <div className="spacer-sm" />
                      <label className="label">Cupom de desconto</label>
                      <div className="row-inline">
                        <input
                          className="input"
                          placeholder="Ex: PROMO10"
                          value={codigoCupom}
                          onChange={(e) => setCodigoCupom(e.target.value)}
                        />
                        <button className="btn btn-ghost" onClick={validar}>Aplicar</button>
                      </div>
                      {cupomValidado && (
                        <div className={`msg-cupom ${cupomValidado.valido ? 'ok' : 'erro'}`}>
                          {cupomValidado.mensagem}
                        </div>
                      )}

                      <div className="spacer-sm" />
                      <label className="label">Observação (opcional)</label>
                      <input
                        className="input"
                        placeholder="Ex: sem cebola"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                      />

                      {/* Totais */}
                      <div className="totais">
                        <div className="total-line">
                          <span>Subtotal</span>
                          <span>{formatBRL(subtotal)}</span>
                        </div>
                        {desconto > 0 && (
                          <div className="total-line">
                            <span>Desconto {notaCupom && `(${notaCupom})`}</span>
                            <span className="desconto">− {formatBRL(desconto)}</span>
                          </div>
                        )}
                        <div className="total-line">
                          <span>Frete</span>
                          <span>
                            {freteCarregando ? 'calculando...' : frete ? formatBRL(taxaEntrega) : '—'}
                          </span>
                        </div>
                        <div className="total-line final">
                          <span>Total</span>
                          <span>{formatBRL(total)}</span>
                        </div>
                        <div className="total-line" style={{ marginTop: 8 }}>
                          <span>Pontos a ganhar</span>
                          <span>{pontosAGanhar} pts</span>
                        </div>
                      </div>

                      <div className="spacer-sm" />
                      <button
                        className="btn btn-primary btn-block"
                        onClick={confirmarPedido}
                        disabled={enviando || freteCarregando || !frete}
                      >
                        {enviando ? 'Enviando...' : 'Confirmar pedido'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Histórico */}
      {cliente && historico.length > 0 && (
        <>
          <div className="spacer" />
          <div className="card-title">Histórico de pedidos</div>
          {historico.map((p) => (
            <div key={p.id} className="pedido-card">
              <div className="pedido-head">
                <div>
                  <span className={`badge badge-${p.status.toLowerCase()}`}>{STATUS_LABEL[p.status]}</span>
                  <div className="pedido-id" style={{ marginTop: 6 }}>
                    {new Date(p.dataCriacao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <strong>{formatBRL(p.total)}</strong>
              </div>
              <div className="pedido-itens">
                {p.itens.map((i) => `${i.quantidade}× ${i.nomeProduto}`).join(', ')}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}

// ----- Subcomponente: acompanhamento do pedido ativo -----
function Acompanhamento({
  pedido,
  nomeMotorista,
  onAtualizar,
}: {
  pedido: Pedido
  nomeMotorista: string | null
  onAtualizar: () => void
}) {
  const indiceAtual = ETAPAS.indexOf(pedido.status)
  const pontos = Math.floor(pedido.total)

  return (
    <>
      <div className="spacer" />
      <div className="card">
        <div className="card-title">Pedido em andamento</div>

        <div className="timeline">
          {ETAPAS.map((etapa, i) => {
            const classe = i < indiceAtual ? 'done' : i === indiceAtual ? 'current' : ''
            return (
              <div key={etapa} className={`timeline-step ${classe}`}>
                <div className="timeline-dot">{i < indiceAtual ? '✓' : ''}</div>
                <div className="timeline-label">{STATUS_LABEL[etapa]}</div>
              </div>
            )
          })}
        </div>

        {nomeMotorista && (
          <p className="muted" style={{ marginTop: 14 }}>
            Motorista: <strong>{nomeMotorista}</strong>
          </p>
        )}

        <div className="totais">
          <div className="total-line">
            <span>Subtotal</span>
            <span>{formatBRL(pedido.subtotal)}</span>
          </div>
          {pedido.desconto > 0 && (
            <div className="total-line">
              <span>Desconto</span>
              <span className="desconto">− {formatBRL(pedido.desconto)}</span>
            </div>
          )}
          <div className="total-line">
            <span>Frete</span>
            <span>{formatBRL(pedido.taxaEntrega)}</span>
          </div>
          <div className="total-line final">
            <span>Total</span>
            <span>{formatBRL(pedido.total)}</span>
          </div>
          <div className="total-line" style={{ marginTop: 8 }}>
            <span>Pontos {pedido.status === 'ENTREGUE' ? 'ganhos' : 'a ganhar'}</span>
            <span>{pontos} pts</span>
          </div>
        </div>

        <div className="spacer-sm" />
        <button className="btn btn-primary" onClick={onAtualizar}>Atualizar status</button>
      </div>
    </>
  )
}
