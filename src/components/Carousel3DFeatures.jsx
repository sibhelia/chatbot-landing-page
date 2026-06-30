/**
 * Carousel3DFeatures.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot ÖZELLİKLER bölümü — Framer'daki "Carousel3D" (coverflow) tasarımının
 * saf React + Framer Motion'a uyarlanmış sürümü.
 *
 * Davranış: kartlar 3B coverflow olarak dizilir. Ortadaki kart büyük ve parlak;
 * yanlardakiler küçülür, döner (rotateY), derinleşir (translateZ) ve solar.
 * Otomatik oynatma (autoplay), oklar ve noktalar ile gezinme; yumuşak spring
 * geçişler. Karta tıklayınca o kart merkeze gelir.
 *
 * Framer'a özgü API'ler (addPropertyControls / ControlType / useIsStaticRenderer)
 * çıkarıldı; props yerine sabitler kullanıldı. Tema: marka yeşili + beyaz +
 * lacivert. Görseller placeholder (/card_bg_*.png) — ürün ekran görüntüleriyle
 * değiştirilebilir.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

const GREEN    = '#047857'
const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'
const MINT     = '#6ee7b7'
const MINT_L   = '#a7f3d0'
const NAVY     = '#60a5fa'

// ─── Kartlar (QABot özellikleri) ──────────────────────────────────────────────
const CARDS = [
  { tag: 'AKILLI ARAMA',  label: 'HİBRİT ERİŞİM',          sub: 'Vektör araması + BM25 — Ensemble Retriever',  img: '/screens/screen-08.png', accent: GREEN_LL },
  { tag: 'GÜVENİLİRLİK',  label: 'ONAYLI YANIT',           sub: 'Denetlenen, kaynağa dayalı, doğrulanmış bilgi', img: '/screens/screen-09.png', accent: GREEN_L  },
  { tag: 'KONTROL',       label: 'YÖNETİM PANELİ',         sub: 'Kod yazmadan tam kontrol, stüdyo modülü',       img: '/screens/screen-02.png', accent: MINT     },
  { tag: 'ORGANİZASYON',  label: 'HİYERARŞİK KATEGORİLER', sub: 'Sınırsız kırılımlı bilgi mimarisi',             img: '/screens/screen-05.png', accent: MINT_L   },
  { tag: 'İÇGÖRÜ',        label: 'ANALİTİK & KPI',         sub: 'Veriyle yönetilen kararlar, görsel raporlar',   img: '/screens/screen-06.png', accent: NAVY     },
  { tag: 'ÖĞRENME',       label: 'GERİ BİLDİRİM & ÖĞRENME',sub: 'Geri bildirimle sürekli iyileşen zekâ',         img: '/screens/screen-03.png', accent: GREEN_LL },
]

// ─── Coverflow ayarları ───────────────────────────────────────────────────────
const CARD_W       = 600   // aktif kart genişliği (ekran görüntüsü oranına göre)
const CARD_H       = 320
const CARD_RADIUS  = 18
const SPACING      = 380      // kartlar arası yatay mesafe (geniş kartlara göre)
const PERSPECTIVE  = 1300
const ROTATE_Y     = 16       // derece
const Z_DEPTH      = 100
const SCALE_NEAR   = 0.82
const SCALE_MID    = 0.68
const SCALE_FAR    = 0.55
const OPACITY_MID  = 0.45
const OPACITY_FAR  = 0
const AUTOPLAY_MS  = 3500
const RESP_BASE    = 1000     // bu genişlikte ölçek = 1
const RESP_MIN     = 0.62
const RESP_MAX     = 1.3

// Dairesel (wrap) ofset: i ile current arası en kısa fark
function getOffset(idx, current, total) {
  let diff = idx - current
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

export default function Carousel3DFeatures() {
  const n = CARDS.length
  const rootRef  = useRef(null)
  const inView   = useInView(rootRef, { margin: '-10% 0px' })
  const [current, setCurrent] = useState(Math.min(2, n - 1))
  const [paused, setPaused]   = useState(false)
  const [containerW, setContainerW] = useState(0)

  // Responsive ölçek (kapsayıcı genişliğine göre)
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(entries => {
      const w = entries?.[0]?.contentRect?.width
      if (typeof w === 'number' && Number.isFinite(w)) setContainerW(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scale = useMemo(() => {
    if (!containerW) return 1
    return Math.max(RESP_MIN, Math.min(RESP_MAX, containerW / RESP_BASE))
  }, [containerW])

  const cardW   = Math.round(CARD_W * scale)
  const cardH   = Math.round(CARD_H * scale)
  const spacing = SPACING * scale
  const zDepth  = Z_DEPTH * scale

  // Otomatik oynatma — sadece görünürken ve hover'da değilken
  useEffect(() => {
    if (!inView || paused) return
    const id = setInterval(() => setCurrent(c => (c + 1) % n), AUTOPLAY_MS)
    return () => clearInterval(id)
  }, [inView, paused, n])

  // Bir kartın 3B konum/ölçek/opaklık değerleri (merkeze uzaklığına göre)
  const cardProps = (pos) => {
    const abs = Math.abs(pos)
    const sc  = abs === 0 ? 1 : abs === 1 ? SCALE_NEAR : abs === 2 ? SCALE_MID : SCALE_FAR
    const op  = abs > 2 ? OPACITY_FAR : abs === 2 ? OPACITY_MID : abs === 1 ? 0.75 : 1
    return {
      x: pos * spacing, z: -abs * zDepth, rotateY: pos * ROTATE_Y, scale: sc, opacity: op,
      brightness: abs === 0 ? 1 : abs === 1 ? 0.6 : 0.35, zIndex: 10 - abs,
    }
  }

  const go = (dir) => setCurrent(c => (c + dir + n) % n)

  return (
    <section ref={rootRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative', width: '100%', padding: '7rem 4rem 5rem', boxSizing: 'border-box',
        borderTop: `1px solid ${GREEN_L}1f`, background: 'rgba(4,120,87,0.04)', overflow: 'hidden' }}>

      {/* Bölüm etiketi + başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2rem' }}>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.5em' }}>03</span>
        <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, ${GREEN_LL}, transparent)` }}/>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>NELER SUNAR</span>
      </div>
      <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '-0.01em', textAlign: 'center' }}>
        ÖZELLİKLER
      </h2>
      <p style={{ fontFamily: F_SPACE, fontSize: '0.95rem', color: 'rgba(255,255,255,0.42)', maxWidth: '540px', lineHeight: 1.7, margin: '0 auto 3rem', textAlign: 'center' }}>
        Kartların üzerinde gezinin ya da okları kullanın — QABot'u kurumsal bilgide fark yaratan kılan her şey.
      </p>

      {/* ── 3B COVERFLOW SAHNESİ ──────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', height: cardH + 60, perspective: `${PERSPECTIVE * scale}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Oklar */}
        {[{ dir: -1, lbl: '←', side: 'left' }, { dir: 1, lbl: '→', side: 'right' }].map(({ dir, lbl, side }) => (
          <button key={side} aria-label={dir === -1 ? 'Önceki' : 'Sonraki'} onClick={() => go(dir)} type="button"
            style={{ position: 'absolute', [side]: 16, top: '50%', transform: 'translateY(-50%)', zIndex: 100,
              width: 40, height: 40, borderRadius: '50%', border: `1px solid ${GREEN_L}40`, background: 'rgba(8,20,16,0.4)',
              color: '#fff', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            {lbl}
          </button>
        ))}

        {/* Kartlar */}
        {CARDS.map((card, i) => {
          const pos = getOffset(i, current, n)
          const p   = cardProps(pos)
          const isCenter = pos === 0
          return (
            <motion.div key={i} role="button" aria-label={card.label} tabIndex={0}
              onClick={() => setCurrent(i)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setCurrent(i) }}
              animate={{ 
                x: p.x, z: p.z, rotateY: p.rotateY, scale: p.scale, opacity: p.opacity, y: 0,
                boxShadow: isCenter 
                  ? `0 30px 80px rgba(0,0,0,0.7), 0 0 60px rgba(4, 120, 87, 0.55)` 
                  : `0 15px 45px rgba(4, 120, 87, 0.35)`,
                borderColor: isCenter ? card.accent + '80' : 'rgba(4, 120, 87, 0.3)'
              }}
              whileHover={{ 
                y: -12,
                boxShadow: isCenter 
                  ? `0 40px 90px rgba(0,0,0,0.8), 0 0 80px rgba(4, 120, 87, 0.75)` 
                  : `0 25px 60px rgba(4, 120, 87, 0.55)`
              }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              style={{ position: 'absolute', width: cardW, height: cardH, borderRadius: CARD_RADIUS, overflow: 'hidden',
                cursor: 'pointer', zIndex: p.zIndex, filter: `brightness(${p.brightness})`,
                pointerEvents: Math.abs(pos) <= 1 ? 'auto' : 'none', transformStyle: 'preserve-3d', outline: 'none',
                borderStyle: 'solid', borderWidth: '1px' }}>
              {/* Görsel */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${card.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }}/>
              {/* Koyu yeşil gradient perde */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(2,16,12,0.92) 0%, rgba(2,16,12,0.18) 55%, transparent 100%)` }}/>
              {isCenter && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${card.accent}1f, transparent 55%)` }}/>}

              {/* Etiket alanı */}
              <div style={{ position: 'absolute', left: 18, right: 18, bottom: 20 }}>
                <p style={{ fontFamily: F_ORBIT, fontSize: '7px', letterSpacing: '0.45em', color: card.accent, textTransform: 'uppercase', marginBottom: '6px' }}>{card.tag}</p>
                <h3 style={{ fontFamily: F_ORBIT, fontWeight: 900, fontSize: 'clamp(0.85rem, 1.4vw, 1.15rem)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em', lineHeight: 1.1, margin: 0 }}>
                  {card.label}
                </h3>
                {isCenter && (
                  <p style={{ fontFamily: F_SPACE, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, marginTop: '8px' }}>{card.sub}</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Noktalar */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '2rem' }}>
        {CARDS.map((c, i) => (
          <button key={i} aria-label={`${i + 1}. özellik`} onClick={() => setCurrent(i)}
            style={{ width: i === current ? '22px' : '7px', height: '7px', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0,
              background: i === current ? c.accent : 'rgba(255,255,255,0.22)', transition: 'all 0.35s ease' }}/>
        ))}
      </div>
    </section>
  )
}
