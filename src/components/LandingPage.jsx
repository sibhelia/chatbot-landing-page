import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'

// ─── Renk & Font Sabitleri ────────────────────────────────────────────────────
const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

// ─── Animasyon Varyantları ────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.9 } },
}
const stagger = (delay = 0) => ({
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: delay } },
})

// ─── Animasyonlu Sayaç ────────────────────────────────────────────────────────
function Counter({ end, suffix = '', duration = 2200, isActive }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isActive) return
    let frame = 0
    const total = Math.ceil(duration / 16)
    const timer = setInterval(() => {
      frame++
      const progress = frame / total
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (frame >= total) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, isActive])
  return <>{count}{suffix}</>
}

// ─── Bölüm Sarmalayıcı ───────────────────────────────────────────────────────
function Section({ children, style = {} }) {
  const ref   = useRef()
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <motion.section
      ref={ref}
      variants={stagger(0.1)}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      style={{
        position:  'relative',
        width:     '100%',
        padding:   '7rem 4rem',
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </motion.section>
  )
}

// ─── Bölüm Etiketi ────────────────────────────────────────────────────────────
function SectionLabel({ num, label }) {
  return (
    <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '4rem' }}>
      <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.5em' }}>
        {num}
      </span>
      <div style={{ width: '40px', height: '1px', background: 'rgba(255,255,255,0.15)' }}/>
      <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>
        {label}
      </span>
    </motion.div>
  )
}

// ─── Yatay Çizgi ─────────────────────────────────────────────────────────────
function Divider() {
  return (
    <motion.div
      variants={fadeIn}
      style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent)' }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 1 — MANIFESTO
// ═══════════════════════════════════════════════════════════════════════════════
function ManifestoSection() {
  return (
    <Section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'transparent' }}>
      {/* Arka plan çizgisi efekti */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(96,239,255,0.04) 0%, transparent 70%)',
      }}/>

      <SectionLabel num="01" label="MANIFESTO" />

      <motion.h2
        variants={fadeUp}
        style={{
          fontFamily: F_ORBIT, fontWeight: 900,
          fontSize: 'clamp(2.5rem, 7vw, 7rem)',
          lineHeight: 0.95, letterSpacing: '-0.02em',
          color: '#fff', textTransform: 'uppercase',
          maxWidth: '900px', marginBottom: '3rem',
        }}
      >
        WE CRAFT<br />
        <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)', color: 'transparent' }}>
          DIGITAL
        </span>{' '}
        WORLDS
      </motion.h2>

      <motion.div
        variants={fadeUp}
        style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}
      >
        <p style={{
          fontFamily: F_SPACE, fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)',
          color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: '440px',
        }}>
          Founded in 2022. An in-house team of passionate makers dedicated to pushing the boundaries
          of digital creativity — from interactive websites to immersive VR/AR experiences.
        </p>
        <p style={{
          fontFamily: F_SPACE, fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)',
          color: 'rgba(255,255,255,0.28)', lineHeight: 1.8, maxWidth: '380px',
        }}>
          Our industry-leading aim is to consistently deliver award-winning work through quality,
          performance, and an unwavering commitment to excellence.
        </p>
      </motion.div>

      {/* Kayan ticker */}
      <motion.div
        variants={fadeIn}
        style={{
          position: 'absolute', bottom: '3rem', left: 0, right: 0,
          overflow: 'hidden', pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex', gap: '3rem', whiteSpace: 'nowrap',
          animation: 'ticker 18s linear infinite',
          fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.5em',
          color: 'rgba(255,255,255,0.10)', textTransform: 'uppercase',
        }}>
          {Array(8).fill(['WEBSITES', 'INSTALLATIONS', 'VR / AR / AI', 'MULTIPLAYER', 'GAMES', '◈']).flat().map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 2 — HİZMETLER
// ═══════════════════════════════════════════════════════════════════════════════
const SERVICES = [
  { num: '01', name: 'WEBSITES',        desc: 'Award-winning digital experiences built for performance, accessibility, and visual impact.',        accent: '#7dd3fc' },
  { num: '02', name: 'INSTALLATIONS',   desc: 'Immersive physical-digital installations that blur the boundary between art and technology.',       accent: '#f0abfc' },
  { num: '03', name: 'VR / AR / AI',    desc: 'Extended reality experiences and AI-powered creative tools that redefine human interaction.',        accent: '#a5f3fc' },
  { num: '04', name: 'MULTIPLAYER',     desc: 'Real-time connected experiences and social gaming platforms engineered for scale.',                 accent: '#6ee7b7' },
  { num: '05', name: 'GAMES',           desc: 'From indie gems to AAA-quality interactive narratives — we build worlds worth exploring.',          accent: '#fbbf24' },
]

function ServicesSection() {
  const [hovered, setHovered] = useState(-1)

  return (
    <Section style={{ background: 'rgba(255,255,255,0.012)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <SectionLabel num="02" label="WHAT WE DO" />

      <motion.h2
        variants={fadeUp}
        style={{
          fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
          fontWeight: 900, color: '#fff', textTransform: 'uppercase',
          marginBottom: '4rem', letterSpacing: '-0.01em',
        }}
      >
        OUR SERVICES
      </motion.h2>

      <motion.div variants={stagger(0.05)}>
        {SERVICES.map((s, i) => (
          <motion.div
            key={s.num}
            variants={fadeUp}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(-1)}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '2rem',
              padding:        '1.8rem 0',
              borderBottom:   '1px solid rgba(255,255,255,0.06)',
              cursor:         'default',
              transition:     'all 0.3s ease',
              background:     hovered === i ? 'rgba(255,255,255,0.025)' : 'transparent',
              paddingLeft:    hovered === i ? '1rem' : '0',
              paddingRight:   hovered === i ? '1rem' : '0',
              borderRadius:   '4px',
            }}
          >
            <span style={{
              fontFamily: F_ORBIT, fontSize: '10px',
              color: hovered === i ? s.accent : 'rgba(255,255,255,0.2)',
              letterSpacing: '0.3em', minWidth: '36px',
              transition: 'color 0.3s',
            }}>
              {s.num}
            </span>

            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.08)' }}/>

            <span style={{
              fontFamily: F_ORBIT, fontSize: 'clamp(1rem, 2vw, 1.6rem)',
              fontWeight: 700, color: hovered === i ? '#fff' : 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase', flex: 1, letterSpacing: '0.05em',
              transition: 'color 0.3s',
            }}>
              {s.name}
            </span>

            <p style={{
              fontFamily: F_SPACE, fontSize: '12px',
              color: 'rgba(255,255,255,0.35)', lineHeight: 1.6,
              maxWidth: '420px', textAlign: 'right',
              opacity: hovered === i ? 1 : 0,
              transform: hovered === i ? 'translateX(0)' : 'translateX(12px)',
              transition: 'all 0.3s ease',
            }}>
              {s.desc}
            </p>

            <span style={{
              fontFamily: F_ORBIT, fontSize: '14px',
              color: hovered === i ? s.accent : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s',
              transform: hovered === i ? 'translateX(6px)' : 'none',
            }}>
              →
            </span>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 3 — SAYILAR
// ═══════════════════════════════════════════════════════════════════════════════
const STATS = [
  { value: 200, suffix: '+', label: 'PROJECTS DELIVERED' },
  { value: 50,  suffix: '+', label: 'GLOBAL CLIENTS'     },
  { value: 12,  suffix: '',  label: 'AWARDS WON'         },
  { value: 4,   suffix: '',  label: 'YEARS OF EXCELLENCE' },
]

function StatsSection() {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })

  return (
    <div
      ref={ref}
      style={{
        padding:        '6rem 4rem',
        background:     'linear-gradient(180deg, transparent 0%, rgba(96,239,255,0.03) 50%, transparent 100%)',
        borderTop:      '1px solid rgba(255,255,255,0.05)',
        borderBottom:   '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              fontFamily: F_ORBIT, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
              fontWeight: 900, color: '#fff', lineHeight: 1,
              marginBottom: '0.6rem',
              background: 'linear-gradient(135deg, #fff 0%, rgba(96,239,255,0.8) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              <Counter end={s.value} suffix={s.suffix} isActive={inView} duration={1800 + i * 200} />
            </div>
            <p style={{
              fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.4em',
              color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
            }}>
              {s.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 4 — SEÇİLMİŞ ÇALIŞMALAR
// ═══════════════════════════════════════════════════════════════════════════════
const WORKS = [
  { img: '/card_bg_4.png', title: 'DISCOVER YOUR PATRONUS',    tag: 'WEB EXPERIENCE',  accent: '#7dd3fc' },
  { img: '/card_bg_1.png', title: 'MILLION PIECE MISSION',     tag: 'INSTALLATION',    accent: '#f0abfc' },
  { img: '/card_bg_3.png', title: 'CREATIVE DIGITAL',          tag: 'VR / AR',         accent: '#a5f3fc' },
  { img: '/card_bg_2.png', title: 'SUSTAINABLE HORIZONS',      tag: 'MULTIPLAYER',     accent: '#6ee7b7' },
  { img: '/card_bg_5.png', title: 'PROMETHEUS FIRE',           tag: 'GAME',            accent: '#fbbf24' },
  { img: '/card_bg_6.png', title: 'FUTURE URBAN VISIONS',      tag: 'WEBSITE',         accent: '#93c5fd' },
]

function WorksSection() {
  const [hovered, setHovered] = useState(-1)

  return (
    <Section style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <SectionLabel num="03" label="SELECTED WORKS" />

      <motion.div
        variants={fadeUp}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}
      >
        <h2 style={{
          fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
          fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em',
        }}>
          OUR WORK
        </h2>
        <span style={{
          fontFamily: F_SPACE, fontSize: '11px', letterSpacing: '0.3em',
          color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
        }}>
          ALL PROJECTS →
        </span>
      </motion.div>

      <motion.div
        variants={stagger(0.08)}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}
      >
        {WORKS.map((w, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(-1)}
            style={{
              position:        'relative',
              aspectRatio:     '16 / 10',
              borderRadius:    '6px',
              overflow:        'hidden',
              cursor:          'pointer',
              transform:       hovered === i ? 'scale(1.02)' : 'scale(1)',
              transition:      'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
              boxShadow:       hovered === i ? `0 20px 60px rgba(0,0,0,0.6), 0 0 30px ${w.accent}20` : '0 8px 30px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${w.img})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
              transform: hovered === i ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)',
            }}/>

            {/* Gradient overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
            }}/>

            {/* Hover reveal overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(135deg, ${w.accent}15, transparent)`,
              opacity: hovered === i ? 1 : 0,
              transition: 'opacity 0.4s',
            }}/>

            {/* Card info */}
            <div style={{ position: 'absolute', bottom: '1.2rem', left: '1.2rem', right: '1.2rem' }}>
              <p style={{
                fontFamily: F_ORBIT, fontSize: '7px', letterSpacing: '0.5em',
                color: w.accent, textTransform: 'uppercase', marginBottom: '5px',
                opacity: hovered === i ? 1 : 0.7, transition: 'opacity 0.3s',
              }}>
                {w.tag}
              </p>
              <h3 style={{
                fontFamily: F_ORBIT, fontSize: 'clamp(0.75rem, 1.3vw, 1rem)',
                fontWeight: 700, color: '#fff', textTransform: 'uppercase',
                letterSpacing: '0.03em',
              }}>
                {w.title}
              </h3>
            </div>

            {/* Arrow */}
            <div style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: '32px', height: '32px', borderRadius: '50%',
              border: `1px solid ${w.accent}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: hovered === i ? 1 : 0,
              transform: hovered === i ? 'scale(1)' : 'scale(0.7)',
              transition: 'all 0.3s',
              color: w.accent, fontSize: '12px',
            }}>
              ↗
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 5 — SÜREÇ
// ═══════════════════════════════════════════════════════════════════════════════
const STEPS = [
  { num: '01', title: 'DISCOVERY',    desc: 'We dive deep into your vision, audience, and goals — mapping every creative opportunity.' },
  { num: '02', title: 'DESIGN',       desc: 'Prototyping concepts, visual systems, and interaction patterns that feel inevitable.' },
  { num: '03', title: 'DEVELOPMENT',  desc: 'Engineering performant, scalable solutions with obsessive attention to quality and detail.' },
  { num: '04', title: 'LAUNCH',       desc: 'Delivering and optimizing in the wild — tracking real-world impact and iterating fast.' },
]

function ProcessSection() {
  return (
    <Section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
      <SectionLabel num="04" label="HOW WE WORK" />

      <motion.h2
        variants={fadeUp}
        style={{
          fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
          fontWeight: 900, color: '#fff', textTransform: 'uppercase',
          marginBottom: '5rem', letterSpacing: '-0.01em',
        }}
      >
        OUR PROCESS
      </motion.h2>

      <motion.div
        variants={stagger(0.1)}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}
      >
        {STEPS.map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            style={{ position: 'relative' }}
          >
            {/* Bağlantı çizgisi */}
            {i < STEPS.length - 1 && (
              <div style={{
                position: 'absolute', top: '1.5rem', left: 'calc(100% - 1rem)', right: '-1rem',
                height: '1px', background: 'rgba(255,255,255,0.08)', zIndex: 0,
              }}/>
            )}

            <div style={{
              width: '48px', height: '48px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1.5rem', position: 'relative', zIndex: 1,
              background: 'rgba(255,255,255,0.04)',
            }}>
              <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.2em' }}>
                {s.num}
              </span>
            </div>

            <h3 style={{
              fontFamily: F_ORBIT, fontSize: '1rem', fontWeight: 700,
              color: '#fff', textTransform: 'uppercase',
              letterSpacing: '0.05em', marginBottom: '0.8rem',
            }}>
              {s.title}
            </h3>

            <p style={{
              fontFamily: F_SPACE, fontSize: '12px',
              color: 'rgba(255,255,255,0.35)', lineHeight: 1.7,
            }}>
              {s.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BÖLÜM 6 — İLETİŞİM / CTA
// ═══════════════════════════════════════════════════════════════════════════════
function ContactSection() {
  const [email, setEmail] = useState('')
  const [sent,  setSent]  = useState(false)

  return (
    <Section
      style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(192,132,252,0.06) 0%, transparent 70%)',
      }}
    >
      <SectionLabel num="05" label="GET IN TOUCH" />

      <motion.h2
        variants={fadeUp}
        style={{
          fontFamily: F_ORBIT, fontSize: 'clamp(2.2rem, 7vw, 6rem)',
          fontWeight: 900, color: '#fff', textTransform: 'uppercase',
          lineHeight: 0.95, letterSpacing: '-0.02em', marginBottom: '2rem',
        }}
      >
        LET'S CREATE<br/>
        <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}>
          SOMETHING
        </span><br/>
        EXTRAORDINARY
      </motion.h2>

      <motion.p
        variants={fadeUp}
        style={{
          fontFamily: F_SPACE, fontSize: '1rem',
          color: 'rgba(255,255,255,0.35)', marginBottom: '3.5rem',
          maxWidth: '480px', lineHeight: 1.7,
        }}
      >
        Ready to push the boundaries of what's possible? Tell us about your project and let's build something the world has never seen.
      </motion.p>

      {/* Email input */}
      <motion.div
        variants={fadeUp}
        style={{ display: 'flex', gap: '0', marginBottom: '4rem', width: '100%', maxWidth: '500px' }}
      >
        {!sent ? (
          <>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                flex: 1, padding: '1rem 1.4rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRight: 'none', borderRadius: '3px 0 0 3px',
                color: '#fff', fontFamily: F_SPACE, fontSize: '13px',
                outline: 'none', letterSpacing: '0.05em',
              }}
            />
            <button
              onClick={() => { if (email) setSent(true) }}
              style={{
                padding: '1rem 1.8rem',
                background: 'rgba(255,255,255,0.9)',
                border: 'none', borderRadius: '0 3px 3px 0',
                color: '#000', fontFamily: F_ORBIT, fontSize: '10px',
                letterSpacing: '0.3em', textTransform: 'uppercase',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.target.style.background = '#fff'}
              onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.9)'}
            >
              SEND →
            </button>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              flex: 1, padding: '1rem', textAlign: 'center',
              border: '1px solid rgba(96,239,255,0.3)', borderRadius: '3px',
              color: '#60efff', fontFamily: F_ORBIT, fontSize: '10px',
              letterSpacing: '0.35em', background: 'rgba(96,239,255,0.05)',
            }}
          >
            ✓ MESSAGE RECEIVED — WE'LL BE IN TOUCH SOON
          </motion.div>
        )}
      </motion.div>

      {/* Sosyal linkler */}
      <motion.div
        variants={fadeUp}
        style={{ display: 'flex', gap: '2.5rem', marginBottom: '6rem' }}
      >
        {['INSTAGRAM', 'TWITTER', 'LINKEDIN', 'BEHANCE'].map(s => (
          <button
            key={s}
            style={{
              fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.35em',
              color: 'rgba(255,255,255,0.28)', background: 'none',
              border: 'none', cursor: 'pointer', textTransform: 'uppercase',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.85)'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.28)'}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        variants={fadeIn}
        style={{
          position: 'absolute', bottom: '2rem', left: '4rem', right: '4rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2rem',
        }}
      >
        <span style={{ fontFamily: F_ORBIT, fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.35em' }}>
          ◈ STUDIO
        </span>
        <span style={{ fontFamily: F_SPACE, fontSize: '11px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.2em' }}>
          © 2025 ALL RIGHTS RESERVED
        </span>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.25em' }}>
          CRAFTED WITH PASSION
        </span>
      </motion.div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ═══════════════════════════════════════════════════════════════════════════════
export default function LandingPage({ onBack, enabled }) {
  const containerRef = useRef()

  // Sayfanın en üstünde yukarı scroll → carousel'a dön
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onWheel = (e) => {
      if (!enabled) return
      if (el.scrollTop <= 0 && e.deltaY < 0) {
        onBack?.()
      }
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onBack, enabled])

  // Sayfa aktifleşince en üste git
  useEffect(() => {
    if (enabled && containerRef.current) {
      containerRef.current.scrollTop = 0
    }
  }, [enabled])

  return (
    <div
      ref={containerRef}
      style={{
        position:   'absolute',
        inset:      0,
        overflowY:  'auto',
        overflowX:  'hidden',
        background: '#020510',
        scrollBehavior: 'smooth',
      }}
    >
      {/* Arka plan glow efektleri */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 50% 40% at 20% 20%, rgba(192,132,252,0.04) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 80% 80%, rgba(96,239,255,0.03) 0%, transparent 60%)',
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <ManifestoSection />
        <Divider />
        <ServicesSection />
        <StatsSection />
        <Divider />
        <WorksSection />
        <Divider />
        <ProcessSection />
        <ContactSection />
      </div>

      {/* Geri dön ipucu */}
      <div style={{
        position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, pointerEvents: 'none',
      }}>
        <span style={{
          fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.4em',
          color: 'rgba(255,255,255,0.12)', textTransform: 'uppercase',
        }}>
          ↑ SCROLL TO TOP · THEN UP TO GO BACK
        </span>
      </div>
    </div>
  )
}
