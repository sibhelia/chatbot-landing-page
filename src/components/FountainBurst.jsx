/**
 * FountainBurst.jsx
 * ─────────────────────────────────────────────────────────────
 * Geçiş patlaması — paylaşılan World canvas'ı içinde render edilir
 * (kendi Canvas'ı YOK), böylece hurricane ve yıldızlarla AYNI 3B
 * dünyada yaşar.
 *
 * His: hurricane'in göz merkezinden, hafif sarmal alarak yukarı
 * FIŞKIRAN ve yerçekimiyle GERİ AŞAĞI DÜŞEN su damlaları / fıskiye.
 * Renk: buz-mavisi/beyaz — hurricane ile tam uyumlu.
 *
 * `active=true` olunca bileşen mount olur ve animasyon bir kez
 * baştan oynar; bitince onDone() çağrılır.
 * ─────────────────────────────────────────────────────────────
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BURST_N    = 24000   // ince/premium — az ama zarif parçacık
const BURST_DUR  = 3.8     // toplam ömür (s) — yavaş, zarif yay
const GRAVITY    = 3.2     // yumuşak yerçekimi (nazik geri düşüş)
const ORIGIN_Y   = -1.45   // hurricane göz seviyesi (dünya koordinatı)
const ORIGIN_Z   = -0.3

const burstVert = /* glsl */`
  uniform float uTime;

  attribute vec3  aVelocity;
  attribute vec3  aColor;
  attribute float aSize;
  attribute float aDelay;
  attribute float aSwirl;   // hurricane ile uyumlu sarmal dönüş hızı

  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    float t = max(0.0, uTime - aDelay);

    // Balistik fıskiye: yukarı fışkır + yerçekimiyle geri düş
    vec3 pos = position
      + aVelocity * t
      + vec3(0.0, -0.5 * ${GRAVITY.toFixed(1)} * t * t, 0.0);

    // Hurricane'den 'bir parça' hissi — xz düzleminde hafif sarmal dönüş
    float ang = aSwirl * t;
    float s = sin(ang), c = cos(ang);
    pos.xz = mat2(c, -s, s, c) * pos.xz;

    float life = clamp(t / ${BURST_DUR.toFixed(1)}, 0.0, 1.0);

    // Alfa: nazikçe parla, düşüş boyunca görünür kal, sonda yumuşak sön
    float alpha = smoothstep(0.0, 0.08, life)
                * (1.0 - smoothstep(0.6, 1.0, life)) * 0.8;

    // Boyut: doğumda iri, uçarken hafif küçülür
    float sz = aSize * max(0.0, 1.0 - life * 0.4);

    vColor = aColor;
    vAlpha = alpha;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = sz / max(-mv.z, 0.3) * 3.0;
    gl_Position  = projectionMatrix * mv;
  }
`

const burstFrag = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = dot(uv, uv) * 4.0;
    if (d > 1.0) discard;

    // İnce çekirdek + yumuşak hale (premium, az beyazlama)
    float core = exp(-d * 8.0);
    float halo = exp(-d * 2.0);

    vec3  col   = vColor + core * vec3(0.22);   // hafif çekirdek vurgusu
    float alpha = (core * 0.5 + halo * 0.4) * vAlpha;

    gl_FragColor = vec4(col, alpha);
  }
`

// Renk paleti — giriş/hurricane buz-mavisi tonu
const BURST_COLORS = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#e0f2fe'),
  new THREE.Color('#bfe6ff'),
  new THREE.Color('#a5f3fc'),
  new THREE.Color('#60efff'),
  new THREE.Color('#7dd3fc'),
  new THREE.Color('#93c5fd'),
]

export default function FountainBurst({ onDone }) {
  const elapsed = useRef(0)
  const called  = useRef(false)

  const { geo, mat } = useMemo(() => {
    const n   = BURST_N
    const pos = new Float32Array(n * 3)
    const vel = new Float32Array(n * 3)
    const col = new Float32Array(n * 3)
    const sz  = new Float32Array(n)
    const dly = new Float32Array(n)
    const swl = new Float32Array(n)

    for (let i = 0; i < n; i++) {
      // Hurricane gözünden başla — küçük disk
      const a0     = Math.random() * Math.PI * 2
      const spread = Math.random() * 0.45
      const x0 = Math.cos(a0) * spread
      const z0 = Math.sin(a0) * spread
      pos[i * 3]     = x0
      pos[i * 3 + 1] = ORIGIN_Y
      pos[i * 3 + 2] = ORIGIN_Z + z0

      // Hız: nazik YUKARI + hafif dışa açılım + ince teğetsel sarmal
      const up      = 2.4 + Math.random() * 3.6          // yumuşak fışkırma
      const outward = 0.4 + Math.random() * 1.6          // ölçülü yanlara açılım
      const ox = Math.cos(a0) * outward
      const oz = Math.sin(a0) * outward
      // teğet yön (zarif dönme hissi)
      const tx = -Math.sin(a0)
      const tz =  Math.cos(a0)
      const tang = (0.3 + Math.random() * 0.9)

      vel[i * 3]     = ox + tx * tang
      vel[i * 3 + 1] = up
      vel[i * 3 + 2] = oz + tz * tang

      // sürekli sarmal dönüş — dıştakiler daha yavaş
      swl[i] = (0.6 + Math.random() * 0.9) * (1.0 - spread * 0.5)

      const c = BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)]
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b

      sz[i]  = 4.0 + Math.random() * 15.0   // ince taneler (premium)
      dly[i] = Math.random() * 0.34         // kademeli ateşleme
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position',  new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aVelocity', new THREE.BufferAttribute(vel, 3))
    g.setAttribute('aColor',    new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize',     new THREE.BufferAttribute(sz,  1))
    g.setAttribute('aDelay',    new THREE.BufferAttribute(dly, 1))
    g.setAttribute('aSwirl',    new THREE.BufferAttribute(swl, 1))

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
    if (elapsed.current > BURST_DUR + 0.2 && !called.current) {
      called.current = true
      onDone?.()
    }
  })

  return <points geometry={geo} material={mat} />
}
