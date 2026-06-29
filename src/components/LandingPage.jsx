/**
 * LandingPage.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot ÜRÜN TANITIM SAYFASI (galeri sonrası, dikey kaydırmalı uzun sayfa).
 *
 * Amaç: ziyaretçiyi baştan sona ikna eden, "satışçı", hareketli ve endüstri
 * standardında bir tanıtım deneyimi. Tüm bölümler Türkçe; marka teması yeşil
 * (#047857) + beyaz + lacivert. 3B yıldız/DNA arka planı paylaşılan World
 * canvas'ından gelir; bu sayfa onun üstünde yarı saydam akar.
 *
 * Animasyon stratejisi (Framer Motion):
 *  • Üstte SCROLL İLERLEME ÇUBUĞU      → useScroll + useSpring (scaleX)
 *  • Öne çıkan görselde PARALLAX        → useScroll(target) + useTransform
 *  • Bölüm girişlerinde SCROLL-REVEAL   → whileInView + stagger
 *  • Görsellerde "arkadan öne büyüme"   → GrowImage (spring scale)
 *  • SSS'de AÇILIR-KAPANIR akordeon      → AnimatePresence + height
 *  • Teknoloji şeridinde MARQUEE         → CSS ticker
 *  • Kartlarda hover yükselme + yüzme    → whileHover + floatY keyframe
 *
 * Bölümler: Manifesto · Öne Çıkan Görsel · Neden QABot · Özellikler · Sayılar ·
 *           Çözümler · Ürün Görüntüleri · Nasıl Çalışır · Teknoloji · SSS ·
 *           İletişim (CTA) · Footer (endüstri standardı).
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useRef, useEffect, useState } from 'react'
import { motion, useInView, useScroll, useSpring, useTransform, AnimatePresence } from 'framer-motion'

// ─── Marka paleti (yeşil / beyaz / lacivert) ──────────────────────────────────
const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

const GREEN    = '#047857'
const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'
const MINT     = '#6ee7b7'
const MINT_L   = '#a7f3d0'
const NAVY     = '#60a5fa'

// ─── Ortak animasyon varyantları ──────────────────────────────────────────────
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

// ─── Animasyonlu sayaç (sayılar bölümü) ───────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000, isActive }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!isActive) return
    let frame = 0
    const total = Math.ceil(duration / 16)
    const timer = setInterval(() => {
      frame++
      const p = frame / total
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.round(eased * end))
      if (frame >= total) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [end, duration, isActive])
  return <>{count}{suffix}</>
}

// ─── Yüzen yeşil orb'lar (sürekli arka plan hareketi) ─────────────────────────
function FloatingOrbs() {
  const orbs = [
    { size: 440, top: '6%',  left: '4%',  color: 'rgba(4,120,87,0.18)',   dur: 16, dx: 28, dy: -36 },
    { size: 340, top: '46%', left: '80%', color: 'rgba(52,211,153,0.10)', dur: 22, dx: -32, dy: 30 },
    { size: 280, top: '78%', left: '20%', color: 'rgba(96,165,250,0.09)', dur: 26, dx: 24, dy: -24 },
  ]
  return (
    <>
      {orbs.map((o, i) => (
        <motion.div key={i} aria-hidden
          animate={{ x: [0, o.dx, 0], y: [0, o.dy, 0] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: o.top, left: o.left, width: o.size, height: o.size,
            borderRadius: '50%', background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            filter: 'blur(8px)', pointerEvents: 'none', zIndex: 0,
          }}/>
      ))}
    </>
  )
}

// ─── Arkadan öne büyüyüp yerleşen görsel (full odak) ──────────────────────────
function GrowImage({ src, title, tag, accent, ratio = '16 / 10' }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, scale: 0.55, y: 50 }}
      animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ type: 'spring', stiffness: 80, damping: 15, mass: 0.8 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', aspectRatio: ratio, borderRadius: '8px', overflow: 'hidden', cursor: 'pointer',
        transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: hovered ? `0 24px 70px rgba(0,0,0,0.55), 0 0 34px ${accent}33` : '0 10px 34px rgba(0,0,0,0.45)',
        border: `1px solid ${accent}22`,
      }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center',
        transform: hovered ? 'scale(1.07)' : 'scale(1)', transition: 'transform 0.6s cubic-bezier(0.22,1,0.36,1)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(2,12,12,0.9) 0%, rgba(2,12,12,0.25) 50%, transparent 100%)' }}/>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, ${accent}18, transparent 55%)`, opacity: hovered ? 1 : 0, transition: 'opacity 0.4s' }}/>
      <div style={{ position: 'absolute', bottom: '1.1rem', left: '1.2rem', right: '1.2rem' }}>
        <p style={{ fontFamily: F_ORBIT, fontSize: '7px', letterSpacing: '0.5em', color: accent, textTransform: 'uppercase', marginBottom: '6px' }}>{tag}</p>
        <h3 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(0.78rem, 1.3vw, 1.05rem)', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{title}</h3>
      </div>
      <div style={{ position: 'absolute', top: '0.9rem', right: '0.9rem', width: '30px', height: '30px', borderRadius: '50%',
        border: `1px solid ${accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: '12px',
        opacity: hovered ? 1 : 0, transform: hovered ? 'scale(1)' : 'scale(0.7)', transition: 'all 0.3s' }}>↗</div>
    </motion.div>
  )
}

// ─── Bölüm sarmalayıcı (scroll-reveal + stagger) ──────────────────────────────
function Section({ children, style = {} }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  return (
    <motion.section ref={ref} variants={stagger(0.1)} initial="hidden" animate={inView ? 'show' : 'hidden'}
      style={{ position: 'relative', width: '100%', padding: '7rem 4rem', boxSizing: 'border-box', ...style }}>
      {children}
    </motion.section>
  )
}

function SectionLabel({ num, label }) {
  return (
    <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '4rem' }}>
      <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.5em' }}>{num}</span>
      <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, ${GREEN_LL}, transparent)` }}/>
      <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.40)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>{label}</span>
    </motion.div>
  )
}

function Divider() {
  return <motion.div variants={fadeIn} style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, transparent, ${GREEN_L}33 30%, ${GREEN_L}33 70%, transparent)` }}/>
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 01 — MANİFESTO (hero)
// ════════════════════════════════════════════════════════════════════════════
function ManifestoSection() {
  return (
    <Section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 60% at 60% 50%, ${GREEN}1f 0%, transparent 70%)` }}/>
      <SectionLabel num="01" label="MANİFESTO" />
      <motion.h2 variants={fadeUp} style={{
        fontFamily: F_ORBIT, fontWeight: 900, fontSize: 'clamp(2.3rem, 6.2vw, 6.2rem)', lineHeight: 0.98,
        letterSpacing: '-0.02em', color: '#fff', textTransform: 'uppercase', maxWidth: '1000px', marginBottom: '3rem' }}>
        KURUMSAL BİLGİYİ<br />
        <span style={{ WebkitTextStroke: `1px ${GREEN_LL}`, color: 'transparent' }}>AKILLI</span> YANITA<br />
        DÖNÜŞTÜRÜYORUZ
      </motion.h2>
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: '4rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <p style={{ fontFamily: F_SPACE, fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: '470px' }}>
          QABot; kurumunuzun mevzuat, politika ve rehber belgelerini anlamsal olarak analiz eden, çalışanların
          aradığı bilgiye saniyeler içinde — kaynağa dayalı ve doğru yanıtlarla — ulaşmasını sağlayan bir
          Agentic RAG platformudur.
        </p>
        <p style={{ fontFamily: F_SPACE, fontSize: 'clamp(0.9rem, 1.4vw, 1.1rem)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.8, maxWidth: '400px' }}>
          Belge yığınlarını yönetilebilir bilgi bankalarına dönüştürürken, kullanıcı deneyimini ön planda tutan
          modern bir arayüz ve kapsamlı bir yönetim paneli sunar.
        </p>
      </motion.div>
      {/* Kayan terim şeridi (marquee) */}
      <motion.div variants={fadeIn} style={{ position: 'absolute', bottom: '3rem', left: 0, right: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: '3rem', whiteSpace: 'nowrap', animation: 'ticker 20s linear infinite',
          fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.5em', color: `${GREEN_L}2e`, textTransform: 'uppercase' }}>
          {Array(8).fill(['AGENTIC RAG', 'VEKTÖR ARAMA', 'BM25', 'ONAYLI YANIT', 'ANALİTİK', '◈']).flat().map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </motion.div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// ÖNE ÇIKAN GÖRSEL — arkadan öne büyüyen + scroll PARALLAX (useScroll/useTransform)
// ════════════════════════════════════════════════════════════════════════════
function FeaturedSection({ scrollContainer }) {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  // Görsel, sayfa kaydıkça hafifçe yukarı süzülür (parallax derinlik hissi)
  const { scrollYProgress } = useScroll({ container: scrollContainer, target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <div ref={ref} style={{ padding: '4rem 4rem 6rem', position: 'relative' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.42, y: 60, filter: 'blur(8px)' }}
        animate={inView ? { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' } : {}}
        transition={{ type: 'spring', stiffness: 60, damping: 16, mass: 1 }}
        style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', aspectRatio: '16 / 8.5',
          borderRadius: '12px', overflow: 'hidden', border: `1px solid ${GREEN_L}33`,
          boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 60px ${GREEN}30` }}>
        {/* Parallax görsel katmanı → ürün ana ekran görüntüsüyle değiştir */}
        <motion.div style={{ position: 'absolute', inset: '-8% 0', backgroundImage: 'url(/card_bg_3.png)', backgroundSize: 'cover', backgroundPosition: 'center', y: imgY }}/>
        <div style={{ position: 'absolute', inset: 0,
          background: 'linear-gradient(120deg, rgba(2,12,12,0.55) 0%, transparent 45%), linear-gradient(to top, rgba(2,12,12,0.85), transparent 60%)' }}/>
        <div style={{ position: 'absolute', bottom: '1.8rem', left: '2rem', right: '2rem' }}>
          <p style={{ fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.5em', color: GREEN_LL, textTransform: 'uppercase', marginBottom: '8px' }}>ÜRÜN ARAYÜZÜ</p>
          <h3 style={{ fontFamily: F_ORBIT, fontWeight: 900, fontSize: 'clamp(1.1rem, 2.4vw, 2rem)', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            AKILLI SOHBET & ONAYLI YANIT DENEYİMİ
          </h3>
        </div>
      </motion.div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 02 — NEDEN QABOT (faydalar)
// ════════════════════════════════════════════════════════════════════════════
const BENEFITS = [
  { icon: '⚡', title: 'SANİYELER İÇİNDE YANIT', desc: 'Belgeler arasında kaybolmadan, aradığınız bilgiye anında ulaşın.', accent: GREEN_LL },
  { icon: '✓',  title: 'KAYNAĞA DAYALI GÜVEN',   desc: 'Her yanıt belgeye dayanır; onaylananlar "Onaylı" rozetiyle gelir.', accent: GREEN_L },
  { icon: '◆',  title: 'KODSUZ YÖNETİM',          desc: 'Stüdyo paneliyle kurumsal kimlik ve içerik tamamen sizin elinizde.', accent: MINT },
  { icon: '↻',  title: 'SÜREKLİ ÖĞRENME',         desc: 'Geri bildirimlerle her etkileşimde daha doğru, daha kurumsal.', accent: NAVY },
]

function BenefitsSection() {
  return (
    <Section style={{ borderTop: `1px solid ${GREEN_L}1f` }}>
      <SectionLabel num="02" label="NEDEN QABOT" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.4rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '3.5rem', letterSpacing: '-0.01em' }}>
        KURUMSAL BİLGİDE FARK
      </motion.h2>
      <motion.div variants={stagger(0.08)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.4rem' }}>
        {BENEFITS.map((b, i) => (
          <motion.div key={i} variants={fadeUp} whileHover={{ y: -8 }}
            style={{ position: 'relative', padding: '2rem 1.6rem', borderRadius: '10px',
              border: `1px solid ${b.accent}22`, background: 'rgba(8,20,16,0.35)', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-30%', right: '-20%', width: '140px', height: '140px', borderRadius: '50%',
              background: `radial-gradient(circle, ${b.accent}22, transparent 70%)`, animation: `floatY ${6 + i}s ease-in-out infinite` }}/>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${b.accent}1a`, border: `1px solid ${b.accent}40`, color: b.accent, fontSize: '18px', marginBottom: '1.4rem' }}>{b.icon}</div>
            <h3 style={{ fontFamily: F_ORBIT, fontSize: '0.95rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.7rem', lineHeight: 1.25 }}>{b.title}</h3>
            <p style={{ fontFamily: F_SPACE, fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{b.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 03 — ÖZELLİKLER
// ════════════════════════════════════════════════════════════════════════════
const SERVICES = [
  { num: '01', name: 'HİBRİT ERİŞİM',           desc: 'ChromaDB vektör araması ile BM25 anahtar-kelime hassasiyetini birleştiren Ensemble Retriever mimarisi.', accent: GREEN_LL },
  { num: '02', name: 'ONAYLI YANIT',            desc: 'Panelden denetlenip doğruluğu onaylanan yanıtlar "Onaylı" etiketiyle gösterilir; bilgi kirliliği önlenir.', accent: GREEN_L },
  { num: '03', name: 'YÖNETİM PANELİ',          desc: 'Kurumsal kimlik, kategoriler ve içerikler kod yazmadan, stüdyo modülüyle güncellenir.', accent: MINT },
  { num: '04', name: 'GERİ BİLDİRİM & ÖĞRENME', desc: 'Kullanıcı düzeltme talepleri anlık izlenir; yapay zekanın öğrenmesi manuel müdahalelerle iyileştirilir.', accent: MINT_L },
  { num: '05', name: 'ANALİTİK',                desc: 'Kullanım istatistikleri, kredi tüketimi, popüler kategoriler ve yanıt hızı görselleştirilmiş raporlarla sunulur.', accent: NAVY },
]

function ServicesSection() {
  const [hovered, setHovered] = useState(-1)
  return (
    <Section style={{ background: 'rgba(4,120,87,0.04)', borderTop: `1px solid ${GREEN_L}1f` }}>
      <SectionLabel num="03" label="NELER SUNAR" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '4rem', letterSpacing: '-0.01em' }}>ÖZELLİKLER</motion.h2>
      <motion.div variants={stagger(0.05)}>
        {SERVICES.map((s, i) => (
          <motion.div key={s.num} variants={fadeUp} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.8rem 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
              cursor: 'default', transition: 'all 0.3s ease', background: hovered === i ? `${s.accent}10` : 'transparent',
              paddingLeft: hovered === i ? '1rem' : '0', paddingRight: hovered === i ? '1rem' : '0', borderRadius: '4px' }}>
            <span style={{ fontFamily: F_ORBIT, fontSize: '10px', color: hovered === i ? s.accent : 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', minWidth: '36px', transition: 'color 0.3s' }}>{s.num}</span>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.10)' }}/>
            <span style={{ fontFamily: F_ORBIT, fontSize: 'clamp(0.95rem, 1.9vw, 1.5rem)', fontWeight: 700, color: hovered === i ? '#fff' : 'rgba(255,255,255,0.75)', textTransform: 'uppercase', flex: 1, letterSpacing: '0.04em', transition: 'color 0.3s' }}>{s.name}</span>
            <p style={{ fontFamily: F_SPACE, fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, maxWidth: '440px', textAlign: 'right', opacity: hovered === i ? 1 : 0, transform: hovered === i ? 'translateX(0)' : 'translateX(12px)', transition: 'all 0.3s ease' }}>{s.desc}</p>
            <span style={{ fontFamily: F_ORBIT, fontSize: '14px', color: hovered === i ? s.accent : 'rgba(255,255,255,0.2)', transition: 'all 0.3s', transform: hovered === i ? 'translateX(6px)' : 'none' }}>→</span>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 04 — SAYILAR
// ════════════════════════════════════════════════════════════════════════════
const STATS = [
  { value: 3,   suffix: ' sn', label: 'ORTALAMA YANIT SÜRESİ' },
  { value: 2,   suffix: '×',   label: 'HİBRİT ERİŞİM KATMANI' },
  { value: 24,  suffix: '/7',  label: 'KESİNTİSİZ ERİŞİM'     },
  { value: 100, suffix: '%',   label: 'KAYNAĞA DAYALI YANIT'  },
]

function StatsSection() {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-15% 0px' })
  return (
    <div ref={ref} style={{ padding: '6rem 4rem', background: `linear-gradient(180deg, transparent 0%, ${GREEN}14 50%, transparent 100%)`, borderTop: `1px solid ${GREEN_L}1f`, borderBottom: `1px solid ${GREEN_L}1f` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: F_ORBIT, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, lineHeight: 1, marginBottom: '0.6rem',
              background: `linear-gradient(135deg, #fff 0%, ${GREEN_LL} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              <Counter end={s.value} suffix={s.suffix} isActive={inView} duration={1800 + i * 200} />
            </div>
            <p style={{ fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>{s.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 05 — ÇÖZÜMLER / KULLANIM ALANLARI
// ════════════════════════════════════════════════════════════════════════════
const USE_CASES = [
  { k: 'İK & ÖZLÜK',            d: 'Çalışanların izin, özlük ve prosedür sorularını anında yanıtlayın.' },
  { k: 'HUKUK & UYUM',          d: 'Mevzuat ve uyum dokümanlarında kaynağa dayalı, izlenebilir yanıtlar.' },
  { k: 'MÜŞTERİ HİZMETLERİ',    d: 'Temsilcilere onaylı bilgiyle hızlı, tutarlı destek sağlayın.' },
  { k: 'TEKNİK DOKÜMANTASYON',  d: 'Kılavuz ve prosedürlerde saniyeler içinde doğru adıma ulaşın.' },
  { k: 'EĞİTİM & ONBOARDING',   d: 'Yeni çalışanlar kurum bilgisine kendi kendine erişsin.' },
  { k: 'BT & DESTEK',           d: 'Sık sorulan BT sorularını otomatik, onaylı yanıtlarla çözün.' },
]

function UseCasesSection() {
  return (
    <Section style={{ borderTop: `1px solid ${GREEN_L}1f`, background: 'rgba(0,0,0,0.25)' }}>
      <SectionLabel num="05" label="ÇÖZÜMLER" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>KULLANIM ALANLARI</motion.h2>
      <motion.p variants={fadeUp} style={{ fontFamily: F_SPACE, fontSize: '0.95rem', color: 'rgba(255,255,255,0.4)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '3.5rem' }}>
        Her departmanın bilgi yükünü tek bir akıllı asistana devredin. QABot, kurumun her köşesinde doğru bilgiyi hazır tutar.
      </motion.p>
      <motion.div variants={stagger(0.07)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
        {USE_CASES.map((u, i) => (
          <motion.div key={i} variants={fadeUp} whileHover={{ y: -6, borderColor: `${GREEN_LL}66` }}
            style={{ padding: '1.8rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(8,20,16,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.9rem' }}>
              <span style={{ fontFamily: F_ORBIT, fontSize: '10px', color: GREEN_LL, letterSpacing: '0.2em' }}>{String(i + 1).padStart(2, '0')}</span>
              <h3 style={{ fontFamily: F_ORBIT, fontSize: '0.9rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{u.k}</h3>
            </div>
            <p style={{ fontFamily: F_SPACE, fontSize: '12.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{u.d}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 06 — ÜRÜN GÖRÜNTÜLERİ (arkadan öne büyüyen görsel ızgarası)
// ════════════════════════════════════════════════════════════════════════════
const SHOTS = [
  { img: '/card_bg_4.png', title: 'SOHBET ARAYÜZÜ',           tag: 'CHATBOT', accent: GREEN_LL },
  { img: '/card_bg_3.png', title: 'YÖNETİM PANELİ',           tag: 'ADMIN',   accent: GREEN_L  },
  { img: '/card_bg_5.png', title: 'ANALİTİK & KPI',           tag: 'RAPOR',   accent: NAVY     },
  { img: '/card_bg_2.png', title: 'KATEGORİ YÖNETİMİ',        tag: 'İÇERİK',  accent: MINT     },
  { img: '/card_bg_1.png', title: 'ONAYLI YANIT AKIŞI',       tag: 'GÜVEN',   accent: MINT_L   },
  { img: '/card_bg_6.png', title: 'KURUMSAL KİMLİK STÜDYOSU', tag: 'STÜDYO',  accent: GREEN_LL },
]

function ShotsSection() {
  return (
    <Section style={{ borderTop: `1px solid ${GREEN_L}1f` }}>
      <SectionLabel num="06" label="ÜRÜNDEN" />
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
        <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>EKRAN GÖRÜNTÜLERİ</h2>
        <span style={{ fontFamily: F_SPACE, fontSize: '11px', letterSpacing: '0.3em', color: GREEN_LL, textTransform: 'uppercase' }}>TÜMÜNÜ GÖR →</span>
      </motion.div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.2rem' }}>
        {SHOTS.map((s, i) => <GrowImage key={i} src={s.img} title={s.title} tag={s.tag} accent={s.accent} />)}
      </div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 07 — NASIL ÇALIŞIR
// ════════════════════════════════════════════════════════════════════════════
const STEPS = [
  { num: '01', title: 'BELGE YÜKLEME',   desc: 'Mevzuat, politika ve rehber belgeleri sisteme yüklenir.' },
  { num: '02', title: 'İNDEKSLEME',      desc: 'Belgeler otomatik taranıp vektör (ChromaDB) ve BM25 indekslerine dönüştürülür.' },
  { num: '03', title: 'ANLAMSAL ERİŞİM', desc: 'Soru, hibrit retriever ile en ilgili bağlamı saniyeler içinde bulur.' },
  { num: '04', title: 'ONAYLI YANIT',    desc: 'Kaynağa dayalı yanıt üretilir; denetlenenler "Onaylı" etiketiyle sunulur.' },
]

function ProcessSection() {
  return (
    <Section style={{ borderTop: `1px solid ${GREEN_L}1f`, background: 'rgba(0,0,0,0.3)' }}>
      <SectionLabel num="07" label="SÜREÇ" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '5rem', letterSpacing: '-0.01em' }}>NASIL ÇALIŞIR</motion.h2>
      <motion.div variants={stagger(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
        {STEPS.map((s, i) => (
          <motion.div key={i} variants={fadeUp} style={{ position: 'relative' }}>
            {i < STEPS.length - 1 && <div style={{ position: 'absolute', top: '1.5rem', left: 'calc(100% - 1rem)', right: '-1rem', height: '1px', background: `${GREEN_L}33`, zIndex: 0 }}/>}
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `1px solid ${GREEN_L}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', position: 'relative', zIndex: 1, background: `${GREEN}22` }}>
              <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.2em' }}>{s.num}</span>
            </div>
            <h3 style={{ fontFamily: F_ORBIT, fontSize: '1rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.8rem' }}>{s.title}</h3>
            <p style={{ fontFamily: F_SPACE, fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{s.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 08 — TEKNOLOJİ (kayan şerit)
// ════════════════════════════════════════════════════════════════════════════
const TECH = ['REACT', 'PYTHON · FLASK', 'LANGCHAIN', 'CHROMADB', 'HUGGINGFACE', 'SQLALCHEMY', 'BM25', 'ENSEMBLE RETRIEVER']

function TechSection() {
  return (
    <Section style={{ borderTop: `1px solid ${GREEN_L}1f`, paddingTop: '5rem', paddingBottom: '5rem' }}>
      <SectionLabel num="08" label="TEKNOLOJİ" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.4rem, 3vw, 2.4rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '2.5rem', letterSpacing: '-0.01em' }}>
        GÜÇLÜ BİR MİMARİ ÜZERİNDE
      </motion.h2>
      <div style={{ overflow: 'hidden', maskImage: 'linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)' }}>
        <div style={{ display: 'flex', gap: '2.5rem', whiteSpace: 'nowrap', animation: 'ticker 24s linear infinite' }}>
          {Array(4).fill(TECH).flat().map((t, i) => (
            <span key={i} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(0.85rem, 1.5vw, 1.15rem)', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '2.5rem' }}>
              {t}<span style={{ color: GREEN_LL }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 09 — SSS (açılır akordeon, AnimatePresence)
// ════════════════════════════════════════════════════════════════════════════
const FAQS = [
  { q: 'QABot verilerimi nerede saklıyor?', a: 'İçerikler işaret ettiğiniz kurumsal altyapıda, vektörler ChromaDB üzerinde tutulur. Veri egemenliği tamamen sizde kalır.' },
  { q: 'Hangi belge türlerini destekliyor?', a: 'Mevzuat, politika, rehber ve kurumsal dokümanlar başta olmak üzere metin tabanlı içerikler indekslenir.' },
  { q: 'Yanıtların doğruluğu nasıl güvence altına alınıyor?', a: 'Hibrit erişim (vektör + BM25) ile kaynağa dayalı üretim birleştirilir; yöneticinin onayladığı yanıtlar "Onaylı" rozetiyle sunulur.' },
  { q: 'Kurulum ne kadar sürer?', a: 'Belgeleri yükleyip kategorize ettikten sonra sistem otomatik indeksler; dakikalar içinde kullanıma hazır olur.' },
  { q: 'Kurumsal kimliğe uyarlanabilir mi?', a: 'Evet. Stüdyo modülüyle logo, başlık ve tema kod yazmadan kurumsal kimliğinize göre özelleştirilir.' },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div variants={fadeUp} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
          padding: '1.5rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ fontFamily: F_SPACE, fontSize: 'clamp(0.95rem, 1.6vw, 1.15rem)', fontWeight: 500, color: open ? '#fff' : 'rgba(255,255,255,0.75)', transition: 'color 0.3s' }}>{q}</span>
        <motion.span animate={{ rotate: open ? 45 : 0, color: open ? GREEN_LL : 'rgba(255,255,255,0.4)' }} style={{ fontFamily: F_ORBIT, fontSize: '1.4rem', lineHeight: 1, flexShrink: 0 }}>+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: 'hidden' }}>
            <p style={{ fontFamily: F_SPACE, fontSize: '13.5px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, paddingBottom: '1.5rem', maxWidth: '720px' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function FaqSection() {
  return (
    <Section style={{ borderTop: `1px solid ${GREEN_L}1f` }}>
      <SectionLabel num="09" label="SSS" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', marginBottom: '3rem', letterSpacing: '-0.01em' }}>SIK SORULANLAR</motion.h2>
      <motion.div variants={stagger(0.05)} style={{ maxWidth: '900px' }}>
        {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
      </motion.div>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// BÖLÜM 10 — İLETİŞİM / CTA
// ════════════════════════════════════════════════════════════════════════════
function ContactSection() {
  const [email, setEmail] = useState('')
  const [sent,  setSent]  = useState(false)
  return (
    <Section style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
      borderTop: `1px solid ${GREEN_L}1f`, background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${GREEN}1f 0%, transparent 70%)` }}>
      <SectionLabel num="10" label="BAŞLAYIN" />
      <motion.h2 variants={fadeUp} style={{ fontFamily: F_ORBIT, fontSize: 'clamp(2rem, 6.2vw, 5.2rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', lineHeight: 0.98, letterSpacing: '-0.02em', marginBottom: '2rem' }}>
        KURUMSAL BİLGİYE<br /><span style={{ WebkitTextStroke: `1px ${GREEN_LL}`, color: 'transparent' }}>AKILLI</span> ERİŞİMİ<br />BAŞLATIN
      </motion.h2>
      <motion.p variants={fadeUp} style={{ fontFamily: F_SPACE, fontSize: '1rem', color: 'rgba(255,255,255,0.45)', marginBottom: '3.5rem', maxWidth: '520px', lineHeight: 1.7 }}>
        Belgelerinizi QABot'a tanıtın; ekibiniz doğru bilgiye saniyeler içinde ulaşsın. Demo için e-postanızı bırakın, size dönelim.
      </motion.p>
      <motion.div variants={fadeUp} style={{ display: 'flex', gap: '0', marginBottom: '2.5rem', width: '100%', maxWidth: '520px' }}>
        {!sent ? (
          <>
            <input type="email" placeholder="kurumsal@eposta.com" value={email} onChange={e => setEmail(e.target.value)}
              style={{ flex: 1, padding: '1rem 1.4rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${GREEN_L}3a`, borderRight: 'none', borderRadius: '4px 0 0 4px', color: '#fff', fontFamily: F_SPACE, fontSize: '13px', outline: 'none', letterSpacing: '0.05em' }}/>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => { if (email) setSent(true) }}
              style={{ padding: '1rem 1.8rem', background: GREEN, border: 'none', borderRadius: '0 4px 4px 0', color: '#fff', fontFamily: F_ORBIT, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer' }}>GÖNDER →</motion.button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, padding: '1rem', textAlign: 'center', border: `1px solid ${GREEN_LL}55`, borderRadius: '4px', color: GREEN_LL, fontFamily: F_ORBIT, fontSize: '10px', letterSpacing: '0.3em', background: `${GREEN}1a` }}>
            ✓ TALEBİNİZ ALINDI — EN KISA SÜREDE DÖNÜŞ YAPACAĞIZ
          </motion.div>
        )}
      </motion.div>
      <motion.p variants={fadeIn} style={{ fontFamily: F_SPACE, fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
        Kredi kartı gerekmez · Kurumsal demo · KVKK uyumlu
      </motion.p>
    </Section>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// FOOTER — endüstri standardı (çok sütunlu + bülten + sosyal + yasal)
// ════════════════════════════════════════════════════════════════════════════
const FOOTER_COLS = [
  { h: 'ÜRÜN',      items: ['Özellikler', 'Nasıl Çalışır', 'Ekran Görüntüleri', 'Güvenlik'] },
  { h: 'ÇÖZÜMLER',  items: ['İK & Özlük', 'Hukuk & Uyum', 'Müşteri Hizmetleri', 'Teknik Dokümantasyon'] },
  { h: 'KAYNAKLAR', items: ['Dokümantasyon', 'SSS', 'Blog', 'Sürüm Notları'] },
  { h: 'ŞİRKET',    items: ['Hakkımızda', 'İletişim', 'Kariyer', 'KVKK'] },
]

function FooterSection() {
  const ref    = useRef()
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const [news, setNews] = useState('')
  return (
    <motion.footer ref={ref} variants={stagger(0.06)} initial="hidden" animate={inView ? 'show' : 'hidden'}
      style={{ position: 'relative', borderTop: `1px solid ${GREEN_L}26`, background: 'rgba(2,10,8,0.55)', padding: '5rem 4rem 2.5rem' }}>
      {/* Üst: marka + bülten */}
      <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '3rem', flexWrap: 'wrap', marginBottom: '4rem' }}>
        <div style={{ maxWidth: '320px' }}>
          <div style={{ fontFamily: F_ORBIT, fontSize: '15px', letterSpacing: '0.35em', color: '#fff', textTransform: 'uppercase', marginBottom: '1rem' }}>◈ QABOT</div>
          <p style={{ fontFamily: F_SPACE, fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
            Kurumsal bilgiye akıllı erişim için Agentic RAG platformu. Belgelerinizi saniyeler içinde doğru, onaylı yanıtlara dönüştürür.
          </p>
        </div>
        <div style={{ minWidth: '280px' }}>
          <p style={{ fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.35em', color: GREEN_LL, textTransform: 'uppercase', marginBottom: '1rem' }}>BÜLTENE ABONE OL</p>
          <div style={{ display: 'flex' }}>
            <input type="email" placeholder="e-posta adresiniz" value={news} onChange={e => setNews(e.target.value)}
              style={{ flex: 1, padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', border: `1px solid ${GREEN_L}33`, borderRight: 'none', borderRadius: '4px 0 0 4px', color: '#fff', fontFamily: F_SPACE, fontSize: '12px', outline: 'none' }}/>
            <button style={{ padding: '0.8rem 1.2rem', background: GREEN, border: 'none', borderRadius: '0 4px 4px 0', color: '#fff', fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.25em', textTransform: 'uppercase', cursor: 'pointer' }}>ABONE OL</button>
          </div>
        </div>
      </motion.div>

      {/* Orta: link sütunları */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {FOOTER_COLS.map((col, i) => (
          <div key={i}>
            <p style={{ fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '1.2rem' }}>{col.h}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {col.items.map((it, k) => (
                <li key={k}>
                  <a href="#" onClick={e => e.preventDefault()}
                    style={{ fontFamily: F_SPACE, fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = GREEN_LL}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}>{it}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>

      {/* Alt: yasal satır + sosyal */}
      <motion.div variants={fadeIn} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', paddingTop: '2rem' }}>
        <span style={{ fontFamily: F_SPACE, fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>© 2026 QABOT — TÜM HAKLARI SAKLIDIR</span>
        <div style={{ display: 'flex', gap: '1.8rem' }}>
          {['Gizlilik', 'Kullanım Şartları', 'KVKK', 'Çerez Politikası'].map(l => (
            <a key={l} href="#" onClick={e => e.preventDefault()}
              style={{ fontFamily: F_SPACE, fontSize: '11px', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>{l}</a>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['in', 'X', '✉'].map(s => (
            <span key={s} style={{ width: '30px', height: '30px', borderRadius: '50%', border: `1px solid ${GREEN_L}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F_SPACE, fontSize: '11px', color: 'rgba(255,255,255,0.55)', cursor: 'pointer' }}>{s}</span>
          ))}
        </div>
      </motion.div>
    </motion.footer>
  )
}

// ════════════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════════════════════════
export default function LandingPage({ onBack, enabled }) {
  const containerRef = useRef()

  // Sayfanın en üstünde yukarı scroll → galeriye (carousel) dön
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onWheel = (e) => {
      if (!enabled) return
      if (el.scrollTop <= 0 && e.deltaY < 0) onBack?.()
    }
    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onBack, enabled])

  // Sayfa aktifleşince en üste dön
  useEffect(() => {
    if (enabled && containerRef.current) containerRef.current.scrollTop = 0
  }, [enabled])

  // Scroll ilerleme çubuğu (Framer Motion: useScroll + useSpring) — bu kapsayıcıyı izler
  const { scrollYProgress } = useScroll({ container: containerRef })
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })

  return (
    <div ref={containerRef} className="landing-scroll"
      style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden', background: 'transparent', scrollBehavior: 'smooth' }}>

      {/* Okunabilirlik perdesi — yıldızları soldurur ama hareketli bırakır */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'rgba(2,12,14,0.60)' }}/>
      {/* Marka glow'ları (yeşil + lacivert) */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse 50% 40% at 18% 18%, ${GREEN}26 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 82% 82%, ${NAVY}1a 0%, transparent 60%)` }}/>

      {/* Üst: SCROLL İLERLEME ÇUBUĞU (Framer Motion scroll-linked) */}
      <motion.div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', transformOrigin: '0% 50%',
        scaleX: progressScaleX, background: `linear-gradient(90deg, ${GREEN}, ${GREEN_LL})`, boxShadow: `0 0 12px ${GREEN_LL}`, zIndex: 60 }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <FloatingOrbs />
        <ManifestoSection />
        <FeaturedSection scrollContainer={containerRef} />
        <Divider />
        <BenefitsSection />
        <ServicesSection />
        <StatsSection />
        <UseCasesSection />
        <Divider />
        <ShotsSection />
        <ProcessSection />
        <TechSection />
        <FaqSection />
        <ContactSection />
        <FooterSection />
      </div>

      {/* Geri dön ipucu */}
      <div style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', zIndex: 50, pointerEvents: 'none' }}>
        <span style={{ fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.14)', textTransform: 'uppercase' }}>
          ↑ BAŞA KAYDIR · GERİ DÖNMEK İÇİN YUKARI
        </span>
      </div>
    </div>
  )
}
