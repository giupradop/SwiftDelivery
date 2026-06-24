import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import clienteRoutes from './infra/http/routes/clienteRoutes'
import lojaRoutes from './infra/http/routes/lojaRoutes'
import motoristaRoutes from './infra/http/routes/motoristaRoutes'
import pedidoRoutes from './infra/http/routes/pedidoRoutes'
import cupomRoutes from './infra/http/routes/cupomRoutes'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3000

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/clientes', clienteRoutes)
app.use('/lojas', lojaRoutes)
app.use('/motoristas', motoristaRoutes)
app.use('/pedidos', pedidoRoutes)
app.use('/cupons', cupomRoutes)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})

export default app
