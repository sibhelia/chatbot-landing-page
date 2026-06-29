/**
 * DnaHelix.jsx
 * ════════════════════════════════════════════════════════════════════════════
 * QABot kimliğinin 3B imzası: UZUN, DNA tarzı çoklu-helis parçacık yapısı.
 *
 * 4 ayrı sarmal ŞERİT (marka yeşili + beyaz + lacivert) ortak bir eksen
 * etrafında DNA gibi sarılır; aralarında ince "merdiven" (rung) basamakları
 * döner. Bilgiyi/veriyi temsil eden, sürekli yukarı akan canlı bir form.
 *
 * Kendi Canvas'ı YOKTUR — paylaşılan World canvas'ı içinde yıldızlar ve geçiş
 * fıskiyesi ile AYNI 3B dünyada render edilir (tam görsel bütünlük). `active`
 * prop'u ile galeri (carousel) sayfasında belirginleşir, diğer sayfalarda
 * uOpacity uniform'u lerp ile yumuşakça sıfıra iner.
 *
 * ┌─ AYAR ────────────────────────────────────────────────────────────────────┐
 * │  HELIX_HEIGHT → sarmalın boyu (uzunluk)                                    │
 * │  HELIX_RADIUS → sarmalın genişliği                                         │
 * │  TWIST (shader)→ birim boyda kaç tur (sıkılık)                            │
 * │  STRAND_COLORS→ 4 şeridin renkleri (marka paleti)                         │
 * └────────────────────────────────────────────────────────────────────────────┘
 */
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const POINTS       = 56000   // toplam parçacık
const STRANDS      = 4       // sarmal şerit sayısı
const RUNG_FRAC    = 0.16    // merdiven (basamak) parçacık oranı
const HELIX_HEIGHT = 3.6     // dikey yarı-uzunluk (toplam boy = 2×)
const HELIX_RADIUS = 1.7     // eksenden uzaklık

// 4 şerit — marka yeşili + beyaz + lacivert (farklı tonlar, tek palet)
const STRAND_COLORS = [
  new THREE.Color('#34d399'),  // zümrüt
  new THREE.Color('#ffffff'),  // beyaz
  new THREE.Color('#10b981'),  // marka yeşili
  new THREE.Color('#60a5fa'),  // lacivert/mavi vurgu
]
const RUNG_COLOR = new THREE.Color('#a7f3d0')  // soluk nane basamaklar

// Vertex shader — her parçacığı, görünen yüksekliğine göre sarmal konuma yerleştirir
const vert = /* glsl */ `
  uniform float uTime;
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  varying   float vAlpha;

  const float VH    = ${HELIX_HEIGHT.toFixed(2)};
  const float TWIST = 1.55;   // sarılma sıkılığı (birim boyda tur sayısı)
  const float FLOW  = 0.50;   // yukarı akış hızı
  const float ROT   = 0.22;   // tüm yapının yavaş dönüşü

  void main() {
    float phase0 = position.x;   // şeridin başlangıç açısı (+ küçük jitter)
    float h0     = position.y;   // doğum yüksekliği
    float radius = position.z;   // eksenden uzaklık (rung'larda -R..R)

    // Sürekli yukarı akış (sonsuz döngü — başa sarılır)
    float y = mod(h0 + uTime * FLOW + VH, 2.0 * VH) - VH;

    // Helis: açı GÖRÜNEN yükseklikle artar → tutarlı DNA sarmalı
    float theta = phase0 + y * TWIST + uTime * ROT;

    vec3 pos = vec3(sin(theta) * radius, y, cos(theta) * radius);
    vColor = aColor;

    // Uçlarda yumuşak sönme — premium bitiş
    float edge = 1.0 - smoothstep(VH * 0.72, VH, abs(y));
    vAlpha = edge * 0.92;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (3.0 / max(-mv.z, 0.4));
    gl_Position  = projectionMatrix * mv;
  }
`

// Fragment shader — yumuşak çekirdek + hale; uOpacity ile genel görünürlük
const frag = /* glsl */ `
  uniform float uOpacity;
  varying vec3  vColor;
  varying float vAlpha;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = dot(uv, uv) * 4.0;
    if (d > 1.0) discard;
    float core = exp(-d * 6.0);
    float halo = exp(-d * 2.0) * 0.5;
    gl_FragColor = vec4(vColor, (core + halo) * vAlpha * uOpacity);
  }
`

export default function DnaHelix({ active = false }) {
  const ref = useRef()

  // Geometriyi bir kez üret: şerit + merdiven parçacıkları
  const { geo, mat } = useMemo(() => {
    const n      = POINTS
    const posArr = new Float32Array(n * 3)
    const colArr = new Float32Array(n * 3)
    const szArr  = new Float32Array(n)
    const TWO_PI = Math.PI * 2

    for (let i = 0; i < n; i++) {
      const isRung = Math.random() < RUNG_FRAC
      let phase0, h, radius, c, size

      h = (Math.random() * 2 - 1) * HELIX_HEIGHT

      if (!isRung) {
        // Şerit noktası: belirli bir şeride ait, sabit yarıçaplı
        const s = i % STRANDS
        phase0  = s * (TWO_PI / STRANDS) + (Math.random() * 2 - 1) * 0.05
        radius  = HELIX_RADIUS + (Math.random() * 2 - 1) * 0.13
        c       = STRAND_COLORS[s]
        size    = 2.0 + Math.random() * 3.2
      } else {
        // Merdiven (rung): karşılıklı şeritleri bağlar → radius -R..R
        const pair = Math.random() < 0.5 ? 0 : 1
        phase0  = pair * (TWO_PI / STRANDS)
        radius  = (Math.random() * 2 - 1) * HELIX_RADIUS
        c       = RUNG_COLOR
        size    = 1.4 + Math.random() * 1.8
      }

      posArr[i * 3]     = phase0
      posArr[i * 3 + 1] = h
      posArr[i * 3 + 2] = radius
      colArr[i * 3]     = c.r
      colArr[i * 3 + 1] = c.g
      colArr[i * 3 + 2] = c.b
      szArr[i]          = size
    }

    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(posArr, 3))
    g.setAttribute('aColor',   new THREE.BufferAttribute(colArr, 3))
    g.setAttribute('aSize',    new THREE.BufferAttribute(szArr,  1))

    const m = new THREE.ShaderMaterial({
      uniforms:       { uTime: { value: 0 }, uOpacity: { value: 0 } },
      vertexShader:   vert,
      fragmentShader: frag,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
    })
    return { geo: g, mat: m }
  }, [])

  // Zaman ilerlet + görünürlüğü (uOpacity) aktiflik durumuna göre yumuşat
  useFrame((_, delta) => {
    mat.uniforms.uTime.value += delta
    const target  = active ? 1.0 : 0.0
    const current = mat.uniforms.uOpacity.value
    mat.uniforms.uOpacity.value = current + (target - current) * Math.min(1, delta * 2.6)
  })

  return <points ref={ref} geometry={geo} material={mat} />
}
