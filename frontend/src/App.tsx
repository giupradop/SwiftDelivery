import { useState } from 'react'
import { AbaCliente } from './components/AbaCliente'
import { AbaLoja } from './components/AbaLoja'
import { AbaMotorista } from './components/AbaMotorista'

type Aba = 'cliente' | 'loja' | 'motorista'

function App() {
  // estado: qual aba está ativa. Trocar isso redesenha a tela com a aba certa.
  const [aba, setAba] = useState<Aba>('cliente')

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            Swift<span className="brand-dot">·</span>Delivery
          </div>
          <nav className="tabs">
            <button
              className={`tab ${aba === 'cliente' ? 'active' : ''}`}
              onClick={() => setAba('cliente')}
            >
              Cliente
            </button>
            <button
              className={`tab ${aba === 'loja' ? 'active' : ''}`}
              onClick={() => setAba('loja')}
            >
              Loja
            </button>
            <button
              className={`tab ${aba === 'motorista' ? 'active' : ''}`}
              onClick={() => setAba('motorista')}
            >
              Motorista
            </button>
          </nav>
        </div>
      </header>

      <main className="container">
        {/* As três abas ficam sempre montadas; escondemos as inativas com CSS.
            Assim o estado de cada aba (cliente selecionado, carrinho, etc.) é
            preservado ao trocar de aba, em vez de ser perdido. */}
        <div style={{ display: aba === 'cliente' ? 'block' : 'none' }}>
          <AbaCliente ativa={aba === 'cliente'} />
        </div>
        <div style={{ display: aba === 'loja' ? 'block' : 'none' }}>
          <AbaLoja ativa={aba === 'loja'} />
        </div>
        <div style={{ display: aba === 'motorista' ? 'block' : 'none' }}>
          <AbaMotorista ativa={aba === 'motorista'} />
        </div>
      </main>
    </>
  )
}

export default App
