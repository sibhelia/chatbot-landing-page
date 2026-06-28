/**
 * TransitionBurst.jsx
 * ─────────────────────────────────────────────────────────────
 * Sahne ↔ Carousel geçişinde tam ekran yıldız/ışık patlaması.
 * 30 000 GPU parçacığı hurricane merkezinden yukarı fırlar,
 * tüm ekranı renk ve ışıkla kaplar — additive blending + glow.
 * ─────────────────────────────────────────────────────────────
 */
import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Sabitler ─────────────────────────────────────────────────────────────────
const BURST_N   = 30000   // parçacık sayısı
const BURST_DUR = 2.8     // toplam animasyon süresi (s)

// ─── Vertex Shader — balistik yörünge + glow boyutu ──────────────────────────
const burstVert = /* glsl */`
  uniform float uTime;

  attribute vec3  aVelocity;
  attribute vec3  aColor;
  attribute float aSize;
  attribute float aDelay;

  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float t = max(0.0, uTime - aDelay);

    // Balistik: konum = başlangıç + hız*t - yerçekimi*t²
    vec3 pos = position
      + aVelocity * t
      + vec3(0.0, -1.8 * t * t, 0.0);     // hafif yerçekimi

    // Normalize ömür (0→1 over BURST_DUR)
    float life = clamp(t / ${BURST_DUR.toFixed(1)}, 0.0, 1.0);

    // Alfa: hızlı parlama → yavaş sönme
    float alpha = smoothstep(0.0, 0.06, life)
                * (1.0 - smoothstep(0.32, 1.0, life));

    // Boyut: doğumda büyük, uçarken küçülür
    float sz = aSize * max(0.0, 1.0 - life * 0.60);

    vColor = aColor;
    vAlpha = alpha;

    gl_PointSize = sz;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

// ─── Fragment Shader — çift katmanlı glow (çekirdek + hale) ──────────────────
const burstFrag = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = dot(uv, uv) * 4.0;
    if (d > 1.0) discard;

    // Sert parlak çekirdek + yumuşak dış hale
    float core = exp(-d * 9.0);
    float halo = exp(-d * 2.2);

    vec3  col   = vColor + core * vec3(0.5, 0.5, 0.5);  // çekirdek beyazlaşır
    float alpha = (core * 0.65 + halo * 0.50) * vAlpha;

    gl_FragColor = vec4(col, alpha);
  }
`

// ─── Renk Paleti — hurricane ile aynı ────────────────────────────────────────
const BURST_COLORS = [
  new THREE.Color('#60efff'),  // cyan
  new THREE.Color('#c084fc'),  // mor
  new THREE.Color('#f472b6'),  // pembe
  new THREE.Color('#ffffff'),  // beyaz
  new THREE.Color('#fbbf24'),  // altın
  new THREE.Color('#a5f3fc'),  // açık cyan
  new THREE.Color('#2dd4bf'),  // teal
  new THREE.Color('#e879f9'),  // magenta
]

// ─── GPU Parçacık Mesh'i ──────────────────────────────────────────────────────
function BurstMesh({ onDone }) {
  const elapsed = useRef(0)
  const called  = useRef(false)

  const { geo, mat } = useMemo(() => {
    const n   = BURST_N
    const pos = new Float32Array(n * 3)
    const vel = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const sz  = new Float32Array(n)
    const dly = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      // Hurricane merkezinden başla — küçük saçılma
      const spread = Math.random() * 0.6
      const sa     = Math.random() * Math.PI * 2
      pos[i * 3]     = Math.cos(sa) * spread
      pos[i * 3 + 1] = -1.2   // hurricane göz seviyesi
      pos[i * 3 + 2] = Math.sin(sa) * spread

      // Hız: ağırlıklı yukarı + radyal dışa doğru patlama
      const phi   = Math.random() * Math.PI * 2          // yatay açı
      const theta = (0.15 + Math.random() * 0.85) * Math.PI * 0.55  // yukarı eğimi
      const speed = 2.5 + Math.random() * 13.0

      vel[i * 3]     = Math.cos(phi)   * Math.cos(theta) * speed
      vel[i * 3 + 1] = Math.sin(theta) * speed * 2.0    // güçlü yukarı itme
      vel[i * 3 + 2] = Math.sin(phi)   * Math.cos(theta) * speed

      // Renk
      const c = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b

      // Boyut: merkeze yakın parçacıklar daha büyük
      sz[i]  = 5.0 + Math.random() * 30.0

      // Kademeli ateşleme — patlama hissi
      dly[i] = Math.random() * 0.22
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',  new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3))
    g.setAttribute('aColor',    new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize',     new THREE.BufferAttribute(sz,  1))
    g.setAttribute('aDelay',    new THREE.BufferAttribute(dly, 1))

    const m = new THREE.ShaderMaterial({
      uniforms:       { uTime: { value: 0 } },
      vertexShader:   burstVert,
      fragmentShader: burstFrag,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    })

    return { geo: g, mat: m }
  }, [])

  useFrame((_, delta) => {
    elapsed.current += delta
    mat.uniforms.uTime.value = elapsed.current

    // Animasyon bitti → parent'a bildir
    if (elapsed.current > BURST_DUR + 0.2 && !called.current) {
      called.current = true
      onDone?.()
    }
  })

  return <points geometry={geo} material={mat} />
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function TransitionBurst({ active, onDone }) {
  if (!active) return null

  return (
    <div
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        500,
        pointerEvents: 'none',
      }}
    >
      {/* Anında parlayan radyal renk dalgası */}
      <div style={{
        position:   'absolute',
        inset:      0,
        background: 'radial-gradient(ellipse 70% 50% at 50% 65%, rgba(96,239,255,0.18) 0%, rgba(192,132,252,0.10) 35%, transparent 70%)',
        animation:  'burstFlash 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
      }}/>

      {/* Ekranın tamamını kaplayan ikinci dalga — daha geniş renk */}
      <div style={{
        position:          'absolute',
        inset:             0,
        background:        'radial-gradient(ellipse 120% 100% at 50% 80%, rgba(244,114,182,0.08) 0%, rgba(96,239,255,0.06) 40%, transparent 70%)',
        animation:         'burstFlash2 1.4s ease-out forwards',
        animationDelay:    '0.1s',
      }}/>

      {/* GPU Parçacık Canvas — şeffaf arka plan */}
      <Canvas
        gl={{
          alpha:        true,
          antialias:    false,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0)
          scene.background = null
        }}
        camera={{ position: [0, 0, 8], fov: 82 }}
        style={{ background: 'transparent' }}
      >
        <BurstMesh onDone={onDone} />
      </Canvas>
    </div>
  )
}
