/**
 * World.jsx
 * ─────────────────────────────────────────────────────────────
 * TEK paylaşılan 3B dünya. Yıldızlar (ParticleCloud), hurricane
 * sarmalı ve fıskiye patlaması AYNI Canvas + AYNI kamera üzerinde
 * render edilir → tam bütünlük. Tüm sayfaların arkasında sabit
 * durur; HTML bölümleri bunun üstünde kayar.
 *
 * ┌─ GÖRSEL AYAR NOKTALARI ───────────────────────────────────┐
 * │ Canlı önizlemede çerçeveleme biraz farklı durursa aşağıdaki │
 * │ sabitleri değiştirmen yeterli (kod mantığına dokunmadan):   │
 * │  • CAM_Z / CAM_FOV   → genel yakınlık / geniş açı           │
 * │  • HURRICANE_SCALE   → sarmalın büyüklüğü                   │
 * │  • HURRICANE_POS     → sarmalın konumu (z'yi negatif tut)   │
 * └────────────────────────────────────────────────────────────┘
 */
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import CameraRig from './CameraRig'
import ParticleCloud from './ParticleCloud'
import HurricaneVortex from './HurricaneVortex'
import FountainBurst from './FountainBurst'

const CAM_Z           = 2.8
const CAM_FOV         = 66
const HURRICANE_SCALE = 0.7    // DNA sarmalının boyu/büyüklüğü
const HURRICANE_POS   = [0, 0, -1.2]

export default function World({ starColor, explosionRef, page, burst, onBurstDone }) {
  return (
    <Canvas
      style={{ position: 'absolute', inset: 0, background: '#000000', pointerEvents: 'none' }}
      camera={{ position: [0, 0, CAM_Z], fov: CAM_FOV }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
    >
      <ambientLight intensity={1.3} />
      <CameraRig />

      {/* Yıldızlar — her sayfada sürekli */}
      <ParticleCloud targetColor={starColor} explosionRef={explosionRef} />

      {/* Hurricane sarmalı — carousel'de belirginleşir, diğer sayfalarda solar */}
      <group scale={HURRICANE_SCALE} position={HURRICANE_POS}>
        <HurricaneVortex active={page === 'carousel'} />
      </group>

      {/* Fıskiye patlaması — sadece geçişte mount olur, hurricane'den fışkırır */}
      {burst && <FountainBurst onDone={onBurstDone} />}
    </Canvas>
  )
}
