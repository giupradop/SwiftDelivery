import { useEffect, useState } from 'react'
import type { Motorista, Pedido, Loja, ResultadoRota } from '../types'
import * as api from '../api'
import { formatBRL, STATUS_LABEL } from '../helpers'
import { Mapa } from './Mapa'

export function AbaMotorista({ ativa }: { ativa: boolean }) {
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [lojas, setLojas] = useState<Loja[]>([])
  const [motoristaId, setMotoristaId] = useState('')

  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loja, setLoja] = useState<Loja | null>(null)
  const [rota, setRota] = useState<ResultadoRota | null>(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    api.listarMotoristas().then(setMotoristas).catch((e) => setErro(e.message))
    api.listarLojas().then(setLojas).catch(() => {})
  }, [])

  // Sempre que a aba do motorista é aberta, atualiza a lista (um motorista pode
  // ter sido alocado a um pedido enquanto o usuário estava em outra aba) e
  // recarrega a entrega do motorista selecionado.
  useEffect(() => {
    if (!ativa) return
    let cancelado = false
    api.listarMotoristas().then((lista) => {
      if (cancelado) return
      setMotoristas(lista)
      if (motoristaId) {
        const m = lista.find((x) => x.id === motoristaId)
        if (m) carregarEntrega(m, lojas)
      }
    }).catch(() => {})
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativa])

  // Carrega a entrega atual do motorista (se houver um pedido atribuído).
  async function carregarEntrega(motorista: Motorista, listaLojas: Loja[]) {
    setErro('')
    setSucesso('')
    setRota(null)
    setLoja(null)
    setPedido(null)

    if (!motorista.pedidoAtualId) return

    setCarregando(true)
    try {
      const ped = await api.buscarPedido(motorista.pedidoAtualId)
      setPedido(ped)
      setLoja(listaLojas.find((l) => l.id === ped.lojaId) ?? null)
      // busca a rota (geometria) para desenhar no mapa
      const r = await api.buscarRota(ped.id)
      setRota(r)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  function selecionarMotorista(id: string) {
    setMotoristaId(id)
    const m = motoristas.find((x) => x.id === id)
    if (m) carregarEntrega(m, lojas)
    else {
      setPedido(null)
      setRota(null)
      setLoja(null)
    }
  }

  async function confirmar() {
    if (!pedido) return
    setCarregando(true)
    setErro('')
    try {
      await api.confirmarEntrega(pedido.id)
      // recarrega os motoristas (o selecionado foi liberado)
      const lista = await api.listarMotoristas()
      setMotoristas(lista)
      setPedido(null)
      setRota(null)
      setLoja(null)
      setSucesso('Entrega confirmada! Você está disponível para novas entregas.')
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }

  const motoristaAtual = motoristas.find((m) => m.id === motoristaId) ?? null

  return (
    <div>
      <h1 className="section-title">Painel do motorista</h1>
      <p className="section-sub">Selecione seu perfil para ver a entrega atual e o trajeto.</p>

      {erro && <div className="alert alert-erro">{erro}</div>}
      {sucesso && <div className="alert alert-ok">{sucesso}</div>}

      <div className="card">
        <div className="field" style={{ marginBottom: 0 }}>
          <label className="label">Motorista</label>
          <select
            className="select"
            value={motoristaId}
            onChange={(e) => selecionarMotorista(e.target.value)}
          >
            <option value="">Selecione um motorista...</option>
            {motoristas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome} — {m.disponivel ? 'disponível' : 'em entrega'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {carregando && <div className="loading">Carregando...</div>}

      {/* Sem entrega atribuída */}
      {motoristaAtual && !pedido && !carregando && (
        <>
          <div className="spacer" />
          <div className="empty">
            {motoristaAtual.veiculo}
            <br />
            Nenhuma entrega no momento.
          </div>
        </>
      )}

      {/* Com entrega: mapa + detalhes + confirmação */}
      {pedido && loja && (
        <>
          <div className="spacer" />
          <div className="card">
            <div className="pedido-head">
              <span className={`badge badge-${pedido.status.toLowerCase()}`}>
                {STATUS_LABEL[pedido.status]}
              </span>
              <strong>{formatBRL(pedido.total)}</strong>
            </div>

            <p className="muted">
              <strong>Retirada:</strong> {loja.nome}
            </p>
            <p className="muted" style={{ marginBottom: 12 }}>
              <strong>Entrega:</strong> {pedido.enderecoEntrega.rua}, {pedido.enderecoEntrega.numero} —{' '}
              {pedido.enderecoEntrega.bairro}
            </p>

            {rota && (
              <>
                <Mapa
                  origem={{ lat: loja.latitude, lng: loja.longitude, label: loja.nome }}
                  destino={{
                    lat: pedido.enderecoEntrega.latitude,
                    lng: pedido.enderecoEntrega.longitude,
                    label: 'Entrega',
                  }}
                  geometria={rota.geometria}
                />
                <p className="muted" style={{ marginTop: 10 }}>
                  Distância do trajeto: <strong>{rota.distanciaKm.toFixed(1)} km</strong>
                </p>
              </>
            )}

            <div className="spacer-sm" />
            <button
              className="btn btn-primary btn-block"
              onClick={confirmar}
              disabled={carregando}
            >
              Confirmar entrega
            </button>
          </div>
        </>
      )}
    </div>
  )
}
