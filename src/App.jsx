import { useState, useEffect, useCallback } from 'react'
import Scene from './components/Scene'
import ParticleCloud from './components/ParticleCloud'
import Overlay from './components/Overlay'
import { SCENES } from './scenes'

export default function App() {
  const [currentScene, setCurrentScene] = useState(0)

  // Kaydırma ve ok butonu: throttled, dairesel geçiş
  const goNext = useCallback(() => {
    setCurrentScene(p => (p + 1) % SCENES.length)
  }, [])

  const goPrev = useCallback(() => {
    setCurrentScene(p => (p - 1 + SCENES.length) % SCENES.length)
  }, [])

  useEffect(() => {
    let locked = false
    const onWheel = (e) => {
      if (locked) return
      locked = true
      if (e.deltaY > 0) goNext()
      else goPrev()
      setTimeout(() => { locked = false }, 1100) // throttle: sahne geçişi bitmeden tekrar tetiklenmesin
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [goNext, goPrev])

  const scene = SCENES[currentScene]

  return (
    <div className="relative w-screen h-screen">
      {/* R3F Canvas — tam ekran, pointer-events: none */}
      <Scene>
        <ambientLight intensity={1.5} />
        <ParticleCloud targetColor={scene.color} />
      </Scene>

      {/* Sinematik HTML katmanı */}
      <Overlay
        scene={scene}
        sceneIndex={currentScene}
        totalScenes={SCENES.length}
        onNext={goNext}
      />
    </div>
  )
}
