/**
 * MagicBentoStats.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot PİLOT BULGULARI — Framer'daki "MagicBentoGrid" tasarımının saf React'e
 * uyarlanmış sürümü. İçerik, QABot akademik makalesindeki GERÇEK pilot
 * metrikleridir (uydurma değil):
 *   • %91,7 gerçeğe uygunluk doğruluğu (bağımsız değerlendirici, n=72, κ=0,82)
 *   • 641 pilot sorgu (canlı üretim ortamı — Balıkesir Üni. staj süreçleri)
 *   • 9,4 sn ortalama yanıt süresi
 *   • 0,825 Answer Relevancy (LLM-as-Judge)
 *   • %84 / %12 / %3 geri bildirim dağılımı (nötr / olumlu / olumsuz)
 *   • 116 onaylı kayıt (anlamsal atlama ile hızlanan doğrulanmış Q&A)
 *
 * Efektler (orijinalden korundu): imleç SPOTLIGHT'ı, karta yakınlığa göre KENAR
 * GLOW halkası, hover'da yıldız PARÇACIKLARI, TILT + MANYETİZMA ve tıklamada
 * RIPPLE. Framer'a özgü API'ler (addPropertyControls / ControlType) çıkarıldı.
 * Tema: marka yeşili (#10b981) glow, koyu yeşil kart zemini, gradient sayılar.
 * ════════════════════════════════════════════════════════════════════════════
 */
import * as React from 'react'

// ─── Yapılandırma (Framer prop'ları yerine sabitler) ──────────────────────────
const LAYOUT = { gap: 14, columnsMobile: 1, columnsTablet: 2, columnsDesktop: 4, maxWidth: 1120 }
const STYLEG = { radius: 18, borderWidth: 1, borderColor: 'rgba(52,211,153,0.16)', textColor: '#ffffff', labelColor: '#34d399', titleSize: 34, descSize: 12.5, cardMinHeight: 150 }
const EFFECTS = { enableSpotlight: true, spotlightRadius: 340, enableBorderGlow: true, glowColor: '#10b981', enableStars: true, particleCount: 12, enableTilt: true, tiltStrength: 7, enableMagnetism: true, magnetStrength: 8, clickRipple: true }

const CARD_BG = 'rgba(6,18,14,0.62)'

// ─── Bento kartları — makale gerçek metrikleri ────────────────────────────────
const ITEMS = [
  { size: 'Big',    label: 'DOĞRULUK',          title: '%91,7', description: 'Bağımsız iki değerlendiriciyle ölçülen gerçeğe uygunluk oranı (n=72). Değerlendiriciler arası uyum κ = 0,82 (neredeyse mükemmel).', background: CARD_BG },
  { size: 'Normal', label: 'YANIT SÜRESİ',      title: '9,4 sn', description: 'Pilot süresince ortalama yanıt süresi.', background: CARD_BG },
  { size: 'Normal', label: 'ONAYLI KAYIT',      title: '116',   description: 'Anlamsal atlama ile gelecekte hızlanan doğrulanmış Q&A.', background: CARD_BG },
  { size: 'Wide',   label: 'ANSWER RELEVANCY',  title: '0,825', description: 'LLM-as-Judge ile ölçülen yanıt uygunluğu — üretim kapasitesinin sağlamlığı.', background: CARD_BG },
  { size: 'Wide',   label: 'PİLOT SORGU',       title: '641',   description: 'Canlı üretim ortamında (Balıkesir Üni. staj süreçleri) yöneltilen toplam soru.', background: CARD_BG },
  { size: 'Wide',   label: 'GERİ BİLDİRİM',     title: '%84 / %12 / %3', description: 'Nötr / olumlu / olumsuz geri bildirim dağılımı (641 etkileşim).', background: CARD_BG },
]

// ─── Yardımcılar ──────────────────────────────────────────────────────────────
function clamp01(v) { return Math.max(0, Math.min(1, v)) }
function parseRgb(input) {
  const fb = { r: 16, g: 185, b: 129 }
  if (!input || input[0] !== '#') return fb
  const hex = input.slice(1)
  if (hex.length === 6) return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }
  return fb
}
function makeParticles(count) {
  return Array.from({ length: Math.max(0, Math.min(40, count)) }, () => ({
    x: Math.random() * 100, y: Math.random() * 100,
    dx: (Math.random() - 0.5) * 120, dy: (Math.random() - 0.5) * 120,
    size: 2 + Math.random() * 3, dur: 2 + Math.random() * 2.2, delay: Math.random() * 0.8,
  }))
}

// ─── Tek bento kartı ──────────────────────────────────────────────────────────
function BentoCard({ item, rgb, setRef }) {
  const ref = React.useRef(null)
  const particles = React.useMemo(() => makeParticles(EFFECTS.particleCount), [])

  const setVars = (rx, ry, mx, my) => {
    const el = ref.current; if (!el) return
    el.style.setProperty('--mb-rx', `${rx}deg`); el.style.setProperty('--mb-ry', `${ry}deg`)
    el.style.setProperty('--mb-mx', `${mx}px`);  el.style.setProperty('--mb-my', `${my}px`)
  }
  const onMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const nx = (e.clientX - r.left - r.width / 2) / (r.width / 2)
    const ny = (e.clientY - r.top - r.height / 2) / (r.height / 2)
    setVars(
      EFFECTS.enableTilt ? ny * -EFFECTS.tiltStrength : 0,
      EFFECTS.enableTilt ? nx * EFFECTS.tiltStrength : 0,
      EFFECTS.enableMagnetism ? nx * EFFECTS.magnetStrength : 0,
      EFFECTS.enableMagnetism ? ny * EFFECTS.magnetStrength : 0,
    )
  }
  const onLeave = () => setVars(0, 0, 0, 0)
  const onClick = (e) => {
    if (!EFFECTS.clickRipple) return
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    const d = Math.max(Math.hypot(x, y), Math.hypot(r.width - x, y), Math.hypot(x, r.height - y), Math.hypot(r.width - x, r.height - y))
    const rip = document.createElement('span')
    rip.className = 'mb-ripple'
    rip.style.left = `${x - d}px`; rip.style.top = `${y - d}px`; rip.style.width = `${d * 2}px`; rip.style.height = `${d * 2}px`
    rip.style.setProperty('--mb-r', `${rgb.r}`); rip.style.setProperty('--mb-g', `${rgb.g}`); rip.style.setProperty('--mb-b', `${rgb.b}`)
    el.appendChild(rip)
    rip.addEventListener('animationend', () => rip.remove(), { once: true })
  }

  return (
    <div ref={(el) => { ref.current = el; setRef(el) }} className="mb-card" data-size={item.size}
      onPointerMove={onMove} onPointerLeave={onLeave} onClick={onClick}
      style={{ background: item.background, minHeight: STYLEG.cardMinHeight }}>
      {EFFECTS.enableStars && (
        <div className="mb-particles" aria-hidden="true">
          {particles.map((p, i) => (
            <span key={i} className="mb-particle" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size}px`, '--dx': `${p.dx}px`, '--dy': `${p.dy}px`, '--dur': `${p.dur}s`, '--del': `${p.delay}s` }}/>
          ))}
        </div>
      )}
      <div className="mb-header"><span className="mb-label" style={{ color: STYLEG.labelColor }}>{item.label}</span></div>
      <div className="mb-content">
        <div className="mb-title">{item.title}</div>
        <div className="mb-desc">{item.description}</div>
      </div>
    </div>
  )
}

export default function MagicBentoStats() {
  const rootRef = React.useRef(null)
  const spotRef = React.useRef(null)
  const cardRefs = React.useRef([])
  const rgb = React.useMemo(() => parseRgb(EFFECTS.glowColor), [])
  const raf = React.useRef(null)
  const ptr = React.useRef({ x: 0, y: 0, inside: false })

  const resetGlow = React.useCallback(() => {
    for (const el of cardRefs.current) {
      if (!el) continue
      el.style.setProperty('--mb-gx', '50%'); el.style.setProperty('--mb-gy', '50%')
      el.style.setProperty('--mb-gi', '0');   el.style.setProperty('--mb-gr', `${EFFECTS.spotlightRadius}px`)
    }
    if (spotRef.current) spotRef.current.style.opacity = '0'
  }, [])

  const applyGlow = React.useCallback(() => {
    raf.current = null
    const root = rootRef.current; if (!root) return
    const { x: cx, y: cy, inside } = ptr.current
    if (!inside) { resetGlow(); return }
    const rootRect = root.getBoundingClientRect()
    let nearest = Infinity
    const proximity = EFFECTS.spotlightRadius * 0.5
    const fade = EFFECTS.spotlightRadius * 0.9
    for (const el of cardRefs.current) {
      if (!el) continue
      const r = el.getBoundingClientRect()
      const mcx = r.left + r.width / 2, mcy = r.top + r.height / 2
      const edgeBias = Math.max(r.width, r.height) * 0.3
      const dist = Math.max(0, Math.hypot(cx - mcx, cy - mcy) - edgeBias)
      nearest = Math.min(nearest, dist)
      let intensity = 0
      if (dist <= proximity) intensity = 1
      else if (dist <= fade) intensity = (fade - dist) / (fade - proximity)
      intensity = clamp01(intensity)
      el.style.setProperty('--mb-gx', `${(cx - r.left) / r.width * 100}%`)
      el.style.setProperty('--mb-gy', `${(cy - r.top) / r.height * 100}%`)
      el.style.setProperty('--mb-gi', `${intensity}`)
      el.style.setProperty('--mb-gr', `${EFFECTS.spotlightRadius}px`)
    }
    if (spotRef.current) {
      spotRef.current.style.left = `${cx - rootRect.left}px`
      spotRef.current.style.top = `${cy - rootRect.top}px`
      spotRef.current.style.opacity = `${clamp01(1 - nearest / EFFECTS.spotlightRadius) * 0.85}`
    }
  }, [resetGlow])

  const schedule = React.useCallback(() => {
    if (raf.current != null) return
    raf.current = window.requestAnimationFrame(applyGlow)
  }, [applyGlow])

  const onMove = React.useCallback((e) => { ptr.current = { x: e.clientX, y: e.clientY, inside: true }; schedule() }, [schedule])
  const onLeave = React.useCallback(() => { ptr.current.inside = false; resetGlow() }, [resetGlow])

  const rootVars = {
    '--mb-r': rgb.r, '--mb-g': rgb.g, '--mb-b': rgb.b,
    '--mb-border-color': STYLEG.borderColor, '--mb-border-width': `${STYLEG.borderWidth}px`,
    '--mb-radius': `${STYLEG.radius}px`, '--mb-gap': `${LAYOUT.gap}px`,
    '--mb-title': `${STYLEG.titleSize}px`, '--mb-desc': `${STYLEG.descSize}px`,
    '--mb-maxw': `${LAYOUT.maxWidth}px`, '--mb-text': STYLEG.textColor,
    '--mb-cols-m': `${LAYOUT.columnsMobile}`, '--mb-cols-t': `${LAYOUT.columnsTablet}`, '--mb-cols-d': `${LAYOUT.columnsDesktop}`,
  }

  return (
    <section style={{ position: 'relative', width: '100%', padding: '7rem 4rem', boxSizing: 'border-box', borderTop: `1px solid rgba(16,185,129,0.12)` }}>
      {/* Etiket + başlık */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2rem' }}>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: '#34d399', letterSpacing: '0.5em' }}>04</span>
        <div style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, #34d399, transparent)' }}/>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>PİLOT BULGULAR</span>
      </div>
      <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
        SAHADA KANITLANDI
      </h2>
      <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.95rem', color: 'rgba(255,255,255,0.42)', maxWidth: '600px', lineHeight: 1.7, marginBottom: '3rem' }}>
        Aşağıdaki rakamlar teorik değil; QABot'un canlı üretim ortamındaki pilot uygulamasından (akademik makale) elde edilen gerçek bulgulardır. Kartların üzerine gelin.
      </p>

      {/* Bento ızgarası */}
      <div ref={rootRef} className="mb-root" onPointerMove={onMove} onPointerLeave={onLeave} style={rootVars}>
        <style>{`
          .mb-root { position: relative; width: 100%; color: var(--mb-text); }
          .mb-gridwrap { width: 100%; display: flex; justify-content: center; }
          .mb-grid { width: min(100%, var(--mb-maxw)); display: grid; gap: var(--mb-gap);
            grid-template-columns: repeat(var(--mb-cols-m), minmax(0,1fr)); align-items: stretch; }
          @media (min-width: 600px) { .mb-grid { grid-template-columns: repeat(var(--mb-cols-t), minmax(0,1fr)); } }
          @media (min-width: 1024px) {
            .mb-grid { grid-template-columns: repeat(var(--mb-cols-d), minmax(0,1fr)); }
            .mb-card[data-size="Wide"] { grid-column: span 2; }
            .mb-card[data-size="Tall"] { grid-row: span 2; }
            .mb-card[data-size="Big"]  { grid-column: span 2; grid-row: span 2; }
          }
          .mb-spotlight { position: absolute; width: 700px; height: 700px; border-radius: 999px; pointer-events: none;
            transform: translate(-50%,-50%); opacity: 0; mix-blend-mode: screen; z-index: 1; transition: opacity 200ms ease;
            background: radial-gradient(circle, rgba(var(--mb-r),var(--mb-g),var(--mb-b),0.16) 0%, rgba(var(--mb-r),var(--mb-g),var(--mb-b),0.06) 30%, transparent 70%); }
          .mb-card { position: relative; border-radius: var(--mb-radius); border: var(--mb-border-width) solid var(--mb-border-color);
            padding: 22px; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; overflow: hidden;
            --mb-rx:0deg; --mb-ry:0deg; --mb-mx:0px; --mb-my:0px; --mb-gx:50%; --mb-gy:50%; --mb-gi:0; --mb-gr:340px;
            transform: translate3d(var(--mb-mx),var(--mb-my),0) rotateX(var(--mb-rx)) rotateY(var(--mb-ry));
            transform-style: preserve-3d; transition: transform 180ms ease, box-shadow 220ms ease, border-color 220ms ease; z-index: 2; }
          .mb-card:hover { box-shadow: 0 14px 44px rgba(0,0,0,0.4); border-color: rgba(52,211,153,0.4); }
          .mb-card::after { content:""; position:absolute; inset:0; border-radius:inherit; padding:6px; pointer-events:none; z-index:1;
            background: radial-gradient(var(--mb-gr) circle at var(--mb-gx) var(--mb-gy),
              rgba(var(--mb-r),var(--mb-g),var(--mb-b),calc(var(--mb-gi)*0.9)) 0%,
              rgba(var(--mb-r),var(--mb-g),var(--mb-b),calc(var(--mb-gi)*0.35)) 28%, transparent 60%);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask-composite: exclude;
            opacity: ${EFFECTS.enableBorderGlow ? 1 : 0}; transition: opacity 200ms ease; }
          .mb-header { display:flex; justify-content:space-between; align-items:center; z-index:2; }
          .mb-label { font-family: 'Orbitron', sans-serif; font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase; }
          .mb-content { display:flex; flex-direction:column; gap:8px; z-index:2; margin-top:auto; }
          .mb-title { font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: var(--mb-title); line-height: 1.05;
            background: linear-gradient(135deg, #ffffff, #34d399); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
          .mb-card[data-size="Big"] .mb-title { font-size: calc(var(--mb-title) * 1.5); }
          .mb-desc { font-family: 'Space Grotesk', sans-serif; font-size: var(--mb-desc); line-height: 1.5; color: rgba(255,255,255,0.55); }
          .mb-particles { position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity 220ms ease; z-index:2; }
          .mb-card:hover .mb-particles { opacity: 1; }
          .mb-particle { position:absolute; border-radius:999px; background: rgba(var(--mb-r),var(--mb-g),var(--mb-b),1);
            box-shadow: 0 0 10px rgba(var(--mb-r),var(--mb-g),var(--mb-b),0.6);
            animation: mbFloat var(--dur) ease-in-out var(--del) infinite alternate; }
          @keyframes mbFloat { from { transform: translate3d(0,0,0) rotate(0deg); opacity:1; } to { transform: translate3d(var(--dx),var(--dy),0) rotate(240deg); opacity:0.35; } }
          .mb-ripple { position:absolute; border-radius:999px; pointer-events:none; transform: scale(0); animation: mbRipple 700ms ease-out forwards; z-index:3;
            background: radial-gradient(circle, rgba(var(--mb-r),var(--mb-g),var(--mb-b),0.36) 0%, rgba(var(--mb-r),var(--mb-g),var(--mb-b),0.18) 28%, transparent 70%); }
          @keyframes mbRipple { 0% { transform: scale(0); opacity:1; } 100% { transform: scale(1); opacity:0; } }
        `}</style>

        {EFFECTS.enableSpotlight && <div ref={spotRef} className="mb-spotlight" aria-hidden="true"/>}
        <div className="mb-gridwrap">
          <div className="mb-grid">
            {ITEMS.map((item, i) => (
              <BentoCard key={i} item={item} rgb={rgb} setRef={(el) => { cardRefs.current[i] = el }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
