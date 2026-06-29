/**
 * TechMarquee.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot MİMARİ / TEKNOLOJİ bölümü — Framer'daki "Logo Marquee X" tasarımının
 * saf React'e uyarlanmış sürümü.
 *
 * Ters yönde sonsuz kayan İKİ SIRA döşeme; yumuşak kenar fade; hover'da durur;
 * görünür değilken (IntersectionObserver) animasyon duraklatılır. Orijinalde
 * döşemeler logo görselleriydi; burada teknoloji adları METİN döşemesi olarak
 * gösterilir (gerçek logo dosyası gerekmeden). Tema: marka yeşili.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useEffect, useId, useRef, useState } from 'react'

const F_ORBIT = 'Orbitron, sans-serif'
const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'

const ROW1 = ['REACT', 'PYTHON · FLASK', 'LANGCHAIN', 'CHROMADB', 'HUGGINGFACE', 'SQLALCHEMY', 'REST API']
const ROW2 = ['BM25', 'ENSEMBLE RETRIEVER', 'VEKTÖR VERİTABANI', 'ÇOK DİLLİ GÖMME', 'ONAYLI YANIT', 'ÇOK KİRACILI', 'LLM ORKESTRASYON']

const SPEED   = 55    // px/s
const GAP     = 22
const ROW_GAP = 18
const FADE    = 160

// ── Tek döşeme (metin "logo") ─────────────────────────────────────────────────
function Tile({ label }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '12px', height: 58, padding: '0 26px',
      borderRadius: 14, background: 'rgba(6,18,14,0.6)', border: `1px solid ${GREEN_L}2e`, flexShrink: 0, whiteSpace: 'nowrap',
    }}>
      <span style={{ color: GREEN_LL, fontSize: '12px' }}>◆</span>
      <span style={{ fontFamily: F_ORBIT, fontSize: '13px', fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.8)' }}>{label}</span>
    </div>
  )
}

// ── Tek sıra (sonsuz kayan) ───────────────────────────────────────────────────
function MarqueeRow({ items, direction, inView }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const animName = `lm${rawId}`
  const rowClass = `lmRow${rawId}`
  const trackClass = `lmTrack${rawId}`
  const firstCopyRef = useRef(null)
  const [wrapperW, setWrapperW] = useState(0)

  // Bir kopyayı viewport'tan geniş yapmak için tekrarla (kesintisiz -50% döngü)
  const repeat = Math.max(2, Math.ceil(1700 / (items.length * 200)))
  const repeated = []
  for (let r = 0; r < repeat; r++) repeated.push(...items)

  useEffect(() => {
    const el = firstCopyRef.current
    if (!el) return
    const measure = () => setWrapperW(el.offsetWidth)
    measure()
    let ro
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(measure); ro.observe(el) }
    return () => ro && ro.disconnect()
  }, [])

  const dur = wrapperW > 0 ? wrapperW / SPEED : repeated.length * (180 + GAP) / SPEED

  const renderCopy = (copyIndex) => (
    <div key={copyIndex} ref={copyIndex === 0 ? firstCopyRef : undefined} aria-hidden={copyIndex > 0 ? true : undefined}
      style={{ display: 'flex', gap: GAP, marginRight: GAP, flexShrink: 0 }}>
      {repeated.map((label, i) => <Tile key={i} label={label} />)}
    </div>
  )

  return (
    <div className={rowClass} style={{
      width: '100%', overflowX: 'clip', overflowY: 'visible',
      WebkitMaskImage: `linear-gradient(to right, transparent 0, #000 ${FADE}px, #000 calc(100% - ${FADE}px), transparent 100%)`,
      maskImage: `linear-gradient(to right, transparent 0, #000 ${FADE}px, #000 calc(100% - ${FADE}px), transparent 100%)`,
    }}>
      <style>{`
        @keyframes ${animName}{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        .${rowClass}:hover .${trackClass}{animation-play-state:paused !important;}
      `}</style>
      <div className={trackClass} style={{
        display: 'flex', width: 'max-content', willChange: 'transform',
        animationName: animName, animationDuration: `${dur}s`, animationTimingFunction: 'linear',
        animationIterationCount: 'infinite', animationDirection: direction === 'right' ? 'reverse' : 'normal',
        animationPlayState: inView ? 'running' : 'paused',
      }}>
        {renderCopy(0)}
        {renderCopy(1)}
      </div>
    </div>
  )
}

export default function TechMarquee() {
  const ref = useRef(null)
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => { for (const e of entries) setInView(e.isIntersecting) }, { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section ref={ref} style={{ position: 'relative', width: '100%', padding: '6rem 0', boxSizing: 'border-box', borderTop: `1px solid ${GREEN_L}1f` }}>
      {/* Etiket + başlık (kenarlardan paddingli) */}
      <div style={{ padding: '0 4rem', marginBottom: '2.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.6rem' }}>
          <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.5em' }}>08</span>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, ${GREEN_LL}, transparent)` }}/>
          <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>MİMARİ</span>
        </div>
        <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
          GÜÇLÜ BİR MİMARİ ÜZERİNDE
        </h2>
      </div>

      {/* İki sıra — ters yönlerde */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>
        <MarqueeRow items={ROW1} direction="left" inView={inView} />
        <MarqueeRow items={ROW2} direction="right" inView={inView} />
      </div>
    </section>
  )
}
