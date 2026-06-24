import { useEffect, useState } from 'react'
import type { Loja, Pedido, Motorista, StatusPedido } from '../types'
import * as api from '../api'
import { formatBRL, STATUS_LABEL } from '../helpers'

// Rótulo do botão de avançar status, conforme o status atual do pedido.
const ACAO_AVANCAR: Partial<Record<StatusPedido, string>> = {
  AGUARDANDO_ACEITE: 'Aceitar pedido',
  EM_PREPARO: 'Avançar p/ aguardando motorista',
  AGUARDANDO_MOTORISTA: 'Despachar (buscar motorista)',
}

const STATUS_FINALIZADOS = ['ENTREGUE', 'CANCELADO']

export function AbaLoja({ ativa }: { ativa: boolean }) {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [lojaId, setLojaId] = useState('')
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [erro, setErro] = useState('')

  useEffect(() => {
    api.listarLojas().then(setLojas).catch((e) => setErro(e.message))
    api.listarMotoristas().then(setMotoristas).catch(() => {})
  }, [])

  // Ao abrir a aba, atualiza os pedidos da loja selecionada.
  useEffect(() => {
    if (!ativa || !lojaId) return
    carregarPedidos(lojaId)
    api.listarMotoristas().then(setMotoristas).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativa])

  function selecionarLoja(id: string) {
    setLojaId(id)
    setErro('')
    if (id) carregarPedidos(id)
    else setPedidos([])
  }

  function carregarPedidos(id: string) {
    api.listarPedidosDaLoja(id).then(setPedidos).catch((e) => setErro(e.message))
  }

  async function avancar(pedido: Pedido) {
    setErro('')
    try {
      await api.avancarStatus(pedido.id)
      carregarPedidos(lojaId)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  async function cancelar(pedido: Pedido) {
    setErro('')
    try {
      await api.cancelarPedido(pedido.id)
      carregarPedidos(lojaId)
    } catch (e) {
      setErro((e as Error).message)
    }
  }

  function nomeMotorista(id: string | null) {
    if (!id) return null
    return motoristas.find((m) => m.id === id)?.nome ?? 'Atribuído'
  }

  const loja = lojas.find((l) => l.id === lojaId) ?? null
  const ativos = pedidos.filter((p) => !STATUS_FINALIZADOS.includes(p.status))
  const finalizados = pedidos.filter((p) => STATUS_FINALIZADOS.includes(p.status))

  function CartaoPedido({ pedido, acoes }: { pedido: Pedido; acoes: boolean }) {
    const acao = ACAO_AVANCAR[pedido.status]
    const motorista = nomeMotorista(pedido.motoristaId)
    return (
      <div className="pedido-card">
        <div className="pedido-head">
          <div>
            <span className={`badge badge-${pedido.status.toLowerCase()}`}>
              {STATUS_LABEL[pedido.status]}
            </span>
            <div className="pedido-id" style={{ marginTop: 6 }}>#{pedido.id.slice(0, 8)}</div>
          </div>
          <strong>{formatBRL(pedido.total)}</strong>
        </div>

        <div className="pedido-itens">
          {pedido.itens.map((i) => `${i.quantidade}× ${i.nomeProduto}`).join(', ')}
        </div>

        {motorista && (
          <p className="muted" style={{ marginBottom: 10 }}>
            Motorista: <strong>{motorista}</strong>
          </p>
        )}

        {acoes && (acao || pedido.status === 'AGUARDANDO_ACEITE') && (
          <div className="pedido-actions">
            {acao && (
              <button className="btn btn-primary btn-sm" onClick={() => avancar(pedido)}>{acao}</button>
            )}
            {pedido.status === 'AGUARDANDO_ACEITE' && (
              <button className="btn btn-ghost btn-sm" onClick={() => cancelar(pedido)}>Cancelar</button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h1 className="section-title">Painel da loja</h1>
      <p className="section-sub">Gerencie os pedidos recebidos e avance o status de cada um.</p>

      {erro && <div className="alert alert-erro">{erro}</div>}

      <div className="card">
        <div className="row-inline" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ flex: 1, marginBottom: 0 }}>
            <label className="label">Loja</label>
            <select className="select" value={lojaId} onChange={(e) => selecionarLoja(e.target.value)}>
              <option value="">Selecione uma loja...</option>
              {lojas.map((l) => (
                <option key={l.id} value={l.id}>{l.nome}</option>
              ))}
            </select>
          </div>
          {lojaId && (
            <button className="btn btn-ghost" onClick={() => carregarPedidos(lojaId)}>Atualizar</button>
          )}
        </div>
      </div>

      {/* Cabeçalho da loja selecionada */}
      {loja && (
        <>
          <div className="spacer" />
          <div className="card">
            <div className="loja-nome" style={{ fontSize: 19 }}>{loja.nome}</div>
            <div className="loja-tipo">{loja.tipo.toLowerCase()}</div>
            <p className="muted" style={{ marginTop: 8 }}>{loja.descricao}</p>
            <div className="loja-meta" style={{ marginTop: 10 }}>
              <span>★ {loja.avaliacaoMedia.toFixed(1)} ({loja.totalAvaliacoes})</span>
              <span>{loja.horarioAbertura}–{loja.horarioFechamento}</span>
              <span>{loja.aberta ? 'Aberta' : 'Fechada'}</span>
              <span>{ativos.length} pedido(s) ativo(s)</span>
            </div>
          </div>
        </>
      )}

      {lojaId && (
        <>
          <div className="spacer" />
          <div className="card-title">Pedidos ativos</div>
          {ativos.length === 0 ? (
            <div className="empty">Nenhum pedido ativo no momento.</div>
          ) : (
            ativos.map((p) => <CartaoPedido key={p.id} pedido={p} acoes={true} />)
          )}

          {finalizados.length > 0 && (
            <>
              <div className="spacer" />
              <div className="card-title">Finalizados</div>
              {finalizados.map((p) => <CartaoPedido key={p.id} pedido={p} acoes={false} />)}
            </>
          )}
        </>
      )}
    </div>
  )
}
