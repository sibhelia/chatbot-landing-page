/**
 * DepthGallery.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot ÜRÜN GALERİSİ — Framer'daki "Depth Blur Carousel" (ProgressiveSmear)
 * tasarımının saf React + Framer Motion'a uyarlanmış sürümü.
 *
 * 3B coverflow: ortadaki kart büyük ve net; yanlardakiler küçülür, döner
 * (rotateY), derinleşir (translateZ) ve sol/sağ kenarlardaki BACKDROP-BLUR
 * maskeleriyle yumuşakça bulanıklaşır. Kartlar ENİNE GENİŞ (landscape).
 *
 * Gezinme: otomatik oynatma + SÜRÜKLE (pan) + oklar. Orijinaldeki tekerlek
 * (wheel) ele geçirme KALDIRILDI — uzun landing sayfasının dikey kaydırmasını
 * tuzaklamasın diye. Tema: marka yeşili; her kartta etiket + başlık.
 * Görseller placeholder (/card_bg_*.png) — ürün ekran görüntüleriyle değişir.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useRef, useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'
const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'
const MINT     = '#6ee7b7'
const MINT_L   = '#a7f3d0'
const NAVY     = '#60a5fa'

// Galeri öğeleri (ürün ekran görüntüleri) — döngü için tekrarlanır
const SHOTS = [
  { img: '/screens/screen-01.png', title: 'SORGU & DİYALOG ANALİTİĞİ', tag: 'ANALİZ'  , accent: GREEN_LL },
  { img: '/screens/screen-03.png', title: 'GERİ BİLDİRİM YÖNETİMİ',    tag: 'GERİ BİLDİRİM', accent: GREEN_L  },
  { img: '/screens/screen-05.png', title: 'VERİ & BİLGİ YÖNETİMİ',     tag: 'VERİ',          accent: NAVY     },
  { img: '/screens/screen-11.png', title: 'SİSTEM LOGLARI',             tag: 'LOG',           accent: MINT     },
  { img: '/screens/screen-12.png', title: 'SİSTEM AYARLARI',            tag: 'AYAR',          accent: MINT_L   },
  { img: '/screens/screen-14.png', title: 'KREDİ & KULLANIM YÖNETİMİ',  tag: 'KREDİ',         accent: GREEN_LL },
]

// ── Enine geniş kart ölçüleri ─────────────────────────────────────────────────
const ITEM_W  = 600   // merkez (geniş)
const ITEM_H  = 320
const SIDE_W  = 380
const SIDE_H  = 260
const GAP     = 56
const MAX_ROT = 38
const AUTOPLAY_MS = 3800

function buildItems() {
  const out = []
  while (out.length < 18) out.push(...SHOTS)
  return out
}

function SmearCard({ item, index, total, smoothScroll }) {
  // Merkeze göre dairesel ofset
  const localOffset = useTransform(smoothScroll, (v) => {
    let base = index - v
    let mapped = ((base % total) + total) % total
    if (mapped > total / 2) mapped -= total
    return mapped
  })
  const absOffset = useTransform(localOffset, Math.abs)
  const cardWidth  = useTransform(absOffset, [0, 1], [ITEM_W, SIDE_W], { clamp: true })
  const cardHeight = useTransform(absOffset, [0, 1], [ITEM_H, SIDE_H], { clamp: true })
  const marginLeft = useTransform(cardWidth, (w) => -w / 2)
  const marginTop  = useTransform(cardHeight, (h) => -h / 2)
  const x = useTransform(localOffset, (o) => {
    const a = Math.abs(o), s = Math.sign(o)
    const centerToNext = ITEM_W / 2 + GAP + SIDE_W / 2
    const sideToSide = SIDE_W + GAP
    if (a === 0) return 0
    if (a <= 1) return s * centerToNext * a
    return s * (centerToNext + (a - 1) * sideToSide * 0.85)
  })
  const z = useTransform(absOffset, (a) => -a * 200)
  const rotateY = useTransform(localOffset, (o) => Math.sign(o) * Math.min(Math.abs(o) * 35, MAX_ROT))
  const zIndex = useTransform(absOffset, (a) => 1000 - Math.round(a * 10))
  const opacity = useTransform(absOffset, [0, 5, 7], [1, 1, 0])
  const labelOpacity = useTransform(absOffset, [0, 0.6, 1.4], [1, 0.5, 0])

  return (
    <motion.div style={{ position: 'absolute', left: 0, top: 0, marginLeft, marginTop, width: cardWidth, height: cardHeight, rotateY, x, z, zIndex, transformStyle: 'preserve-3d' }}>
      <motion.div style={{
        position: 'absolute', inset: 0, borderRadius: 14, overflow: 'hidden', opacity,
        backgroundImage: `url(${item.img})`, backgroundSize: 'cover', backgroundPosition: 'center',
        border: `1px solid ${item.accent}40`, boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 36px ${item.accent}1f`,
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,16,12,0.9) 0%, rgba(2,16,12,0.12) 55%, transparent 100%)' }}/>
        <motion.div style={{ position: 'absolute', left: 20, right: 20, bottom: 18, opacity: labelOpacity }}>
          <p style={{ fontFamily: F_ORBIT, fontSize: '7px', letterSpacing: '0.45em', color: item.accent, textTransform: 'uppercase', marginBottom: '6px' }}>{item.tag}</p>
          <h3 style={{ fontFamily: F_ORBIT, fontSize: '1rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', margin: 0 }}>{item.title}</h3>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function DepthGallery() {
  const items = useRef(buildItems()).current
  const total = items.length

  const scrollTarget = useRef(2)
  const rawScroll = useMotionValue(2)
  const smoothScroll = useSpring(rawScroll, { stiffness: 180, damping: 100, mass: 1, restDelta: 0.001 })
  const paused = useRef(false)

  // Otomatik oynatma
  useEffect(() => {
    const id = setInterval(() => {
      if (paused.current) return
      scrollTarget.current = Math.round(scrollTarget.current) + 1
      rawScroll.set(scrollTarget.current)
    }, AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [rawScroll])

  const go = (dir) => {
    scrollTarget.current = Math.round(scrollTarget.current) + dir
    rawScroll.set(scrollTarget.current)
  }

  // Sürükleme (pan)
  const onPan = (_e, info) => { scrollTarget.current += -info.delta.x * 0.005; rawScroll.set(scrollTarget.current) }
  const onPanEnd = (_e, info) => { scrollTarget.current = Math.round(scrollTarget.current + -info.velocity.x * 0.0015); rawScroll.set(scrollTarget.current) }

  return (
    <section
      onMouseEnter={() => { paused.current = true }}
      onMouseLeave={() => { paused.current = false }}
      style={{ position: 'relative', width: '100%', padding: '7rem 4rem 4rem', boxSizing: 'border-box', borderTop: `1px solid ${GREEN_L}1f`, overflow: 'hidden' }}>
      {/* Etiket + başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2rem' }}>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.5em' }}>06</span>
        <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, ${GREEN_LL}, transparent)` }}/>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>ÜRÜNDEN</span>
      </div>
      <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '-0.01em', textAlign: 'center' }}>
        EKRAN GÖRÜNTÜLERİ
      </h2>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.42)', maxWidth: '520px', lineHeight: 1.7, margin: '0 auto 2.5rem', textAlign: 'center' }}>
        Sürükleyin veya okları kullanın — kartlar derinlikte akıp kenarlarda yumuşakça bulanıklaşır.
      </p>

      {/* 3B coverflow sahnesi */}
      <div style={{ position: 'relative', width: '100%', height: ITEM_H + 80, perspective: 1400, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {/* Sürükleme yakalayıcı (wheel YOK) */}
        <motion.div onPan={onPan} onPanEnd={onPanEnd} style={{ position: 'absolute', inset: 0, zIndex: 9999, cursor: 'grab', touchAction: 'pan-y' }}/>

        <div style={{ position: 'relative', width: 0, height: 0, transformStyle: 'preserve-3d' }}>
          {items.map((item, i) => <SmearCard key={i} item={item} index={i} total={total} smoothScroll={smoothScroll} />)}
        </div>

        {/* Kenar bulanıklık maskeleri (imza efekt) */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '22%', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          maskImage: 'linear-gradient(to right, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 0%, transparent 100%)', pointerEvents: 'none', zIndex: 10000 }}/>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '22%', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          maskImage: 'linear-gradient(to left, black 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 0%, transparent 100%)', pointerEvents: 'none', zIndex: 10000 }}/>

        {/* Oklar */}
        {[{ d: -1, l: '←', s: 'left' }, { d: 1, l: '→', s: 'right' }].map(({ d, l, s }) => (
          <button key={s} aria-label={d === -1 ? 'Önceki' : 'Sonraki'} onClick={() => go(d)}
            style={{ position: 'absolute', [s]: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 10001,
              width: 42, height: 42, borderRadius: '50%', border: `1px solid ${GREEN_L}45`, background: 'rgba(8,20,16,0.45)',
              color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            {l}
          </button>
        ))}
      </div>
    </section>
  )
}
