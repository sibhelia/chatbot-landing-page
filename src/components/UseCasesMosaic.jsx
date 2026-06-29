/**
 * UseCasesMosaic.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot ÇÖZÜMLER / KULLANIM ALANLARI bölümü — Framer'daki "FeatureGridMosaic"
 * tasarımının saf React'e uyarlanmış sürümü.
 *
 * 4×2 mozaik (8 hücre); her hücre ya GÖRSEL kartı (hover'da başlık/açıklama/
 * etiket/buton açılır) ya da renkli METİN kartıdır. Üstte rozet + başlık +
 * alt başlık. Responsive: masaüstü 4, tablet 2, telefon 1 sütun.
 *
 * Framer'a özgü API'ler (addPropertyControls / ControlType / useIsStaticRenderer)
 * çıkarıldı; demo paneli kaldırıldı. Tema: marka yeşili (koyu zemin). Görseller
 * placeholder (/card_bg_*.png) — ürün/temsili görsellerle değiştirilebilir.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useState, useEffect, useRef } from 'react'

const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

const GREEN_L  = '#10b981'
const GREEN_LL = '#34d399'

const DARK_BG  = '#06241a'   // koyu yeşil metin kartı
const LIGHT_BG = '#dcfce7'   // açık nane metin kartı
const LIGHT_FG = '#04241a'

// 8 hücre — görsel (image) + metin (text) karışık
const CELLS = [
  { type: 'image', image: '/card_bg_3.png', tag: 'İK',     imageTitle: 'İK & ÖZLÜK',           imageDesc: 'Çalışanların izin, özlük ve prosedür sorularını anında, doğru kaynaktan yanıtlayın.' },
  { type: 'text',  bg: DARK_BG,  fg: '#ffffff', title: 'HUKUK & UYUM',          desc: 'Mevzuat ve uyum dokümanlarında kaynağa dayalı, izlenebilir yanıtlar.' },
  { type: 'image', image: '/card_bg_5.png', tag: 'DESTEK', imageTitle: 'MÜŞTERİ HİZMETLERİ',   imageDesc: 'Temsilcilere onaylı bilgiyle hızlı, tutarlı destek; tek tip yanıt kalitesi.' },
  { type: 'text',  bg: LIGHT_BG, fg: LIGHT_FG,  title: 'TEKNİK DOKÜMANTASYON',  desc: 'Kılavuz ve prosedürlerde saniyeler içinde doğru adıma ulaşın.' },
  { type: 'text',  bg: DARK_BG,  fg: '#ffffff', title: 'EĞİTİM & ONBOARDING',   desc: 'Yeni çalışanlar kurum bilgisine kendi kendine, hızlıca erişsin.' },
  { type: 'image', image: '/card_bg_4.png', tag: 'BT',     imageTitle: 'BT & DESTEK',          imageDesc: 'Sık sorulan BT sorularını otomatik, onaylı yanıtlarla çözün.' },
  { type: 'text',  bg: LIGHT_BG, fg: LIGHT_FG,  title: 'FİNANS & SATINALMA',    desc: 'Bütçe, fatura ve tedarik prosedürlerinde anında, doğru yanıt.' },
  { type: 'image', image: '/card_bg_2.png', tag: 'KAMU',   imageTitle: 'KAMU & YÖNETMELİK',    imageDesc: 'Sık güncellenen yönetmeliklerde sürüm-duyarlı, güncel bilgi.' },
]

function ImageCell({ cell, hovered }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${cell.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
        transform: hovered ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.77,0,0.175,1)' }}/>
      {/* Karartma — yeşil tonlu */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(2,16,12,0.92) 0%, rgba(2,16,12,0.25) 50%, rgba(2,16,12,0.05) 100%)',
        opacity: hovered ? 1 : 0.55, transition: 'opacity 0.4s ease' }}/>
      {/* Etiket (hover'da) */}
      {cell.tag && (
        <div style={{ position: 'absolute', top: 14, right: 14, fontFamily: F_ORBIT, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: GREEN_LL, background: 'rgba(4,120,87,0.25)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 40, border: `1px solid ${GREEN_L}55`,
          opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(-6px)', transition: 'opacity 0.3s ease, transform 0.3s ease', whiteSpace: 'nowrap' }}>
          {cell.tag}
        </div>
      )}
      {/* Alt içerik */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '20px 20px 22px' }}>
        <div style={{ fontFamily: F_ORBIT, fontSize: 17, fontWeight: 700, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.01em', textTransform: 'uppercase',
          opacity: hovered ? 1 : 0.92, transform: hovered ? 'translateY(0)' : 'translateY(8px)', transition: 'opacity 0.4s, transform 0.4s cubic-bezier(0.16,1,0.3,1)', marginBottom: 8 }}>
          {cell.imageTitle}
        </div>
        <div style={{ height: 1, background: GREEN_LL, marginBottom: 8, opacity: hovered ? 0.5 : 0, transform: hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left', transition: 'opacity 0.1s 0.18s ease, transform 0.55s 0.2s cubic-bezier(0.4,0,0.2,1)' }}/>
        <div style={{ fontFamily: F_SPACE, fontSize: 12.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(14px)', transition: 'opacity 0.4s 0.18s cubic-bezier(0.16,1,0.3,1), transform 0.4s 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
          {cell.imageDesc}
        </div>
        <div style={{ overflow: 'hidden', marginTop: 12, display: 'inline-block' }}>
          <div style={{ borderRadius: 40, background: 'rgba(16,185,129,0.12)', backdropFilter: 'blur(8px)', border: `1px solid ${GREEN_L}55`, padding: '8px 18px',
            fontFamily: F_ORBIT, fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: GREEN_LL, display: 'inline-flex',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.4s 0.3s ease' }}>
            İNCELE →
          </div>
        </div>
      </div>
    </>
  )
}

export default function UseCasesMosaic() {
  const ref = useRef(null)
  const [width, setWidth] = useState(9999)
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const cols = width <= 480 ? '1fr' : width <= 810 ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)'

  return (
    <section ref={ref} style={{ position: 'relative', width: '100%', padding: '7rem 4rem', boxSizing: 'border-box', borderTop: `1px solid ${GREEN_L}1f`, background: 'rgba(0,0,0,0.22)' }}>
      {/* Başlık bloğu */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem', maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
        <span style={{ display: 'inline-block', fontFamily: F_ORBIT, fontSize: 9, letterSpacing: '0.4em', textTransform: 'uppercase', color: GREEN_LL,
          background: 'rgba(16,185,129,0.08)', border: `1px solid ${GREEN_L}33`, borderRadius: 40, padding: '6px 16px', marginBottom: 20 }}>
          ÇÖZÜMLER
        </span>
        <h2 style={{ fontFamily: F_ORBIT, fontSize: 'clamp(1.8rem, 4vw, 3.4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 14px', textTransform: 'uppercase' }}>
          KULLANIM ALANLARI
        </h2>
        <p style={{ fontFamily: F_SPACE, fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, margin: 0 }}>
          Her departmanın bilgi yükünü tek bir akıllı asistana devredin. QABot, kurumun her köşesinde doğru bilgiyi hazır tutar.
        </p>
      </div>

      {/* Mozaik */}
      <div style={{ display: 'grid', gridTemplateColumns: cols, gap: 16, maxWidth: 1200, margin: '0 auto' }}>
        {CELLS.map((cell, i) => {
          const isImage = cell.type === 'image'
          const isHov = hovered === i
          return (
            <div key={i}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
              onClick={() => setHovered((p) => (p === i ? null : i))}
              style={{ position: 'relative', aspectRatio: width <= 480 ? '4 / 5' : '3 / 4', borderRadius: 18, overflow: 'hidden',
                background: isImage ? '#06241a' : cell.bg, display: 'flex', flexDirection: 'column',
                cursor: isImage ? 'pointer' : 'default', border: `1px solid ${isImage ? GREEN_L + '26' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: isHov ? '0 24px 60px rgba(0,0,0,0.45)' : 'none', transition: 'box-shadow 0.3s' }}>
              {isImage ? (
                <ImageCell cell={cell} hovered={isHov} />
              ) : (
                <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', padding: 26, boxSizing: 'border-box' }}>
                  <h3 style={{ fontFamily: F_ORBIT, fontSize: 17, fontWeight: 700, color: cell.fg, letterSpacing: '0.01em', lineHeight: 1.25, margin: 0, textTransform: 'uppercase' }}>{cell.title}</h3>
                  <div style={{ flex: 1 }}/>
                  <p style={{ fontFamily: F_SPACE, fontSize: 13, color: cell.fg, opacity: 0.72, lineHeight: 1.55, margin: '0 0 16px' }}>{cell.desc}</p>
                  <span style={{ fontFamily: F_ORBIT, fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: cell.fg === LIGHT_FG ? GREEN_L : GREEN_LL,
                    cursor: 'pointer', borderBottom: `1px solid ${cell.fg === LIGHT_FG ? GREEN_L : GREEN_LL}`, paddingBottom: 2, alignSelf: 'flex-start' }}>
                    DETAY →
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
