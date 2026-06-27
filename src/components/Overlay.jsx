import { motion } from 'framer-motion'

// ─── Veri ──────────────────────────────────────────────────────────────────────
const NAV = [
  '_WHO WE ARE',
  '_WHAT WE DO',
  '_OUR MISSION',
  '_CONTACT',
]

// ─── Easing: expo-out benzeri yumuşak kapanış ───────────────────────────────────
const EASE_OUT = [0.22, 1, 0.36, 1]

// ─── WordReveal ─────────────────────────────────────────────────────────────────
// Her kelimeyi kendi overflow-hidden container'ında alttan yukarı süzdürür.
function WordReveal({ words, delay = 0, className = '' }) {
  return (
    <div className={`flex flex-wrap leading-none ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block pr-[0.22em]"
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: 0.95,
              delay: delay + i * 0.14,
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
export default function Overlay() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-between p-10 pointer-events-none select-none">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">

        {/* Sol: brand */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="font-orbitron text-white text-[11px] tracking-[0.35em] uppercase"
        >
          ◈ STUDIO
        </motion.div>

        {/* Sağ: sürüm etiketi */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          transition={{ duration: 1.2, delay: 2.2 }}
          className="font-space text-white text-[10px] tracking-[0.3em] uppercase"
        >
          EST. 2025 — VOL.I
        </motion.p>
      </div>

      {/* ── Hero başlık (merkez-sol) ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center">
        <div>
          {/* Satır 1 */}
          <WordReveal
            words={['CREATIVE', 'DIGITAL']}
            delay={0.5}
            className="
              font-orbitron font-black text-white uppercase tracking-tight
              text-[clamp(2.8rem,7.2vw,8.5rem)]
            "
          />
          {/* Satır 2 */}
          <WordReveal
            words={['EXPERIENCES']}
            delay={0.82}
            className="
              font-orbitron font-black text-white uppercase tracking-tight
              text-[clamp(2.8rem,7.2vw,8.5rem)]
            "
          />

          {/* Alt yazı */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.55 }}
            className="
              mt-5 font-space text-white/40 uppercase
              text-[clamp(0.55rem,0.82vw,0.78rem)] tracking-[0.45em]
            "
          >
            MILLION PIECE MISSION — INTERACTIVE PARTICLE EXPERIENCE
          </motion.p>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">

        {/* Sol: navigasyon menü */}
        <nav className="flex flex-col gap-[10px] pointer-events-auto">
          {NAV.map((label, i) => (
            <motion.button
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.45, x: 0 }}
              transition={{ duration: 0.5, delay: 1.5 + i * 0.09, ease: 'easeOut' }}
              whileHover={{ x: 9, opacity: 1 }}
              className="
                font-space text-white text-[11px] tracking-[0.28em]
                uppercase text-left cursor-pointer
              "
            >
              {label}
            </motion.button>
          ))}
        </nav>

        {/* Sağ: yuvarlak ok butonu + telif */}
        <div className="flex flex-col items-end gap-5 pointer-events-auto">

          {/* Yuvarlak CTA butonu */}
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 1.8, ease: EASE_OUT }}
            whileHover={{ scale: 1.12 }}
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
