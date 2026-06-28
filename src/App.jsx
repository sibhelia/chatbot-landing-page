import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Scene from './components/Scene'
import CameraRig from './components/CameraRig'
import ParticleCloud from './components/ParticleCloud'
import Overlay from './components/Overlay'
import SpiralCardCarousel from './components/SpiralCardCarousel'
import LandingPage from './components/LandingPage'
import { SCENES } from './scenes'

const AUTO_MS    = 5500
const TRANS_DUR  = 0.88
const TRANS_EASE = [0.4, 0, 0.2, 1]

export default function App() {
  const [currentScene, setCurrentScene] = useState(0)
  const [page, setPage]                 = useState('scenes')  // 'scenes' | 'carousel' | 'landing'

  const timerRef        = useRef(null)
  const explosionRef    = useRef(0)
  const currentSceneRef = useRef(0)
  const pageRef         = useRef('scenes')
  const lockRef         = useRef(false)

  useEffect(() => { currentSceneRef.current = currentScene }, [currentScene])
  useEffect(() => { pageRef.current = page }, [page])

  // ── Sahne navigasyonu ─────────────────────────────────────────────────────
  const advance = useCallback(() => {
    setCurrentScene(p => (p + 1) % SCENES.length)
    explosionRef.current = 1.0
  }, [])

  const restartTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(advance, AUTO_MS)
  }, [advance])

  const goNext = useCallback(() => {
    advance()
    restartTimer()
  }, [advance, restartTimer])

  // ── Sayfa geçişleri ───────────────────────────────────────────────────────
  const toCarousel = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    if (timerRef.current) clearInterval(timerRef.current)
    setPage('carousel')
    setTimeout(() => { lockRef.current = false }, (TRANS_DUR + 0.25) * 1000)
  }, [])

  const toScenes = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPage('scenes')
    setTimeout(() => { lockRef.current = false }, (TRANS_DUR + 0.25) * 1000)
  }, [])

  const toLanding = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPage('landing')
    setTimeout(() => { lockRef.current = false }, (TRANS_DUR + 0.25) * 1000)
  }, [])

  const toCarouselFromLanding = useCallback(() => {
    if (lockRef.current) return
    lockRef.current = true
    setPage('carousel')
    setTimeout(() => { lockRef.current = false }, (TRANS_DUR + 0.25) * 1000)
  }, [])

  // ── Scenes → Carousel (aşağı scroll) ──────────────────────────────────────
  useEffect(() => {
    const onWheel = (e) => {
      if (pageRef.current !== 'scenes') return
      if (e.deltaY > 0) toCarousel()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [toCarousel])

  // ── Otomatik sahne ilerlemesi ──────────────────────────────────────────────
  useEffect(() => {
    if (page === 'scenes') {
      restartTimer()
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [page, restartTimer])

  const scene = SCENES[currentScene]

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* ── Bölüm 1: Parçacık Sahneleri ──────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: page !== 'scenes' ? '-100%' : '0%' }}
        transition={{ duration: TRANS_DUR, ease: TRANS_EASE }}
      >
        <Scene>
          <ambientLight intensity={1.5} />
          <CameraRig />
          <ParticleCloud targetColor={scene.color} explosionRef={explosionRef} />
        </Scene>
        <Overlay
          scene={scene}
          sceneIndex={currentScene}
          totalScenes={SCENES.length}
          autoMs={AUTO_MS}
          onNext={goNext}
        />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2
                     font-space text-white/18 text-[9px] tracking-[0.45em]
                     uppercase pointer-events-none select-none"
        >
          ↓ aşağı kaydır · holografik dünyayı keşfet
        </motion.div>
      </motion.div>

      {/* ── Bölüm 2: Spiral Carousel ──────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={{ y: '100%' }}
        animate={{
          y: page === 'carousel' ? '0%'
           : page === 'landing'  ? '-100%'
           : '100%'
        }}
        transition={{ duration: TRANS_DUR, ease: TRANS_EASE }}
      >
        <SpiralCardCarousel
          onBack={toScenes}
          onNext={toLanding}
          enabled={page === 'carousel'}
        />
      </motion.div>

      {/* ── Bölüm 3: Landing Page ─────────────────────────────────────────── */}
      <motion.div
        className="absolute inset-0"
        initial={{ y: '100%' }}
        animate={{ y: page === 'landing' ? '0%' : '100%' }}
        transition={{ duration: TRANS_DUR, ease: TRANS_EASE }}
      >
        <LandingPage onBack={toCarouselFromLanding} enabled={page === 'landing'} />
      </motion.div>

    </div>
  )
}
