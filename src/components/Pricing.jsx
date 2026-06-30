/**
 * Pricing.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot FİYATLANDIRMA bölümü — 3 katmanlı (Başlangıç / Profesyonel / Kurumsal)
 * yeşil temalı, animasyonlu plan kartları. "Profesyonel" plan öne çıkarılır.
 *
 * B2B SaaS yaklaşımı: rakam yerine "Pilot / Teklif / Özel" çağrıları kullanılır
 * (gerçek fiyat netleşince title alanları güncellenebilir). Scroll-reveal +
 * hover yükselme/parlama animasyonları Framer Motion ile.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

const GREEN    = '#047857'
const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'

const PLANS = [
  {
    name: 'BAŞLANGIÇ',
    price: 'Ücretsiz Pilot',
    note: 'Pilot ve küçük ekipler için',
    cta: 'Demo Talep Et',
    popular: false,
    features: ['1 kiracı (tenant)', '1.000 sorgu / ay', 'Hibrit erişim (Vektör + BM25)', 'Temel analitik', 'E-posta destek'],
  },
  {
    name: 'PROFESYONEL',
    price: 'Teklif Al',
    note: 'Büyüyen kurumlar için',
    cta: 'İletişime Geç',
    popular: true,
    features: ['5 kiracıya kadar', '25.000 sorgu / ay', 'Onaylı yanıt + sürekli öğrenme', 'Gelişmiş analitik & KPI', 'Stüdyo ile kurumsal kimlik', 'Öncelikli destek'],
  },
  {
    name: 'KURUMSAL',
    price: 'Özel',
    note: 'Ölçek, güvenlik ve uyum için',
    cta: 'Bizimle Konuş',
    popular: false,
    features: ['Sınırsız kiracı & sorgu', 'SSO & KVKK uyumu', 'Özel model / barındırma', 'Özel entegrasyonlar', 'SLA & 7/24 destek'],
  },
]

function PlanCard({ p, i, inView }) {
  const [hovered, setHovered] = useState(false)
  const accentBorder = p.popular ? GREEN_LL : 'rgba(255,255,255,0.10)'
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        padding: '3rem 2.4rem', borderRadius: '16px',
        border: `1px solid ${hovered || p.popular ? GREEN_LL + '66' : accentBorder}`,
        background: p.popular ? 'rgba(4,120,87,0.12)' : 'rgba(8,20,16,0.4)',
        boxShadow: p.popular ? `0 30px 80px rgba(0,0,0,0.5), 0 0 50px ${GREEN}33` : (hovered ? `0 24px 60px rgba(0,0,0,0.45)` : '0 10px 30px rgba(0,0,0,0.3)'),
        transform: p.popular ? 'scale(1.03)' : 'scale(1)',
      }}>
      {p.popular && (
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
          fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.3em', textTransform: 'uppercase',
          color: '#04140f', background: GREEN_LL, padding: '5px 14px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
          EN POPÜLER
        </div>
      )}

      <span style={{ fontFamily: F_ORBIT, fontSize: '14px', fontWeight: 700, letterSpacing: '0.2em', color: '#fff', textTransform: 'uppercase' }}>{p.name}</span>
      <span style={{ fontFamily: F_SPACE, fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>{p.note}</span>

      <div style={{ margin: '1.6rem 0', fontFamily: F_ORBIT, fontWeight: 900, fontSize: '2.8rem', lineHeight: 1,
        background: `linear-gradient(135deg, #fff, ${GREEN_LL})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', color: 'transparent' }}>
        {p.price}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '2rem', flex: 1 }}>
        {p.features.map((f, k) => (
          <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: GREEN_LL, fontSize: '15px', lineHeight: 1.5, flexShrink: 0 }}>✓</span>
            <span style={{ fontFamily: F_SPACE, fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>

      <button
        style={{
          width: '100%', padding: '1.2rem', borderRadius: '8px', cursor: 'pointer',
          fontFamily: F_ORBIT, fontSize: '12px', letterSpacing: '0.25em', textTransform: 'uppercase',
          border: p.popular ? 'none' : `1px solid ${GREEN_L}55`,
          background: p.popular ? GREEN : 'transparent',
          color: p.popular ? '#fff' : GREEN_LL, transition: 'all 0.25s',
        }}
        onMouseEnter={(e) => { if (p.popular) e.currentTarget.style.background = GREEN_L; else { e.currentTarget.style.background = `${GREEN_L}1a`; e.currentTarget.style.borderColor = GREEN_LL } }}
        onMouseLeave={(e) => { if (p.popular) e.currentTarget.style.background = GREEN; else { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${GREEN_L}55` } }}>
        {p.cta} →
      </button>
    </motion.div>
  )
}

export default function Pricing() {
  const ref = useRef()
  const inView = useInView(ref, { once: true, margin: '-12% 0px' })
  return (
    <section style={{ position: 'relative', width: '100%', padding: '7rem 4rem', boxSizing: 'border-box',
      borderTop: `1px solid ${GREEN_L}1f`, background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${GREEN}14 0%, transparent 70%)` }}>
      {/* Etiket + başlık */}
      <div ref={ref} style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2rem', marginBottom: '1.4rem' }}>
          <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.5em' }}>10</span>
          <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, transparent, ${GREEN_LL}, transparent)` }}/>
          <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>PLANLAR</span>
        </div>
        <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: '0.8rem' }}>
          FİYATLANDIRMA
        </h2>
        <p style={{ fontFamily: F_SPACE, fontSize: '0.95rem', color: 'rgba(255,255,255,0.42)', maxWidth: '520px', lineHeight: 1.7, margin: '0 auto' }}>
          Pilotla başlayın, kurumunuz büyüdükçe ölçekleyin. Tüm planlar kaynağa dayalı, onaylı yanıt altyapısını içerir.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto', alignItems: 'stretch' }}>
        {PLANS.map((p, i) => <PlanCard key={i} p={p} i={i} inView={inView} />)}
      </div>

      <p style={{ fontFamily: F_SPACE, fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: '2.5rem' }}>
        Tüm planlar KVKK uyumludur · Kurulum ücreti yoktur · İstediğiniz zaman ölçek değiştirebilirsiniz
      </p>
    </section>
  )
}
