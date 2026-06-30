/**
 * ProcessShowcase.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot "NASIL ÇALIŞIR" bölümü — Framer'daki "CardShowcase" tasarımının saf
 * React + Framer Motion'a uyarlanmış sürümü.
 *
 * Yan yana 4 adım kartı; AKTİF kart genişler (flex 2:1), açıklamasını ve
 * görselini açar. Soldaki dikey İLERLEME ÇUBUĞU dolar; süre dolunca OTOMATİK
 * bir sonraki adıma geçer (döngü). Karta tıklayınca o adım seçilir. Dar ekranda
 * dikey yığın (hepsi açık).
 *
 * Framer'a özgü API'ler (addPropertyControls / ControlType) çıkarıldı. Tema:
 * marka yeşili ilerleme + vurgular. Görseller placeholder (/card_bg_*.png) —
 * ürün ekran görüntüleriyle değiştirilebilir.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'
const PROGRESS = '#34d399'
const SPEED    = 5        // adım başına saniye
const LOOP     = true

const STEPS = [
  { number: '01', title: 'BELGE YÜKLEME',   tag: 'GİRDİ',   description: 'Mevzuat, yönetmelik, politika ve rehber belgeleriniz sisteme yüklenir; kurumun dağınık bilgisi tek bir noktada toplanır. Hiyerarşik kategori yapısıyla içerikler düzenlenir, sürüm yönetimi sayesinde aynı belgenin eski ve yeni hâlleri birbirine karışmaz.', image: '/screens/screen-15.png' },
  { number: '02', title: 'İNDEKSLEME',      tag: 'İŞLEME',  description: 'Belgeler otomatik taranıp iki katmanda işlenir: çok dilli anlamsal vektör (ChromaDB) ve BM25 anahtar-kelime indeksi. Böylece sistem hem kelimelerin anlamını hem de tam eşleşmeleri yakalayacak biçimde, sorgulamaya hazır hâle gelir — manuel etiketleme gerektirmez.', image: '/screens/screen-01.png' },
  { number: '03', title: 'ANLAMSAL ERİŞİM', tag: 'ERİŞİM',  description: 'Kullanıcı sorusunu doğal dilde yazar; hibrit Ensemble Retriever en ilgili bağlamı saniyeler içinde getirir. Çok adımlı veya dolaylı sorularda ajan, geri aldığı kanıtı değerlendirip gerektiğinde aramayı yineler — yani cevaba ulaşana kadar akıl yürütür.', image: '/screens/screen-03.png' },
  { number: '04', title: 'ONAYLI YANIT',    tag: 'ÇIKTI',   description: 'Yanıt yalnızca bulunan kaynağa dayanarak üretilir; halüsinasyon önlenir. Yöneticinin onayladığı yanıtlar "Onaylı" rozetiyle sunulur ve gelecekte aynı soru sorulduğunda anlamsal atlama ile anında, daha da hızlı yanıtlanır.', image: '/screens/screen-09.png' },
]

export default function ProcessShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress]       = useState(0)
  const [isMobile, setIsMobile]       = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Otomatik ilerleme + sonraki adıma geçiş
  useEffect(() => {
    if (isMobile) return
    const interval = 16
    const inc = 100 / (SPEED * 1000) * interval
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = prev + inc
        if (next >= 100) {
          const ni = activeIndex + 1
          if (ni >= STEPS.length) {
            if (LOOP) { setActiveIndex(0); return 0 }
            clearInterval(timerRef.current); return 100
          }
          setActiveIndex(ni); return 0
        }
        return next
      })
    }, interval)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [activeIndex, isMobile])

  const onCard = (i) => { if (isMobile) return; setActiveIndex(i); setProgress(0) }

  // ── Bölüm başlığı ─────────────────────────────────────────────────────────
  const Header = (
    <div style={{ marginBottom: '3.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.6rem' }}>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: GREEN_LL, letterSpacing: '0.5em' }}>07</span>
        <div style={{ width: '40px', height: '1px', background: `linear-gradient(90deg, ${GREEN_LL}, transparent)` }}/>
        <span style={{ fontFamily: F_ORBIT, fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.4em', textTransform: 'uppercase' }}>SÜREÇ</span>
      </div>
      <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.5rem)', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
        NASIL ÇALIŞIR
      </h2>
    </div>
  )

  // ── Mobil: dikey yığın ────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <section style={{ padding: '6rem 1.6rem', borderTop: `1px solid ${GREEN_L}1f` }}>
        {Header}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {STEPS.map((c, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontFamily: F_ORBIT, fontSize: '36px', fontWeight: 900, color: GREEN_LL }}>{c.number}</div>
              <div style={{ fontFamily: F_ORBIT, fontSize: '20px', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>{c.title}</div>
              <div style={{ fontFamily: F_SPACE, fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{c.description}</div>
              <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '10px', border: `1px solid ${GREEN_L}33` }}>
                <div style={{ width: '100%', height: '100%', backgroundImage: `url(${c.image})`, backgroundSize: 'cover', backgroundPosition: 'top center' }}/>
              </div>
              <div style={{ fontFamily: F_ORBIT, fontSize: '10px', letterSpacing: '0.3em', color: GREEN_LL, textTransform: 'uppercase' }}>{c.tag}</div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  // ── Masaüstü: genişleyen kartlar ──────────────────────────────────────────
  return (
    <section style={{ padding: '6rem 4rem', borderTop: `1px solid ${GREEN_L}1f` }}>
      {Header}
      <div style={{ display: 'flex', gap: '18px', width: '100%', minHeight: '380px', alignItems: 'stretch' }}>
        {STEPS.map((c, i) => {
          const isActive = i === activeIndex
          return (
            <motion.div key={i} onClick={() => onCard(i)}
              animate={{ flex: isActive ? 4.5 : 1 }} transition={{ duration: 0.5, ease: 'easeInOut' }}
              style={{
                position: 'relative', padding: '24px 24px 24px 30px', cursor: 'pointer', overflow: 'hidden',
                display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0, borderRadius: '14px',
                background: isActive ? 'rgba(8,20,16,0.45)' : 'rgba(8,20,16,0.18)',
                border: `1px solid ${isActive ? GREEN_L + '40' : 'rgba(255,255,255,0.06)'}`,
                transition: 'background 0.4s, border-color 0.4s',
              }}>
              {/* Soldaki ilerleme çubuğu */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: '2px', background: 'rgba(255,255,255,0.10)' }}>
                {isActive && (
                  <motion.div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: PROGRESS, boxShadow: `0 0 10px ${PROGRESS}` }}
                    animate={{ height: `${progress}%` }} transition={{ duration: 0 }}/>
                )}
              </div>

              {/* Numara + başlık */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                <div style={{ fontFamily: F_ORBIT, fontSize: '40px', fontWeight: 900, letterSpacing: '-0.04em', color: GREEN_LL, opacity: isActive ? 1 : 0.45 }}>{c.number}</div>
                <div style={{ fontFamily: F_ORBIT, fontSize: '20px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff', opacity: isActive ? 1 : 0.65 }}>{c.title}</div>
              </div>

              {/* Aktif içerik: açıklama + görsel + etiket */}
              <AnimatePresence>
                {isActive && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', minHeight: 0, gap: '16px' }}>
                    <p style={{ fontFamily: F_SPACE, fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.55, margin: 0 }}>{c.description}</p>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0 }}>
                      <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '10px', border: `1px solid ${GREEN_L}33`, boxShadow: `0 20px 50px rgba(0,0,0,0.5)` }}>
                        <div style={{ width: '100%', height: '100%', backgroundImage: `url(${c.image})`, backgroundSize: 'cover', backgroundPosition: 'top center' }}/>
                      </div>
                    </div>
                    <div style={{ fontFamily: F_ORBIT, fontSize: '10px', letterSpacing: '0.3em', color: GREEN_LL, textTransform: 'uppercase', alignSelf: 'flex-start' }}>{c.tag}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
