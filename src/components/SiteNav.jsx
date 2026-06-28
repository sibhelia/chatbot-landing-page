/**
 * SiteNav.jsx
 * ─────────────────────────────────────────────────────────────
 * Site boyunca sabit dikey navigasyon çubuğu.
 * 3 ana bölüm + carousel içi progress göstergesi.
 * ─────────────────────────────────────────────────────────────
 */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

const SECTIONS = [
  { id: 'scenes',   label: 'EXPLORE',  num: '01', accent: '#60efff' },
  { id: 'carousel', label: 'WORKS',    num: '02', accent: '#c084fc' },
  { id: 'landing',  label: 'STUDIO',   num: '03', accent: '#f472b6' },
]

const CARD_COUNT = 6
const CONNECTOR_H = 48   // px, bölümler arası çizgi yüksekliği

export default function SiteNav({
  page,
  carouselIdx = 0,
  onNavigate,              // (sectionId, cardIdx?) => void
}) {
  const [hoveredSection, setHoveredSection] = useState(null)

  // Toplam progress (0→1): scenes=0, carousel cards=1/3 → 2/3, landing=1
  const totalSteps = 1 + CARD_COUNT + 1   // scenes + 6 cards + landing = 8
  let currentStep = 0
  if (page === 'scenes')   currentStep = 0
  if (page === 'carousel') currentStep = 1 + carouselIdx
  if (page === 'landing')  currentStep = totalSteps - 1
  const progress = currentStep / (totalSteps - 1)

  return (
    <div
      style={{
        position:  'fixed',
        right:     '1.6rem',
        top:       '50%',
        transform: 'translateY(-50%)',
        zIndex:    100,
        display:   'flex',
        flexDirection: 'column',
        alignItems:    'center',
        pointerEvents: 'all',
        userSelect:    'none',
      }}
    >
      {SECTIONS.map((sec, si) => {
        const isActive = page === sec.id
        const isPast   = SECTIONS.findIndex(s => s.id === page) > si

        return (
          <div
            key={sec.id}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* ── Üst bağlantı çizgisi ──────────────────────────── */}
            {si > 0 && (
              <div
                style={{
                  width:      '1px',
                  height:     `${CONNECTOR_H}px`,
                  background: 'rgba(255,255,255,0.08)',
                  position:   'relative',
                  overflow:   'hidden',
                }}
              >
                {/* İlerleme dolgusu */}
                <motion.div
                  animate={{ height: (isActive || isPast) ? '100%' : '0%' }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position:   'absolute',
                    top:        0,
                    width:      '100%',
                    background: `linear-gradient(to bottom, ${SECTIONS[si - 1].accent}, ${sec.accent})`,
                  }}
                />
              </div>
            )}

            {/* ── Bölüm noktası + etiket ────────────────────────── */}
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
              onMouseEnter={() => setHoveredSection(sec.id)}
              onMouseLeave={() => setHoveredSection(null)}
            >
              {/* Sağdaki etiket (hover'da görünür) */}
              <AnimatePresence>
                {hoveredSection === sec.id && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{    opacity: 0, x: 8 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position:     'absolute',
                      right:        '20px',
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '8px',
                      whiteSpace:   'nowrap',
                    }}
                  >
                    <span style={{
                      fontFamily:    F_ORBIT,
                      fontSize:      '8px',
                      letterSpacing: '0.35em',
                      color:         isActive ? sec.accent : 'rgba(255,255,255,0.40)',
                      textTransform: 'uppercase',
                    }}>
                      {sec.num}
                    </span>
                    <span style={{
                      fontFamily:    F_ORBIT,
                      fontSize:      '9px',
                      letterSpacing: '0.25em',
                      color:         isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                      textTransform: 'uppercase',
                    }}>
                      {sec.label}
                    </span>
                    <div style={{ width: '6px', height: '1px', background: isActive ? sec.accent : 'rgba(255,255,255,0.2)' }}/>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Nokta */}
              <motion.div
                onClick={() => onNavigate(sec.id)}
                animate={{
                  width:     isActive ? '10px' : '5px',
                  height:    isActive ? '10px' : '5px',
                  boxShadow: isActive
                    ? `0 0 12px 4px ${sec.accent}60, 0 0 24px 8px ${sec.accent}25`
                    : 'none',
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  borderRadius: '50%',
                  background:   isActive ? sec.accent : (isPast ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)'),
                  cursor:       'pointer',
                  flexShrink:   0,
                  border:       isActive ? `1px solid ${sec.accent}80` : '1px solid rgba(255,255,255,0.08)',
                  transition:   'background 0.4s ease',
                }}
              />
            </div>

            {/* ── Carousel iç progress (sadece carousel bölümünde) ── */}
            {sec.id === 'carousel' && isActive && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{    opacity: 0, scaleY: 0 }}
                style={{
                  display:       'flex',
                  flexDirection: 'column',
                  alignItems:    'center',
                  gap:           '5px',
                  padding:       '10px 0',
                  transformOrigin: 'top',
                }}
              >
                {Array.from({ length: CARD_COUNT }).map((_, ci) => (
                  <motion.div
                    key={ci}
                    onClick={() => onNavigate('carousel', ci)}
                    animate={{
                      width:      ci === carouselIdx ? '2px' : '2px',
                      height:     ci === carouselIdx ? '16px' : '6px',
                      background: ci === carouselIdx
                        ? sec.accent
                        : ci < carouselIdx
                          ? 'rgba(192,132,252,0.45)'
                          : 'rgba(255,255,255,0.12)',
                    }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      borderRadius: '2px',
                      cursor:       'pointer',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        )
      })}

      {/* ── Genel progress sayacı ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          marginTop:  '14px',
          fontFamily: F_ORBIT,
          fontSize:   '7px',
          letterSpacing: '0.3em',
          color:      'rgba(255,255,255,0.20)',
          textAlign:  'center',
          lineHeight: 1.6,
        }}
      >
        {String(Math.round(progress * 100)).padStart(2, '0')}
        <br/>
        <span style={{ fontSize: '6px', opacity: 0.6 }}>%</span>
      </motion.div>
    </div>
  )
}
