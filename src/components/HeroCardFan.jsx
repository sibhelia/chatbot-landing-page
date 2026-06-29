/**
 * HeroCardFan.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * Giriş (hero) sağ alanındaki YAZISIZ dekoratif kart yelpazesi —
 * Card_Arc_Scroll yapısının, scroll yerine OTOMATİK açılan ve yavaşça dönen
 * bir varyantı.
 *
 * • Mount olunca kartlar istiften yelpazeye açılır (spring).
 * • Tüm yelpaze çok yavaş döner (canlı ama dikkat dağıtmayan).
 * • Etiket/yazı YOKTUR — yalnızca küçük görsel kartlar.
 * • Giriş slaytında bu alan sabit kalır; yalnızca soldaki metinler değişir.
 *   Görseller placeholder (/card_bg_*.png) — ürün görselleriyle değiştirilebilir.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

const GREEN_LL = '#34d399'
const GREEN_L  = '#10b981'
const NAVY     = '#60a5fa'
const MINT     = '#6ee7b7'

const CARDS = [
  { img: '/card_bg_4.png', accent: GREEN_LL },
  { img: '/card_bg_3.png', accent: GREEN_L  },
  { img: '/card_bg_5.png', accent: NAVY     },
  { img: '/card_bg_2.png', accent: MINT     },
  { img: '/card_bg_1.png', accent: GREEN_LL },
  { img: '/card_bg_6.png', accent: GREEN_L  },
  { img: '/card_bg_4.png', accent: MINT     },
]

const BASE_W = 210
const BASE_H = 132
const RADIUS = 14

const getFinalRot = (i, total) => -60 + i * (360 / total)

function computeStackedOffset(angleDeg, w, h) {
  const t = (angleDeg * Math.PI) / 180
  const cx = w / 2
  const cy = -h / 2
  return { x: -(cx * Math.cos(t) - cy * Math.sin(t)), y: -(cx * Math.sin(t) + cy * Math.cos(t)) }
}

function Card({ index, total, progress, img, accent }) {
  const rotate = useTransform(progress, [0, 1], [0, getFinalRot(index, total)])
  return (
    <motion.div style={{
      position: 'absolute', width: BASE_W, height: BASE_H, left: 0, bottom: 0,
      transformOrigin: 'left bottom', zIndex: total - index, borderRadius: RADIUS, overflow: 'hidden', rotate,
      border: `1px solid ${accent}40`, boxShadow: `0 16px 40px rgba(0,0,0,0.55), 0 0 22px ${accent}1f`,
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.05) 42%, transparent 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: `linear-gradient(160deg, ${accent}18, transparent 60%)` }}/>
    </motion.div>
  )
}

export default function HeroCardFan() {
  // Otomatik açılma: progress 0 → 1 (spring)
  const progress = useSpring(0, { stiffness: 45, damping: 16 })
  useEffect(() => {
    const t = setTimeout(() => progress.set(1), 450)
    return () => clearTimeout(t)
  }, [progress])

  const { x: sx, y: sy } = computeStackedOffset(0, BASE_W, BASE_H)
  const gx = useTransform(progress, [0, 1], [sx, 0])
  const gy = useTransform(progress, [0, 1], [sy, 0])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Yavaş dönen yelpaze grubu */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'relative', width: 0, height: 0, x: gx, y: gy }}>
        {CARDS.map((c, i) => (
          <Card key={i} index={i} total={CARDS.length} progress={progress} img={c.img} accent={c.accent} />
        ))}
      </motion.div>
    </div>
  )
}
