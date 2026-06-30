/**
 * StatsCounterPro.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot SAYILAR bölümü — Framer'daki "StatsCounterPro" tasarımının saf React +
 * Framer Motion'a uyarlanmış sürümü.
 *
 * Özellikler:
 *  • Sayılar görünür olunca SIFIRDAN hedefe doğru EASING'li sayar (expoOut).
 *  • Her öğe slide-up + blur ile gelir; aralarında stagger gecikme.
 *  • Üstte dairesel ikon, gradient (beyaz→yeşil) sayı + ışıma (glow).
 *  • Öğeler arasında gradient ayraç çizgileri.
 *  • Hover'da yükselme + ışımanın güçlenmesi.
 *
 * Framer'a özgü API'ler (addPropertyControls / ControlType / RenderTarget)
 * çıkarıldı; props yerine sabit yapılandırma kullanıldı. Tema: marka yeşili +
 * beyaz + lacivert.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'

const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'
const MINT     = '#6ee7b7'
const NAVY     = '#60a5fa'

// ─── Yerleşik ikonlar (SVG) ───────────────────────────────────────────────────
const ICONS = {
  zap:   <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  globe: <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
}

function Icon({ name, color, size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  )
}

// ─── QABot rakamları ──────────────────────────────────────────────────────────
const STATS = [
  { value: 3,   decimals: 0, suffix: ' sn', label: 'ORTALAMA YANIT SÜRESİ', icon: 'zap',   accent: GREEN_LL },
  { value: 2,   decimals: 0, suffix: 'x',   label: 'HİBRİT ERİŞİM KATMANI', icon: 'globe', accent: GREEN_L  },
  { value: 24,  decimals: 0, suffix: '/7',  label: 'KESİNTİSİZ ERİŞİM',     icon: 'check', accent: MINT     },
  { value: 100, decimals: 0, suffix: '%',   label: 'KAYNAĞA DAYALI YANIT',  icon: 'award', accent: NAVY     },
]

const DURATION = 2000   // sayma süresi (ms)
const STAGGER  = 160    // öğeler arası gecikme (ms)

// expoOut easing — sona doğru zarifçe yavaşlar
const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

function StatItem({ s, i, inView }) {
  const [hovered, setHover] = useState(false)
  const count = useMotionValue(0)

  const display = useTransform(count, (latest) => {
    if (latest >= s.value * 0.999) {
      return s.decimals ? s.value.toFixed(s.decimals) : Math.round(s.value)
    }
    // Küçük sayılarda animasyon sırasında daha hareketli durması için 1 ondalık göster
    if (s.value <= 5) return latest.toFixed(1)
    return Math.round(latest)
  })

  // Görünür olunca sıfırdan hedefe say
  useEffect(() => {
    if (inView) {
      const controls = animate(count, s.value, {
        duration: 1.8,
        delay: i * 0.15,
        ease: "easeOut"
      })
      return () => controls.stop()
    } else {
      count.set(0)
    }
  }, [inView, s.value, i, count])

  return (
    <motion.div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 26, filter: 'blur(10px)' }}
      animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 26, filter: 'blur(10px)' }}
      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 1rem' }}
    >
      {/* İkon */}
      <motion.div animate={{ scale: hovered ? 1.12 : 1 }} transition={{ type: 'spring', stiffness: 300, damping: 16 }}
        style={{ width: 52, height: 52, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `${s.accent}1a`, border: `1px solid ${s.accent}45`, marginBottom: '1.2rem',
          boxShadow: hovered ? `0 0 24px ${s.accent}44` : 'none', transition: 'box-shadow 0.3s' }}>
        <Icon name={s.icon} color={s.accent} />
      </motion.div>

      {/* Sayı (gradient + glow) */}
      <div style={{
        fontFamily: F_ORBIT, fontWeight: 900, fontSize: 'clamp(2.4rem, 5vw, 4.4rem)', lineHeight: 1,
        background: `linear-gradient(135deg, #ffffff 0%, ${s.accent} 100%)`,
        WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent',
        textShadow: hovered ? `0 0 34px ${s.accent}77` : `0 0 18px ${s.accent}3a`, transition: 'text-shadow 0.3s ease',
        display: 'flex', alignItems: 'baseline', justifyContent: 'center'
      }}>
        <motion.span>{display}</motion.span>
        <span>{s.suffix}</span>
      </div>

      {/* Etiket */}
      <p style={{ fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginTop: '0.9rem' }}>
        {s.label}
      </p>
    </motion.div>
  )
}

export default function StatsCounterPro() {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div ref={ref} style={{
      padding: '6rem 4rem',
      background: `linear-gradient(180deg, transparent 0%, rgba(4,120,87,0.10) 50%, transparent 100%)`,
      borderTop: `1px solid ${GREEN_L}1f`, borderBottom: `1px solid ${GREEN_L}1f`,
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch', flex: '1 1 0', minWidth: 0 }}>
            <StatItem s={s} i={i} inView={inView} />
            {/* Gradient ayraç (son öğe hariç) */}
            {i < STATS.length - 1 && (
              <div aria-hidden style={{ width: '1px', alignSelf: 'center', height: '70px', flexShrink: 0,
                background: `linear-gradient(180deg, transparent, ${GREEN_L}55, ${GREEN_LL}66, ${GREEN_L}55, transparent)` }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
