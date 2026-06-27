/**
 * HtmlOverlay
 * Canvas'ın üstüne konumlanan HTML katmanı.
 * position: absolute, z-index: 10 ile R3F Canvas'ın üzerinde kalır.
 * pointerEvents: none → alt div'ler için açılmaz, iç elementlerde gerekirse 'auto' yap.
 */
export default function HtmlOverlay({ children }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  )
}
