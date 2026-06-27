import { useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import HoloCarousel from './HoloCarousel'

const CARD_COUNT   = 6     // HoloCarousel ile senkron — 6 kart, 60° aralıklı
const SNAP_LOCK_MS = 600   // debounce: lerp delta*7.0 ile ~400ms'de %95 tamamlanır

// ─── CameraSetup ─────────────────────────────────────────────────────────────
// Canvas içinde: kamerayı sahneleme noktasına yönlendirir.
// position [0, 2.5, 6.5] → kartlar radius=4.0'da, bulut içerde (R_MAX=3.0)
//   ön kart 2.5 birim uzakta → ekranda belirgin ve dramatik
//   fov=60 → yatay alanda 3 kart eş zamanlı görünür (wide-carousel hissi)
// lookAt(0,0,0)            → tünel perspektifi; derinlik ve hacim hissi.
function CameraSetup() {
  const { camera } = useThree()
  useEffect(() => {
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
  }, [camera])
  return null
}

// ─── CarouselSection ─────────────────────────────────────────────────────────
/**
 * Kozmik nebula tüneli + 6 sinematik geniş kart.
 *
 * Scroll mekanizması (discrete snap):
 *   - Aşağı  → activeIndex++ (mod 6)  → bir sonraki kart snap ile öne gelir
 *   - Yukarı → activeIndex-- (min 0)   → bir önceki kart öne gelir
 *   - Yukarı + index=0                 → onBack() → scenes bölümüne dön
 *   - SNAP_LOCK_MS debounce: çift tetikleme yok, animasyon temiz biter
 *
 * enabled prop: Framer Motion her zaman mount'lu tutar;
 *   carousel aktif değilken scroll olaylarını yok say.
 */
export default function CarouselSection({ onBack, enabled }) {
  const activeIndex = useRef(0)     // şu an odaktaki kart (0-5)
  const scrollLock  = useRef(false) // snap animasyonu sürerken ikinci scroll'u engelle

  useEffect(() => {
    const onWheel = (e) => {
      if (!enabled)           return
      if (scrollLock.current) return

      if (e.deltaY < 0) {
        // Yukarı scroll
        if (activeIndex.current === 0) {
          onBack?.()   // ilk kart → scenes'e geri dön
          return
        }
        scrollLock.current = true
        activeIndex.current -= 1
      } else {
        // Aşağı scroll → sonraki kart (6'dan sonra tekrar 0)
        scrollLock.current = true
        activeIndex.current = (activeIndex.current + 1) % CARD_COUNT
      }

      setTimeout(() => { scrollLock.current = false }, SNAP_LOCK_MS)
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [onBack, enabled])

  return (
    <div className="absolute inset-0" style={{ background: '#000510' }}>

      {/* ── 3D Canvas ───────────────────────────────────────────────────────── */}
      {/*
        Kamera: position [0, 2.5, 8], fov 55
          - Kozmik bulut yarıçapı 4.2 → fov:55'te tam çerçeveye girer
          - Kart yörüngesi 2.8 → ön kart 5.2 birim uzakta, görüntüde belirgin
          - Hafif yukarıdan bakış → sahneye derinlik ve hacim katar
        pointerEvents: 'auto' → R3F onPointerOver / onPointerOut için zorunlu
      */}
      <Canvas
        style={{
          position:      'absolute',
          top:           0,
          left:          0,
          width:         '100%',
          height:        '100%',
          pointerEvents: 'auto',
        }}
        camera={{ position: [0, 2.5, 6.5], fov: 60 }}
        gl={{
          antialias:           true,
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.6,
        }}
      >
        <CameraSetup />

        {/*
          Işıklandırma — 7 renkli nokta ışığı:
          MeshPhysicalMaterial glass + iridescence, aktif ışık kaynaklarına ihtiyaç duyar.
          Renkli ışıklar camın üzerinde nebula renklerini yansıtır; derinlik + görkemi artırır.
          Daha geniş sahne (radius 2.8 kart, radius 4.2 bulut) için ışık konumları ayarlandı.
        */}
        <ambientLight intensity={0.30} />

        {/* Üst beyaz spot — nebula tünelinin zirvesinden aşağı döker */}
        <pointLight position={[ 0,  9,  2]} intensity={70}  color="#ffffff" />

        {/* Sol magenta — pembe nebula yansıması */}
        <pointLight position={[-7,  3,  5]} intensity={52}  color="#ff44aa" />

        {/* Sağ kobalt mavi — mavi nebula yansıması */}
        <pointLight position={[ 7, -2,  5]} intensity={48}  color="#2255ff" />

        {/* Alt amber — kart alt kenarlarına dramatik renk */}
        <pointLight position={[ 0, -8,  2]} intensity={36}  color="#ffaa33" />

        {/* Ön dolgu — aktif ön kart yüzeyini aydınlatır */}
        <pointLight position={[ 0,  2,  9]} intensity={22}  color="#cce8ff" />

        {/* Arka sol mor — mor nebula derinlik ışığı */}
        <pointLight position={[-5,  5, -4]} intensity={32}  color="#aa44ff" />

        {/* Arka sağ zümrüt — yeşil nebula kenar parıltısı */}
        <pointLight position={[ 5, -4, -4]} intensity={26}  color="#00ffaa" />

        <HoloCarousel activeIndexRef={activeIndex} />
      </Canvas>

      {/* ── Minimal UI Overlay ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-10 p-10 pointer-events-none select-none flex flex-col justify-between">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.75, ease: 'easeOut' }}
          className="flex items-center justify-between"
        >
          <span className="font-orbitron text-white/22 text-[10px] tracking-[0.45em] uppercase">
            ◈ HOLOGRAPHIC ARCHIVE
          </span>
          <span className="font-space text-white/12 text-[9px] tracking-[0.30em] uppercase">
            SCROLL · EXPLORE
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 1.0 }}
          className="font-space text-white/18 text-[9px] tracking-[0.40em] uppercase"
        >
          ↑ yukarı kaydır · geri dön
        </motion.div>

      </div>
    </div>
  )
}
