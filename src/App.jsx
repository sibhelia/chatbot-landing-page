import Scene from './components/Scene'
import ParticleCloud from './components/ParticleCloud'
import Overlay from './components/Overlay'

export default function App() {
  return (
    <div className="relative w-screen h-screen">
      {/* R3F Canvas — tam ekran, pointer-events: none */}
      <Scene>
        <ambientLight intensity={1.5} />
        <ParticleCloud />
      </Scene>

      {/* Sinematik HTML katmanı — Canvas'ın üstünde, z-index: 10 */}
      <Overlay />
    </div>
  )
}
