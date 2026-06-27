import { motion, AnimatePresence } from 'framer-motion'

// ─── Sabit veri ────────────────────────────────────────────────────────────────
const NAV = ['_WHO WE ARE', '_WHAT WE DO', '_OUR MISSION', '_CONTACT']
const EASE_OUT = [0.22, 1, 0.36, 1]

// ─── Yardımcı: sayı formatı ────────────────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0')

// ─── WordReveal ─────────────────────────────────────────────────────────────────
// Her kelime kendi overflow-hidden container'ında alttan yukarı süzülür.
function WordReveal({ words, delay = 0, className = '' }) {
  if (!words || words.length === 0) return null
  return (
    <div className={`flex flex-wrap leading-none ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block pr-[0.22em]"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.9,
              delay: delay + i * 0.12,
              ease: EASE_OUT,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

// ─── Overlay ────────────────────────────────────────────────────────────────────
export default function Overlay({ scene, sceneIndex, totalScenes, onNext }) {
  const line1Words = scene.line1 ? scene.line1.split(' ').filter(Boolean) : []
  const line2Words = scene.line2 ? scene.line2.split(' ').filter(Boolean) : []

  // Satır 2'nin başlangıç gecikmesi satır 1'in kelime sayısına göre hesaplanır
  const line2Delay = 0.08 + line1Words.length * 0.12

  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between p-10 pointer-events-none select-none">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="font-orbitron text-white text-[11px] tracking-[0.35em] uppercase"
        >
          ◈ STUDIO
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 1.2, delay: 2.2 }}
          className="font-space text-white text-[10px] tracking-[0.3em] uppercase"
        >
          EST. 2025 — VOL.I
        </motion.p>
      </div>

      {/* ── Hero başlık — sahne geçişleriyle AnimatePresence ──────────────── */}
      <div className="flex-1 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            // Giriş: container anında görünür, kelimeler kendi animasyonlarıyla gelir
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            // Çıkış: yukarı doğru kayboluş
            exit={{
              opacity: 0,
              y: '-4%',
              transition: { duration: 0.35, ease: 'easeIn' },
            }}
          >
            {/* Satır 1 */}
            <WordReveal
              words={line1Words}
              delay={0.06}
              className="
                font-orbitron font-black text-white uppercase tracking-tight
                text-[clamp(2.8rem,7.2vw,8.5rem)]
              "
            />

            {/* Satır 2 */}
            <WordReveal
              words={line2Words}
              delay={line2Delay}
              className="
                font-orbitron font-black text-white uppercase tracking-tight
                text-[clamp(2.8rem,7.2vw,8.5rem)]
              "
            />

            {/* Alt yazı */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 1.1,
                delay: line2Delay + line2Words.length * 0.12 + 0.2,
              }}
              className="
                mt-5 font-space text-white/40 uppercase
                text-[clamp(0.55rem,0.82vw,0.78rem)] tracking-[0.45em]
              "
            >
              {scene.subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">

        {/* Sol: navigasyon + ilerleme çubuğu */}
        <div className="flex flex-col pointer-events-auto">

          {/* Nav */}
          <nav className="flex flex-col gap-[10px] mb-6">
            {NAV.map((label, i) => (
              <motion.button
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 0.45, x: 0 }}
                transition={{ duration: 0.5, delay: 1.5 + i * 0.09, ease: 'easeOut' }}
                whileHover={{ x: 9, opacity: 1 }}
                className="font-space text-white text-[11px] tracking-[0.28em] uppercase text-left cursor-pointer"
              >
                {label}
              </motion.button>
            ))}
          </nav>

          {/* İlerleme çubuğu */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.9 }}
            className="flex items-center gap-4"
          >
            {/* Numara */}
            <span className="font-orbitron text-white/35 text-[10px] tracking-[0.2em]">
              {pad(sceneIndex + 1)}&nbsp;/&nbsp;{pad(totalScenes)}
            </span>

            {/* Çizgi */}
            <div className="relative w-28 h-px bg-white/15 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-white/55"
                animate={{ width: `${((sceneIndex + 1) / totalScenes) * 100}%` }}
                transition={{ duration: 0.85, ease: EASE_OUT }}
              />
            </div>

            {/* Sahne adı — küçük etiket */}
            <AnimatePresence mode="wait">
              <motion.span
                key={sceneIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 0.3, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.35 }}
                className="font-orbitron text-white text-[8px] tracking-[0.25em] uppercase hidden sm:inline"
              >
                {scene.line2}
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Sağ: yuvarlak ok butonu + telif */}
        <div className="flex flex-col items-end gap-5 pointer-events-auto">

          {/* Yuvarlak CTA butonu */}
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.8, ease: EASE_OUT }}
            whileHover={{ scale: 1.12 }}
            onClick={onNext}
            className="
              w-[68px] h-[68px] rounded-full
              border border-white/25 hover:border-white/65
              flex items-center justify-center
              text-white/55 hover:text-white
              transition-colors duration-300 cursor-pointer
            "
          >
            <motion.span
              className="text-xl leading-none"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              →
            </motion.span>
          </motion.button>

          {/* Telif hakkı */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.22 }}
            transition={{ duration: 1.5, delay: 2.2 }}
            className="font-space text-white text-[9px] tracking-[0.3em] uppercase"
          >
            © 2025 ALL RIGHTS RESERVED
          </motion.p>
        </div>
      </div>
    </div>
  )
}
