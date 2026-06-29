/**
 * FeatureCarousel.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot ÖZELLİK VİTRİNİ — 3B sarmal (helix) kart galerisi.
 *
 * Bu bileşen, ürünün ana satış noktalarını (HİBRİT ERİŞİM, ONAYLI YANIT,
 * YÖNETİM PANELİ, HİYERARŞİK KATEGORİLER, ANALİTİK, ÖĞRENME) etkileyici bir
 * 3B sarmal carousel üzerinde sunar. Amaç: ziyaretçiyi tek tek özelliklerde
 * gezdirip her birini "satan" bir mikro-anlatıyla ikna etmek.
 *
 * Yapı taşları:
 *  1) 3B HELIX KARTLAR  — CSS 3D ile silindirik sarmal; aktif kart öne gelir.
 *  2) SOL NAV (senkron) — özellik listesi; aktif kartla eşleşir, tıklanınca
 *                          ilgili karta atlar. Ziyaretçi nerede olduğunu görür.
 *  3) SAĞ BİLGİ PANELİ  — ORTADAKİ KARTA GÖRE DİNAMİK değişen şeffaf (cam)
 *                          panel: etiket, başlık, satış metni, öne çıkan
 *                          maddeler ve bir CTA. Kart değişince yumuşak geçişle
 *                          güncellenir (AnimatePresence).
 *  4) İLERLEME & İPUÇLARI— sağ alt sayaç + noktalar, alt scroll ipucu.
 *
 * 3B arka plan (DNA sarmalı + yıldızlar) burada DEĞİL; paylaşılan World
 * canvas'ından gelir. Bu bileşen yalnızca HTML/CSS katmanını çizer.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── ÖZELLİK KARTLARI ─────────────────────────────────────────────────────────
// Her kart bir satış noktası. Alanlar:
//   navLabel : sol menüde görünen kısa etiket
//   tag      : kartın üstündeki kategori etiketi
//   title    : kart başlığı (\n ile satır kırılır)
//   subtitle : kısa, vurucu alt başlık
//   detail   : sağ panelde görünen ikna edici satış metni (1-2 cümle)
//   points   : sağ panelde madde madde öne çıkanlar (3 adet)
//   bg       : kart görseli → ürün ekran görüntüsüyle değiştirilebilir
//   accent   : marka yeşili ailesinden vurgu rengi
const CARDS = [
  {
    id: 0,
    navLabel: 'AKILLI ARAMA',
    tag:      'AKILLI ARAMA',
    title:    'HİBRİT\nERİŞİM',
    subtitle: 'VEKTÖR + BM25 ENSEMBLE RETRIEVER',
    detail:   'Anlamsal vektör araması (ChromaDB) ile anahtar-kelime hassasiyetini (BM25) birleştirir. Hem "ne kastedildiğini" hem "tam olarak ne yazıldığını" yakalar — kaçırılan cevap kalmaz.',
    points:   ['ChromaDB vektör veritabanı', 'BM25 anahtar-kelime motoru', 'Ensemble Retriever birleşimi'],
    bg:       '/card_bg_4.png',
    accent:   '#34d399',
  },
  {
    id: 1,
    navLabel: 'ONAYLI YANIT',
    tag:      'GÜVENİLİRLİK',
    title:    'ONAYLI\nYANIT',
    subtitle: 'DENETLENEN, DOĞRULANMIŞ BİLGİ',
    detail:   'Yöneticinin onayladığı her yanıt "Onaylı" rozetiyle sunulur. Kullanıcı, gördüğü bilginin kurumca doğrulandığını anında bilir; bilgi kirliliği ve yanlış yönlendirme ortadan kalkar.',
    points:   ['Yönetici onay akışı', '"Onaylı" güven rozeti', 'Kaynağa dayalı yanıt'],
    bg:       '/card_bg_1.png',
    accent:   '#10b981',
  },
  {
    id: 2,
    navLabel: 'YÖNETİM PANELİ',
    tag:      'KONTROL',
    title:    'YÖNETİM\nPANELİ',
    subtitle: 'KOD YAZMADAN TAM KONTROL',
    detail:   'Marka logosu, başlıklar, kategoriler ve içerikler stüdyo modülünden tek satır kod yazmadan güncellenir. Sistem tamamen sizin kontrolünüzde, kurumsal kimliğinize göre şekillenir.',
    points:   ['Stüdyo ile kurumsal kimlik', 'Kategori & içerik yönetimi', 'Kod gerektirmez'],
    bg:       '/card_bg_3.png',
    accent:   '#6ee7b7',
  },
  {
    id: 3,
    navLabel: 'KATEGORİLER',
    tag:      'ORGANİZASYON',
    title:    'HİYERARŞİK\nKATEGORİLER',
    subtitle: 'SINIRSIZ KIRILIMLI BİLGİ YAPISI',
    detail:   'Mevzuat ve bilgi bankası içerikleri, sınırsız derinlikte ebeveyn-çocuk kategori yapısıyla düzenlenir. Devasa belge yığınları, gezilebilir ve yönetilebilir bir bilgi mimarisine dönüşür.',
    points:   ['Sınırsız alt kategori', 'Ebeveyn-çocuk yapısı', 'Düzenli bilgi mimarisi'],
    bg:       '/card_bg_2.png',
    accent:   '#a7f3d0',
  },
  {
    id: 4,
    navLabel: 'ANALİTİK',
    tag:      'İÇGÖRÜ',
    title:    'ANALİTİK\n& KPI',
    subtitle: 'VERİYLE YÖNETİLEN KARARLAR',
    detail:   'Kullanım istatistikleri, kredi tüketimi, en çok merak edilen kategoriler ve yanıt hızı görselleştirilmiş raporlarla sunulur. Kurumunuzun bilgi nabzını tek ekrandan tutarsınız.',
    points:   ['Kullanım & kredi raporları', 'Popüler kategori analizi', 'Yanıt hızı metrikleri'],
    bg:       '/card_bg_5.png',
    accent:   '#60a5fa',
  },
  {
    id: 5,
    navLabel: 'ÖĞRENME',
    tag:      'ÖĞRENME',
    title:    'GERİ BİLDİRİM\n& ÖĞRENME',
    subtitle: 'SÜREKLİ İYİLEŞEN ZEKA',
    detail:   'Kullanıcı düzeltme talepleri anlık izlenir; yöneticiler manuel müdahalelerle yapay zekanın öğrenmesini yönlendirir. QABot her etkileşimde daha doğru, daha kurumsal hâle gelir.',
    points:   ['Anlık geri bildirim akışı', 'Manuel iyileştirme', 'Kendini geliştiren AI'],
    bg:       '/card_bg_6.png',
    accent:   '#34d399',
  },
]

const CARD_COUNT = CARDS.length
const STEP_DEG   = 360 / CARD_COUNT   // her kart arası açı (60°)

// ─── 3B Helix / Sarmal Parametreleri ──────────────────────────────────────────
// RADIUS : kartın Y ekseni etrafındaki yatay yarıçapı
// STEP_Y : kartlar arası dikey düşüş (sarmal adımı)
// PERSP  : CSS perspective (büyük = az distorsiyon)
// CARD_W / CARD_H : kart ölçüleri
const RADIUS = 680
const STEP_Y = 260
const PERSP  = 1000
const CARD_W = 580
const CARD_H = 390

const F_ORBIT = 'Orbitron, sans-serif'
const F_SPACE = 'Space Grotesk, sans-serif'

// ════════════════════════════════════════════════════════════════════════════
// ANA BİLEŞEN
// ════════════════════════════════════════════════════════════════════════════
export default function FeatureCarousel({ onBack, onNext, enabled }) {
  // activeIndex (ref): scroll mantığı için anlık değer (re-render tetiklemez)
  // activeIdx  (state): görsel render için aktif kart indeksi
  const activeIndex = useRef(0)
  const scrollLock  = useRef(false)
  const [activeIdx, setActiveIdx] = useState(0)

  // Belirli bir karta atla (sol nav tıklaması için yardımcı)
  const goTo = (i) => {
    activeIndex.current = i
    setActiveIdx(i)
  }

  // ── Tekerlek (wheel) ile kartlar arasında gezinme ────────────────────────────
  useEffect(() => {
    const onWheel = (e) => {
      if (!enabled || scrollLock.current) return

      if (e.deltaY < 0) {
        // Yukarı: önceki kart; ilk karttayken giriş sahnesine dön
        if (activeIndex.current === 0) { onBack?.(); return }
        scrollLock.current = true
        activeIndex.current -= 1
        setActiveIdx(activeIndex.current)
      } else {
        // Aşağı: sonraki kart; son karttayken landing'e geç
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

  // ── CSS 3D Helix transformu ──────────────────────────────────────────────────
  // Grubu arkaya çek, aktif kartı öne döndür, dikeyde merkeze taşı.
  const carouselTransform = [
    `translateZ(${-RADIUS}px)`,
    `rotateY(${-activeIdx * STEP_DEG}deg)`,
    `translateY(${activeIdx * STEP_Y}px)`,
  ].join(' ')

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'transparent', overflow: 'hidden' }}>

      {/* DNA sarmalı + yıldız arka planı paylaşılan World canvas'ından gelir;
          burada yalnızca HTML kart vitrini ve bilgi katmanı var. */}

      {/* ── 3B HELIX KART SARMALI ───────────────────────────────────────────── */}
      <div style={{ position: 'absolute', inset: 0, perspective: `${PERSP}px`, perspectiveOrigin: '50% 50%', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: 0, height: 0,
          transformStyle: 'preserve-3d', transform: carouselTransform,
          transition: 'transform 0.88s cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          {CARDS.map((c, i) => {
            const isActive = i === activeIdx
            // Aktif ± 2 kart görünür, ötekiler saydam
            const diff = Math.abs(((i - activeIdx) % CARD_COUNT + CARD_COUNT) % CARD_COUNT)
            const wrappedDiff = Math.min(diff, CARD_COUNT - diff)
            const visible = wrappedDiff <= 2

            return (
              <div key={i} style={{
                position: 'absolute', width: `${CARD_W}px`, height: `${CARD_H}px`,
                top: `${-(CARD_H / 2)}px`, left: `${-(CARD_W / 2)}px`,
                transform: [
                  `rotateY(${i * STEP_DEG}deg)`,
                  `translateZ(${RADIUS}px)`,
                  `translateY(${-i * STEP_Y}px)`,
                ].join(' '),
                backgroundImage: `url(${c.bg})`, backgroundSize: 'cover', backgroundPosition: 'center',
                borderRadius: '6px',
                opacity: visible ? (isActive ? 1 : 0.40) : 0,
                transition: 'opacity 0.5s ease',
                boxShadow: isActive
                  ? `0 0 50px 12px ${c.accent}30, 0 0 100px 30px ${c.accent}15, inset 0 0 0 1px ${c.accent}28`
                  : 'none',
                willChange: 'transform, opacity', overflow: 'hidden',
              }}>
                {/* Okunabilirlik için koyu gradient */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.05) 100%)', pointerEvents: 'none' }}/>
                {!isActive && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,8,6,0.52)', pointerEvents: 'none' }}/>
                )}

                {/* Kart sıra numarası — sol üst */}
                <div style={{
                  position: 'absolute', top: '1.1rem', left: '1.5rem', pointerEvents: 'none',
                  fontFamily: F_ORBIT, fontWeight: 900, fontSize: isActive ? '1.5rem' : '1rem',
                  letterSpacing: '0.04em', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.85)',
                  transition: 'font-size 0.4s', opacity: isActive ? 1 : 0.7,
                }}>
                  <span style={{ color: c.accent }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.55em' }}>{' '}/ {String(CARD_COUNT).padStart(2, '0')}</span>
                </div>

                {/* Kart üzeri başlık — kart içinde */}
                <div style={{ position: 'absolute', bottom: '1.4rem', left: '1.4rem', right: '1.4rem', pointerEvents: 'none', opacity: isActive ? 1 : 0.6, transition: 'opacity 0.4s' }}>
                  <p style={{ fontFamily: F_ORBIT, fontSize: '7px', letterSpacing: '0.5em', color: c.accent, textTransform: 'uppercase', marginBottom: '6px', opacity: 0.9 }}>{c.tag}</p>
                  <h2 style={{ fontFamily: F_ORBIT, fontSize: isActive ? 'clamp(1.1rem, 2.5vw, 1.8rem)' : 'clamp(0.7rem, 1.5vw, 1.1rem)', fontWeight: 900, color: '#fff', lineHeight: 1.1, textTransform: 'uppercase', whiteSpace: 'pre-line', textShadow: '0 2px 12px rgba(0,0,0,0.8)', transition: 'font-size 0.4s' }}>{c.title}</h2>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ÜST SOL: MARKA ──────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ position: 'absolute', top: '1.8rem', left: '2rem', zIndex: 30, fontFamily: F_ORBIT, fontSize: '11px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase' }}>
        ◈ QABOT
      </motion.div>

      {/* ── ÜST SAĞ: NAV ─────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
        style={{ position: 'absolute', top: '1.8rem', right: '2rem', zIndex: 30, display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
        {['ÖZELLİKLER', 'İLETİŞİM'].map(item => (
          <button key={item}
            style={{ fontFamily: F_ORBIT, fontSize: '10px', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#fff'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}>
            {item}
          </button>
        ))}
      </motion.div>

      {/* ── SOL ALT: SENKRON ÖZELLİK NAVİGASYONU ─────────────────────────────── */}
      {/* Liste aktif kartla senkron çalışır: aktif özellik vurgulanır, tıklanınca
          ilgili karta atlanır. Ziyaretçi konumunu görür ve hızlı gezinir. */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.4 }}
        style={{ position: 'absolute', bottom: '3rem', left: '2rem', zIndex: 30, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontFamily: F_SPACE, fontSize: '8px', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.26)', textTransform: 'uppercase', marginBottom: '14px' }}>
          NE ARIYORSUNUZ?
        </p>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {CARDS.map((c, i) => {
            const on = i === activeIdx
            return (
              <button key={c.id} onClick={() => goTo(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontFamily: F_SPACE, fontSize: '11px', letterSpacing: '0.18em',
                  color: on ? '#fff' : 'rgba(255,255,255,0.45)',
                  background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', textAlign: 'left',
                  transform: on ? 'translateX(6px)' : 'none', transition: 'all 0.3s ease',
                }}>
                <span style={{ color: on ? c.accent : 'rgba(255,255,255,0.28)', fontSize: '10px', transition: 'color 0.3s' }}>→</span>
                {c.navLabel}
              </button>
            )
          })}
        </nav>

        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} whileHover={{ scale: 1.03 }}
          onClick={() => onNext?.()}
          style={{ marginTop: '20px', padding: '10px 20px', border: `1px solid ${card.accent}55`, borderRadius: '3px', background: `${card.accent}14`, color: '#fff', fontFamily: F_SPACE, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', cursor: 'pointer', width: 'fit-content', transition: 'all 0.25s' }}
          onMouseEnter={e => { e.currentTarget.style.background = `${card.accent}28`; e.currentTarget.style.borderColor = card.accent }}
          onMouseLeave={e => { e.currentTarget.style.background = `${card.accent}14`; e.currentTarget.style.borderColor = `${card.accent}55` }}>
          HEMEN DENEYİN
        </motion.button>
      </motion.div>

      {/* ── SAĞ: DİNAMİK ŞEFFAF BİLGİ PANELİ ─────────────────────────────────── */}
      {/* Ortadaki karta GÖRE değişir. Cam (glassmorphism) görünümlü, yarı saydam.
          Kart değişince içerik AnimatePresence ile yumuşakça yenilenir.
          Burası özelliği "satan" alandır: detay metni + öne çıkan maddeler. */}
      <div style={{
        position: 'absolute', top: '63%', right: '8%', transform: 'translateY(-50%)',
        zIndex: 30, width: 'min(560px, 34vw)', pointerEvents: 'auto',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, x: 28, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: '1.8rem 1.6rem',
              borderRadius: '10px',
              border: `1px solid ${card.accent}33`,
              borderLeft: `2px solid ${card.accent}`,
              background: 'rgba(8,20,16,0.30)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              boxShadow: `0 20px 60px rgba(0,0,0,0.45), 0 0 30px ${card.accent}1f`,
            }}
          >
            {/* Etiket + sıra */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
              <span style={{ fontFamily: F_ORBIT, fontSize: '8px', letterSpacing: '0.45em', color: card.accent, textTransform: 'uppercase' }}>{card.tag}</span>
              <span style={{ fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}>
                {String(activeIdx + 1).padStart(2, '0')} / {String(CARD_COUNT).padStart(2, '0')}
              </span>
            </div>

            {/* Başlık */}
            <h3 style={{ fontFamily: F_ORBIT, fontWeight: 900, fontSize: '1.35rem', lineHeight: 1.05, color: '#fff', textTransform: 'uppercase', whiteSpace: 'pre-line', marginBottom: '0.5rem' }}>
              {card.title}
            </h3>
            <p style={{ fontFamily: F_SPACE, fontSize: '10px', letterSpacing: '0.18em', color: card.accent, textTransform: 'uppercase', marginBottom: '1rem' }}>
              {card.subtitle}
            </p>

            {/* Satış metni */}
            <p style={{ fontFamily: F_SPACE, fontSize: '12.5px', lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', marginBottom: '1.2rem' }}>
              {card.detail}
            </p>

            {/* Öne çıkan maddeler */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1.4rem' }}>
              {card.points.map((pt, k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: card.accent, boxShadow: `0 0 8px ${card.accent}`, flexShrink: 0 }}/>
                  <span style={{ fontFamily: F_SPACE, fontSize: '11.5px', letterSpacing: '0.02em', color: 'rgba(255,255,255,0.78)' }}>{pt}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => onNext?.()}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: F_ORBIT, fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: card.accent, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = '#fff'}
              onMouseLeave={e => e.currentTarget.style.color = card.accent}>
              İNCELE <span>→</span>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── SAĞ ALT: İLERLEME (sayaç + noktalar) ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        style={{ position: 'absolute', bottom: '1.8rem', right: '2rem', zIndex: 30, display: 'flex', alignItems: 'center', gap: '14px', pointerEvents: 'none' }}>
        <span style={{ fontFamily: F_ORBIT, fontSize: '10px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.2em' }}>
          {String(activeIdx + 1).padStart(2, '0')} / {String(CARD_COUNT).padStart(2, '0')}
        </span>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {CARDS.map((_, i) => (
            <div key={i} style={{ width: i === activeIdx ? '22px' : '4px', height: '3px', borderRadius: '2px', transition: 'all 0.45s ease', background: i === activeIdx ? card.accent : 'rgba(255,255,255,0.15)' }}/>
          ))}
        </div>
      </motion.div>

      {/* ── ALT ORTA: SCROLL İPUCU ───────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
        style={{ position: 'absolute', bottom: '1.6rem', left: '50%', transform: 'translateX(-50%)', zIndex: 30, fontFamily: F_SPACE, fontSize: '8px', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.10)', textTransform: 'uppercase', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        ↑ yukarı · geri &nbsp;·&nbsp; aşağı · keşfet ↓
      </motion.div>
    </div>
  )
}
