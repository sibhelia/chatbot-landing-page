import { Canvas } from '@react-three/fiber'

/**
 * Scene
 * React Three Fiber Canvas wrapper.
 * - Tam ekran (100vw × 100vh), siyah arka plan
 * - Kamera: position [0, 0, 2], fov 60
 * - pointer-events: none → HTML katmanı tıklamaları bloke etmez
 */
export default function Scene({ children }) {
  return (
    <Canvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000000',
        pointerEvents: 'none',
      }}
      camera={{ position: [0, 0, 2], fov: 60 }}
    >
      {children}
    </Canvas>
  )
}
