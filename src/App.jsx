import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import World from './components/World'
import Overlay from './components/Overlay'
import FeatureCarousel from './components/FeatureCarousel'
import LandingPage from './components/LandingPage'
import SideRail from './components/SideRail'
import { SCENES } from './scenes'

const AUTO_MS    = 3000   // giriş slaytı: her 3 sn'de bir otomatik değişir ve döngüye girer
const TRANS_DUR  = 0.88
const TRANS_EASE = [0.4, 0, 0.2, 1]

// Sahneler dışında tüm sayfalarda kullanılan birleşik yıldız tonu (giriş buz-mavisi)
const UNIFIED_COLOR = '#c7f5e2'   // marka yeşili nane-beyazı (sahneler dışı yıldız tonu)

const PAGES = ['scenes', 'carousel', 'landing']

export default function App() {
  const [currentScene, setCurrentScene] = useState(0)
  const [page, setPage]                 = useState('scenes')  // 'scenes' | 'carousel' | 'landing'
  const [burst, setBurst]               = useState(false)     // geçiş patlaması aktif mi

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

  // ── Birleşik sayfa geçişi ─────────────────────────────────────────────────
  // Tüm panel geçişlerini tek noktadan yönetir; scenes→carousel'de görkemli
  // patlama + global parçacık bulutu patlaması tetiklenir.
  const goPage = useCallback((target) => {
    if (lockRef.current) return
    if (target === pageRef.current) return
    if (!PAGES.includes(target)) return

    lockRef.current = true

    // Görkemli geçiş: yalnızca scenes ↔ carousel sınırında
    const grand =
      (pageRef.current === 'scenes'   && target === 'carousel') ||
      (pageRef.current === 'carousel' && target === 'scenes')

    if (grand) {
      setBurst(true)
      explosionRef.current = 1.35   // global bulut da patlar
    }

    if (timerRef.current) clearInterval(timerRef.current)
    setPage(target)
    setTimeout(() => { lockRef.current = false }, (TRANS_DUR + 0.25) * 1000)
  }, [])

  // ── Scenes → Carousel (aşağı scroll) ──────────────────────────────────────
  useEffect(() => {
    const onWheel = (e) => {
      if (pageRef.current !== 'scenes') return
      if (e.deltaY > 0) goPage('carousel')
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [goPage])

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

  // Global yıldız rengi: sahnelerde sahne rengi, diğer sayfalarda birleşik ton
  const starColor = page === 'scenes' ? scene.color : UNIFIED_COLOR

  return (
    <div className="relative w-screen h-screen overflow-hidden">

      {/* ══ TEK PAYLAŞILAN 3B DÜNYA ═══════════════════════════════════════════
          Yıldızlar + hurricane + fıskiye patlaması AYNI canvas/kamerada.
          Tüm sayfaların arkasında sabit durur; paneller üzerinde kayar. */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <World
          starColor={starColor}
          explosionRef={explosionRef}
          page={page}
          burst={burst}
          onBurstDone={() => setBurst(false)}
        />
      </div>

      {/* ══ KAYAN PANELLER (şeffaf arka plan → yıldızlar görünür) ════════════ */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>

        {/* ── Bölüm 1: Giriş metin katmanı ──────────────────────────────────── */}
        <motion.div
          className="absolute inset-0"
          style={{ pointerEvents: page === 'scenes' ? 'auto' : 'none' }}
          animate={{ y: page !== 'scenes' ? '-100%' : '0%' }}
          transition={{ duration: TRANS_DUR, ease: TRANS_EASE }}
        >
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
          <FeatureCarousel
            onBack={() => goPage('scenes')}
            onNext={() => goPage('landing')}
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
          <LandingPage onBack={() => goPage('carousel')} enabled={page === 'landing'} />
        </motion.div>
      </div>

      {/* ══ TÜM SİTE BOYU NAVİGASYON RAYI ════════════════════════════════════ */}
      <SideRail
        pages={PAGES}
        current={page}
        onJump={goPage}
        labels={{ scenes: 'GİRİŞ', carousel: 'GALERİ', landing: 'ÜRÜN' }}
      />

    </div>
  )
}
