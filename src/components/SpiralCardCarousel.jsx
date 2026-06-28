import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Canvas } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'

// ─── Kart Verileri ────────────────────────────────────────────────────────────
const CARDS = [
  {
    id: 0,
    title: 'DISCOVER YOUR\nPATRONUS',
    subtitle: 'INTERACTIVE PARTICLE EXPERIENCE',
    tag: 'WEBSITES',
    bg: '/card_bg_4.png',
    accent: '#7dd3fc',
  },
  {
    id: 1,
    title: 'MILLION PIECE\nMISSION',
    subtitle: 'CRAFTING THE FUTURE, ONE PARTICLE AT A TIME',
    tag: 'INSTALLATIONS',
    bg: '/card_bg_1.png',
    accent: '#f0abfc',
  },
  {
    id: 2,
    title: 'CREATIVE\nDIGITAL\nEXPERIENCES',
    subtitle: 'AN IN-HOUSE TEAM OF PASSIONATE MAKERS',
    tag: 'VR / AR / AI',
    bg: '/card_bg_3.png',
    accent: '#a5f3fc',
  },
  {
    id: 3,
    title: 'SUSTAINABLE\nHORIZONS',
    subtitle: 'BUILDING A GREENER TOMORROW THROUGH INNOVATION',
    tag: 'MULTIPLAYER',
    bg: '/card_bg_2.png',
    accent: '#6ee7b7',
  },
  {
    id: 4,
    title: 'PROMETHEUS\nFIRE',
    subtitle: 'THE FIRE OF CREATION — BEYOND ALL HUMAN LIMITS',
    tag: 'GAMES',
    bg: '/card_bg_5.png',
    accent: '#fbbf24',
  },
  {
    id: 5,
    title: 'FUTURE\nURBAN\nVISIONS',
    subtitle: 'AWARD-WINNING WORK THROUGH QUALITY & PERFORMANCE',
    tag: 'WEBSITES',
    bg: '/card_bg_6.png',
    accent: '#93c5fd',
  },
]

const CARD_COUNT = CARDS.length
const STEP_DEG   = 360 / CARD_COUNT   // 60° per kart

// ─── Helix / Sarmal Parametreleri ─────────────────────────────────────────────
// RADIUS : her kartın Y ekseni etrafındaki yatay mesafesi
// STEP_Y : her kart arasındaki dikey düşüş (sarmal adımı)
// PERSP  : CSS perspective (büyük = az perspektif distorsiyonu)
// CARD_W / CARD_H : kart boyutları
const RADIUS  = 680
const STEP_Y  = 260
const PERSP   = 1000
const CARD_W  = 580
const CARD_H  = 390

// ─────────────────────────────────────────────────────────────────────────────
// HurricaneVortex — GPU kasırga shader efekti (arka plan)
// ─────────────────────────────────────────────────────────────────────────────
const VORTEX_PTS = 50000

const vortexVert = /* glsl */ `
  uniform float uTime;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  varying   float vAlpha;

  void main() {
    float baseAngle = position.x;
    float baseY     = position.y;
    float layer     = position.z;

    float speedMult = 1.0 - layer * 0.28;
    float theta = baseAngle + uTime * aSpeed * speedMult;

    // Huni formu: altta geniş, üstte dar
    float t      = (baseY + 3.0) / 6.0;
    float funnel = mix(1.0, 0.25, t);
    float r      = aRadius * funnel;

    // Dikey akış
    float y = mod(baseY + uTime * (0.28 + layer * 0.10), 6.0) - 3.0;

    float wobble = sin(baseAngle * 8.5 + uTime * 2.1) * 0.06;

    vec3 pos = vec3(sin(theta) * (r + wobble), y, cos(theta) * (r + wobble));
    vColor = aColor;
    vAlpha = (1.0 - clamp(r / 4.0, 0.0, 1.0)) * 0.58 + 0.18;

    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (1.0 - r / 5.5 * 0.30);
  }
`

const vortexFrag = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = dot(uv, uv) * 4.0;
    if (d > 1.0) discard;
    float glow = exp(-d * 3.2);
    gl_FragColor = vec4(vColor, glow * vAlpha);
  }
`

const LAYERS = [
  { colors: [new THREE.Color('#60efff'), new THREE.Color('#00bfff')], rMin: 0.2,  rMax: 1.8, sMin: 1.3, sMax: 2.0, szMin: 3.5, szMax: 6.0 },
  { colors: [new THREE.Color('#c084fc'), new THREE.Color('#818cf8')], rMin: 1.0,  rMax: 3.2, sMin: 0.5, sMax: 1.0, szMin: 2.5, szMax: 4.5 },
  { colors: [new THREE.Color('#f472b6'), new THREE.Color('#e879f9')], rMin: 2.2,  rMax: 5.0, sMin: 0.2, sMax: 0.5, szMin: 1.5, szMax: 3.2 },
]

function HurricaneVortex() {
  const ref = useRef()

  const { geo, mat } = useMemo(() => {
    const n = VORTEX_PTS
    const posArr    = new Float32Array(n * 3)
    const colorArr  = new Float32Array(n * 3)
    const radiusArr = new Float32Array(n)
    const speedArr  = new Float32Array(n)
    const sizeArr   = new Float32Array(n)

    const perLayer = Math.floor(n / LAYERS.length)
    let idx = 0

    LAYERS.forEach((l, li) => {
      for (let p = 0; p < perLayer; p++) {
        posArr[idx * 3]     = Math.random() * Math.PI * 2
        posArr[idx * 3 + 1] = (Math.random() - 0.5) * 6
        posArr[idx * 3 + 2] = li
        radiusArr[idx] = l.rMin + Math.random() * (l.rMax - l.rMin)
        speedArr[idx]  = l.sMin + Math.random() * (l.sMax - l.sMin)
        sizeArr[idx]   = l.szMin + Math.random() * (l.szMax - l.szMin)
        const c = l.colors[Math.floor(Math.random() * l.colors.length)]
        colorArr[idx * 3]     = c.r
        colorArr[idx * 3 + 1] = c.g
        colorArr[idx * 3 + 2] = c.b
        idx++
      }
    })

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posArr,    3))
    g.setAttribute('aColor',   new THREE.BufferAttribute(colorArr,  3))
    g.setAttribute('aRadius',  new THREE.BufferAttribute(radiusArr, 1))
    g.setAttribute('aSpeed',   new THREE.BufferAttribute(speedArr,  1))
    g.setAttribute('aSize',    new THREE.BufferAttribute(sizeArr,   1))

    const m = new THREE.ShaderMaterial({
      uniforms:       { uTime: { value: 0 } },
      vertexShader:   vortexVert,
      fragmentShader: vortexFrag,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  useFrame((_, delta) => { mat.uniforms.uTime.value += delta })

  return <points ref={ref} geometry={geo} material={mat} />
}

// ─── Sol Sidebar ──────────────────────────────────────────────────────────────
const NAV_ITEMS = ['WEBSITES', 'INSTALLATIONS', 'VR / AR / AI', 'MULTIPLAYER', 'GAMES']

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function SpiralCardCarousel({ onBack, onNext, enabled }) {
  const activeIndex = useRef(0)
  const scrollLock  = useRef(false)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    const onWheel = (e) => {
      if (!enabled || scrollLock.current) return

      if (e.deltaY < 0) {
        // Yukarı scroll → önceki kart / sahneye dön
        if (activeIndex.current === 0) { onBack?.(); return }
        scrollLock.current = true
        activeIndex.current -= 1
        setActiveIdx(activeIndex.current)
      } else {
        // Aşağı scroll → sonraki kart / son kartta landing'e geç
        if (activeIndex.current === CARD_COUNT - 1) { onNext?.(); return }
        scrollLock.current = true
        activeIndex.current += 1
        setActiveIdx(activeIndex.current)
      }
      setTimeout(() => { scrollLock.current = false }, 750)
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [onBack, onNext, enabled])

  const card = CARDS[activeIdx]

  // ── CSS 3D Helix/Sarmal Hesabı ───────────────────────────────────────────
  //
  // Grup transformu:
  //   1. translateZ(-RADIUS) → grubu RADIUS kadar arkaya çeker
  //   2. rotateY(-activeIdx*60°) → aktif kartı öne getirir (Y ekseni dönüşü)
  //   3. translateY(+activeIdx*STEP_Y) → aktif kartı dikey merkeze taşır
  //      (rotateY, Y eksenini etkilemez → translateY hâlâ dünya Y'si)
  //
  // Kart i transformu:
  //   1. rotateY(i*60°) → silindirdeki konumuna döner
  //   2. translateZ(RADIUS) → merkezden dışa çıkar (grup'un -RADIUS'unu dengeler)
  //   3. translateY(-i*STEP_Y) → helixdeki dikey konumu
  //
  // Aktif kart (i=activeIdx) dünya konumu: (0, 0, 0) → perspektif boyutu normal ✓
  // Yan kart (i=activeIdx±1) : hem yatay hem dikey kaymış + daha uzak (küçük) ✓
  //
  const carouselTransform = [
    `translateZ(${-RADIUS}px)`,
    `rotateY(${-activeIdx * STEP_DEG}deg)`,
    `translateY(${activeIdx * STEP_Y}px)`,
  ].join(' ')

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#020510', overflow: 'hidden' }}>

      {/* ── Three.js: hurricane arka plan ──────────────────────────────────── */}
      <Canvas
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        camera={{ position: [0, 0, 3.8], fov: 80 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
      >
        <ambientLight intensity={0.1} />
        <HurricaneVortex />
      </Canvas>

      {/* ── CSS 3D Helix/Sarmal Carousel ─────────────────────────────────── */}
      {/*
        perspective wrapper: tam ekran, perspectiveOrigin merkez → kamera göz hizasında
        grup: 0×0 div, merkeze konumlandırılmış (top:50% left:50%)
        ─────────────────────────────────────────────────────────────────────
        Her kart:
          rotateY(i*60°)          → silindirdeki açısı
          translateZ(+RADIUS)     → merkez eksenden dışa iter
          translateY(-i*STEP_Y)   → helixdeki dikey yüksekliği
        ─────────────────────────────────────────────────────────────────────
      */}
      <div
        style={{
          position:          'absolute',
          inset:             0,
          perspective:       `${PERSP}px`,
          perspectiveOrigin: '50% 50%',
          pointerEvents:     'none',
        }}
      >
        <div
          style={{
            position:       'absolute',
            top:            '50%',
            left:           '50%',
            width:          0,
            height:         0,
            transformStyle: 'preserve-3d',
            transform:      carouselTransform,
            transition:     'transform 0.88s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          {CARDS.map((c, i) => {
            const isActive = i === activeIdx
            // Görünürlük: aktif ± 2 kart görünür, diğerleri saydam
            const diff = Math.abs(((i - activeIdx) % CARD_COUNT + CARD_COUNT) % CARD_COUNT)
            const wrappedDiff = Math.min(diff, CARD_COUNT - diff)
            const visible = wrappedDiff <= 2

            return (
              <div
                key={i}
                style={{
                  position:  'absolute',
                  width:     `${CARD_W}px`,
                  height:    `${CARD_H}px`,
                  // Kartı tam merkeze hizala (0×0 grup'ta)
                  top:       `${-(CARD_H / 2)}px`,
                  left:      `${-(CARD_W / 2)}px`,
                  transform: [
                    `rotateY(${i * STEP_DEG}deg)`,
                    `translateZ(${RADIUS}px)`,
                    `translateY(${-i * STEP_Y}px)`,
                  ].join(' '),
                  backgroundImage:    `url(${c.bg})`,
                  backgroundSize:     'cover',
                  backgroundPosition: 'center',
                  borderRadius:       '6px',
                  opacity:            visible ? (isActive ? 1 : 0.40) : 0,
                  transition:         'opacity 0.5s ease',
                  boxShadow: isActive
                    ? `0 0 50px 12px ${c.accent}30, 0 0 100px 30px ${c.accent}15, inset 0 0 0 1px ${c.accent}28`
                    : 'none',
                  willChange: 'transform, opacity',
                  // Aktif olmayan kartlara daha koyu overlay
                  overflow: 'hidden',
                }}
              >
                {/* Koyu gradient — alt kısım okunabilir */}
                <div style={{
                  position:   'absolute',
                  inset:      0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.05) 100%)',
                  pointerEvents: 'none',
                }}/>

                {/* Aktif olmayan kartlara ek karartma */}
                {!isActive && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,12,0.52)',
                    pointerEvents: 'none',
                  }}/>
                )}

                {/* Kart üzeri yazı — sadece kendi içinde */}
                <div style={{
                  position:      'absolute',
                  bottom:        '1.4rem',
                  left:          '1.4rem',
                  right:         '1.4rem',
                  pointerEvents: 'none',
                  opacity:       isActive ? 1 : 0.6,
                  transition:    'opacity 0.4s',
                }}>
                  <p style={{
                    fontFamily:    'Orbitron, sans-serif',
                    fontSize:      '7px',
                    letterSpacing: '0.5em',
                    color:         c.accent,
                    textTransform: 'uppercase',
                    marginBottom:  '6px',
                    opacity:       0.9,
                  }}>
                    {c.tag}
                  </p>
                  <h2 style={{
                    fontFamily:    'Orbitron, sans-serif',
                    fontSize:      isActive ? 'clamp(1.1rem, 2.5vw, 1.8rem)' : 'clamp(0.7rem, 1.5vw, 1.1rem)',
                    fontWeight:    900,
                    color:         '#ffffff',
                    lineHeight:    1.1,
                    textTransform: 'uppercase',
                    whiteSpace:    'pre-line',
                    textShadow:    '0 2px 12px rgba(0,0,0,0.8)',
                    transition:    'font-size 0.4s',
                  }}>
                    {c.title}
                  </h2>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── HTML Overlay ──────────────────────────────────────────────────── */}

      {/* Üst sol logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute', top: '1.8rem', left: '2rem', zIndex: 30,
          fontFamily: 'Orbitron, sans-serif', fontSize: '11px',
          letterSpacing: '0.35em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase',
        }}
      >
        ◈ STUDIO
      </motion.div>

      {/* Sağ üst nav */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        style={{
          position: 'absolute', top: '1.8rem', right: '2rem', zIndex: 30,
          display: 'flex', gap: '2.5rem', alignItems: 'center',
        }}
      >
        {['WORK', 'CONTACT'].map(item => (
          <button
            key={item}
            style={{
              fontFamily: 'Orbitron, sans-serif', fontSize: '10px',
              letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)',
              background: 'none', border: 'none', cursor: 'pointer',
              textTransform: 'uppercase', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
          >
            {item}
          </button>
        ))}
      </motion.div>

      {/* Sol alt sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
        style={{
          position: 'absolute', bottom: '3rem', left: '2rem', zIndex: 30,
          display: 'flex', flexDirection: 'column',
        }}
      >
        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: '8px',
          letterSpacing: '0.35em', color: 'rgba(255,255,255,0.26)',
          textTransform: 'uppercase', marginBottom: '14px',
        }}>
          WHAT ARE YOU LOOKING FOR?
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {NAV_ITEMS.map((label, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 0.5, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.07 }}
              whileHover={{ x: 8, opacity: 1 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: '11px',
                letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)',
                background: 'none', border: 'none', cursor: 'pointer',
                textTransform: 'uppercase', textAlign: 'left',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px' }}>→</span>
              {label}
            </motion.button>
          ))}
        </nav>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          whileHover={{ scale: 1.03 }}
          style={{
            marginTop: '20px', padding: '9px 18px',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.42)',
            fontFamily: 'Space Grotesk, sans-serif', fontSize: '9px',
            letterSpacing: '0.3em', textTransform: 'uppercase',
            cursor: 'pointer', width: 'fit-content', transition: 'all 0.25s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
            e.currentTarget.style.color       = 'rgba(255,255,255,0.9)'
            e.currentTarget.style.background  = 'rgba(255,255,255,0.08)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            e.currentTarget.style.color       = 'rgba(255,255,255,0.42)'
            e.currentTarget.style.background  = 'rgba(255,255,255,0.04)'
          }}
        >
          ASK ME ANYTHING
        </motion.button>
      </motion.div>




      {/* Sağ alt sayaç + progress */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          position: 'absolute', bottom: '1.8rem', right: '2rem', zIndex: 30,
          display: 'flex', alignItems: 'center', gap: '14px', pointerEvents: 'none',
        }}
      >
        <span style={{
          fontFamily: 'Orbitron, sans-serif', fontSize: '10px',
          color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em',
        }}>
          {String(activeIdx + 1).padStart(2, '0')} / {String(CARD_COUNT).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {CARDS.map((_, i) => (
            <div key={i} style={{
              width: i === activeIdx ? '22px' : '4px', height: '3px', borderRadius: '2px',
              transition: 'all 0.45s ease',
              background: i === activeIdx ? card.accent : 'rgba(255,255,255,0.15)',
            }}/>
          ))}
        </div>
      </motion.div>

      {/* Alt scroll ipucu */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        style={{
          position: 'absolute', bottom: '1.6rem', left: '50%',
          transform: 'translateX(-50%)', zIndex: 30,
          fontFamily: 'Space Grotesk, sans-serif', fontSize: '8px',
          letterSpacing: '0.4em', color: 'rgba(255,255,255,0.10)',
          textTransform: 'uppercase', pointerEvents: 'none', whiteSpace: 'nowrap',
        }}
      >
        ↑ scroll up · go back &nbsp;·&nbsp; scroll down · explore ↓
      </motion.div>
    </div>
  )
}
