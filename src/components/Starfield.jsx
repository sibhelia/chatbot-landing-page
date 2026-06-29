/**
 * Starfield.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * Tüm ekranı EŞİT biçimde kaplayan üniform yıldız katmanı. ParticleCloud'un
 * (bulut formu) seyrek kaldığı yerleri de doldurur; böylece arka planın HER
 * YERİ — metinlerin altında dahil — yıldızlı görünür.
 *
 * Paylaşılan World canvas'ı içinde, en arkada render edilir. Hafif twinkle
 * (parıltı) ile canlı; çok yavaş yatay sürüklenme. Tema: yeşil-beyaz.
 * ════════════════════════════════════════════════════════════════════════════
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 11000

const vert = /* glsl */ `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  attribute vec3  aColor;
  varying vec3  vColor;
  varying float vTw;
  void main() {
    vColor = aColor;
    // Twinkle (parıltı)
    float tw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase * 6.2831);
    vTw = tw;
    vec3 pos = position;
    // Çok hafif sürüklenme
    pos.x += sin(uTime * 0.05 + aPhase * 6.2831) * 0.15;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * tw;
  }
`

const frag = /* glsl */ `
  varying vec3  vColor;
  varying float vTw;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float a = (1.0 - smoothstep(0.1, 0.5, d)) * (0.45 + vTw * 0.55);
    gl_FragColor = vec4(vColor, a);
  }
`

const PALETTE = [
  new THREE.Color('#ffffff'),
  new THREE.Color('#d8ffe9'),
  new THREE.Color('#a7f3d0'),
  new THREE.Color('#34d399'),
]

export default function Starfield() {
  const matRef = useRef()

  const { geo, mat } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3)
    const col = new Float32Array(COUNT * 3)
    const sz  = new Float32Array(COUNT)
    const ph  = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      // Geniş, ekranı dolduran üniform dağılım
      pos[i * 3]     = (Math.random() - 0.5) * 30   // x [-15,15]
      pos[i * 3 + 1] = (Math.random() - 0.5) * 19   // y [-9.5,9.5]
      pos[i * 3 + 2] = Math.random() * 11 - 9       // z [-9,2]
      const c = PALETTE[Math.random() < 0.7 ? (Math.random() < 0.6 ? 1 : 0) : (Math.random() < 0.5 ? 2 : 3)]
      col[i * 3]     = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
      sz[i] = 1.0 + Math.random() * 2.4
      ph[i] = Math.random()
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('aColor',   new THREE.BufferAttribute(col, 3))
    g.setAttribute('aSize',    new THREE.BufferAttribute(sz, 1))
    g.setAttribute('aPhase',   new THREE.BufferAttribute(ph, 1))
    const m = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: vert, fragmentShader: frag,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  useFrame((_, delta) => { mat.uniforms.uTime.value += delta })

  return <points ref={matRef} geometry={geo} material={mat} />
}
