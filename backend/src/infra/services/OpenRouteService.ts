import dotenv from 'dotenv'

dotenv.config()

const ORS_URL = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson'

export interface ResultadoRota {
  distanciaKm: number
  geometria: any // GeoJSON LineString — usado pelo Leaflet no frontend
}

// Descreve apenas o pedaço da resposta do ORS que utilizamos.
interface RespostaORS {
  features: Array<{
    properties: { summary: { distance: number } }
    geometry: any
  }>
}

// Cache em memória das rotas já calculadas, indexado pelas coordenadas.
// Como loja e endereço têm posição fixa, o resultado nunca muda — então
// guardamos para não chamar a API do ORS duas vezes para o mesmo trajeto.
const cacheRotas = new Map<string, ResultadoRota>()

// Calcula a rota real de carro entre dois pontos usando a API OpenRouteService.
// Atenção: o ORS espera as coordenadas na ordem [longitude, latitude].
export async function calcularRota(
  origem: { latitude: number; longitude: number },
  destino: { latitude: number; longitude: number },
): Promise<ResultadoRota> {
  // monta uma chave única para o trajeto e tenta achar no cache
  const chave = `${origem.latitude},${origem.longitude}->${destino.latitude},${destino.longitude}`
  const emCache = cacheRotas.get(chave)
  if (emCache) return emCache

  const apiKey = process.env.ORS_API_KEY
  if (!apiKey) throw new Error('ORS_API_KEY não configurada no .env')

  const resposta = await fetch(ORS_URL, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      coordinates: [
        [origem.longitude, origem.latitude],
        [destino.longitude, destino.latitude],
      ],
    }),
  })

  if (!resposta.ok) {
    throw new Error(`Erro ao consultar OpenRouteService (status ${resposta.status})`)
  }

  const dados = (await resposta.json()) as RespostaORS
  const feature = dados.features[0]

  // distância vem em metros — convertemos para km
  const distanciaMetros = feature.properties.summary.distance
  const distanciaKm = distanciaMetros / 1000

  return {
    distanciaKm,
    geometria: feature.geometry,
  }
}
