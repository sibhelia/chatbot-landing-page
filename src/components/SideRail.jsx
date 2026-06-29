/**
 * SideRail.jsx  (premium minimal)
 * ─────────────────────────────────────────────────────────────
 * Sağ kenarda zarif, ince bir dikey ilerleme rayı. Hairline çizgi,
 * mikro tipografi numaralar ve parlayan ince bir işaretçi ile lüks
 * minimal bir his. Bölümler (giriş / galeri / ürün) arasında tek
 * tıkla hızlı geçiş — özellikle carousel'den hızlıca yukarı dönmek.
 * ─────────────────────────────────────────────────────────────
 */
import { motion } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'
const ACCENT  = '#34d399'   // marka yeşili

export default function SideRail({ pages, current, onJump, labels = {} }) {
  const currentIdx = Math.max(0, pages.indexOf(current))
  const lastIdx    = pages.length - 1
  const progressPct = lastIdx === 0 ? 0 : (currentIdx / lastIdx) * 100

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5 }}
      style={{
        position:       'fixed',
        top:            0,
        right:          '2rem',
        height:         '100vh',
        zIndex:         300,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'flex-end',
        pointerEvents:  'none',
      }}
    >
      {/* İnce hairline ray */}
      <div
        style={{
          position:      'relative',
          height:        '46vh',
          width:         '1px',
          background:    'rgba(255,255,255,0.10)',
          pointerEvents: 'auto',
        }}
      >
        {/* Dolu ilerleme — ince parlayan çizgi */}
        <motion.div
          animate={{ height: `${progressPct}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position:   'absolute',
            top:        0,
            left:       0,
            width:      '1px',
            background: `linear-gradient(180deg, rgba(255,255,255,0.85), ${ACCENT})`,
            boxShadow:  `0 0 8px ${ACCENT}99`,
          }}
        />

        {pages.map((p, i) => {
          const active = i === currentIdx
          const passed = i <= currentIdx
          const top    = lastIdx === 0 ? 0 : (i / lastIdx) * 100
          const num    = String(i + 1).padStart(2, '0')

          return (
            <button
              key={p}
              onClick={() => onJump(p)}
              title={labels[p] || p}
              style={{
                position:  'absolute',
                top:       `${top}%`,
                right:     0,
                transform: 'translateY(-50%)',
                // geniş tıklama alanı, görsel olarak ince
                height:    '44px',
                width:     '150px',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap:        '10px',
                background: 'none',
                border:     'none',
                cursor:     'pointer',
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                const lab = e.currentTarget.querySelector('[data-label]')
                const n   = e.currentTarget.querySelector('[data-num]')
                if (lab) lab.style.opacity = '1'
                if (n && !active) n.style.color = 'rgba(255,255,255,0.7)'
              }}
              onMouseLeave={(e) => {
                const lab = e.currentTarget.querySelector('[data-label]')
                const n   = e.currentTarget.querySelector('[data-num]')
                if (lab) lab.style.opacity = active ? '1' : '0'
                if (n && !active) n.style.color = 'rgba(255,255,255,0.32)'
              }}
            >
              {/* Etiket — sadece aktif/hover'da */}
              <span
                data-label
                style={{
                  fontFamily:    F_ORBIT,
                  fontSize:      '8px',
                  letterSpacing: '0.42em',
                  textTransform: 'uppercase',
                  whiteSpace:    'nowrap',
                  color:         active ? ACCENT : 'rgba(255,255,255,0.55)',
                  opacity:       active ? 1 : 0,
                  transition:    'opacity 0.35s ease',
                }}
              >
                {labels[p] || p}
              </span>

              {/* Mikro numara */}
              <span
                data-num
                style={{
                  fontFamily:    F_ORBIT,
                  fontSize:      '8px',
                  letterSpacing: '0.18em',
                  color:         active ? ACCENT : 'rgba(255,255,255,0.32)',
                  transition:    'color 0.35s ease',
                  width:         '16px',
                  textAlign:     'right',
                }}
              >
                {num}
              </span>

              {/* Tik — ince yatay çizgi, aktifte parlar */}
              <span
                style={{
                  display:      'block',
                  width:        active ? '18px' : '9px',
                  height:       '1px',
                  background:   passed ? ACCENT : 'rgba(255,255,255,0.30)',
                  boxShadow:    active ? `0 0 8px ${ACCENT}` : 'none',
                  transition:   'width 0.35s ease, background 0.35s ease',
                }}
              />
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
