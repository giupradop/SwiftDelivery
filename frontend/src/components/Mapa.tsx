import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Ícones customizados (emoji) — evita o problema das imagens padrão do Leaflet
// quebrarem quando empacotadas pelo Vite.
const iconeLoja = L.divIcon({
  html: '<div class="map-pin">🏪</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
})

const iconeCasa = L.divIcon({
  html: '<div class="map-pin">📍</div>',
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 28],
})

interface Ponto {
  lat: number
  lng: number
  label: string
}

interface MapaProps {
  origem: Ponto // loja
  destino: Ponto // cliente
  geometria: GeoJSON.LineString
}

// Ajusta o zoom/centro do mapa para enquadrar os dois pontos.
function AjustarZoom({ origem, destino }: { origem: Ponto; destino: Ponto }) {
  const map = useMap()
  useEffect(() => {
    const limites = L.latLngBounds(
      [origem.lat, origem.lng],
      [destino.lat, destino.lng],
    )
    map.fitBounds(limites, { padding: [50, 50] })
  }, [map, origem, destino])
  return null
}

// Recalcula o tamanho do mapa quando o container muda de tamanho.
// Necessário porque, ao trocar de aba, o mapa fica escondido (tamanho 0) e
// ao reaparecer o Leaflet precisa ser avisado para renderizar os tiles certos.
function InvalidarTamanho() {
  const map = useMap()
  useEffect(() => {
    const observador = new ResizeObserver(() => map.invalidateSize())
    observador.observe(map.getContainer())
    return () => observador.disconnect()
  }, [map])
  return null
}

export function Mapa({ origem, destino, geometria }: MapaProps) {
  return (
    <div className="map-wrap">
      <MapContainer
        center={[origem.lat, origem.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Rota desenhada (geometria vinda do OpenRouteService) */}
        <GeoJSON data={geometria} style={{ color: '#e8503a', weight: 5, opacity: 0.8 }} />

        {/* Marcadores */}
        <Marker position={[origem.lat, origem.lng]} icon={iconeLoja}>
          <Popup>{origem.label}</Popup>
        </Marker>
        <Marker position={[destino.lat, destino.lng]} icon={iconeCasa}>
          <Popup>{destino.label}</Popup>
        </Marker>

        <AjustarZoom origem={origem} destino={destino} />
        <InvalidarTamanho />
      </MapContainer>
    </div>
  )
}
