import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ─── Sahne Sabitleri ──────────────────────────────────────────────────────────
const CARD_COUNT  = 6          // 6 sinematik kart, 60° aralıklı
const CARD_RADIUS = 4.0        // kart yörüngesi — bulut dışında, halka gibi çevreler
const CARD_W      = 2.2        // kart genişliği (wide-screen format)
const CARD_H      = 1.2        // kart yüksekliği
const CARD_D      = 0.03       // son derece ince derinlik → kenar neredeyse görünmez

// Kozmik yıldız kümesi bulut parametreleri
const CLOUD_PTS   = 48000
const CLOUD_R_MIN = 0.4
const CLOUD_R_MAX = 3.0
const CLOUD_H     = 5.5

const BASE_ANGLES = Array.from(
  { length: CARD_COUNT },
  (_, i) => (i / CARD_COUNT) * Math.PI * 2,
)

const NEON_COLORS = [
  new THREE.Color('#ff44bb'),
  new THREE.Color('#00aaff'),
  new THREE.Color('#aa44ff'),
  new THREE.Color('#00ffaa'),
]

// ─── Spiral Helix Kozmik Bulut Vertex Shader ──────────────────────────────────
// Position buffer yeniden paketlendi:
//   position.x = thetaOff : her parçacığın rastgele faz sapması
//   position.y = y         : dikey konum (−CLOUD_H/2 … +CLOUD_H/2)
//   position.z = r         : yarıçap
// Shader'da her karede x/z koordinatları bir helix formülüyle hesaplanır:
//   x = sin(y * freq + thetaOff + uTime * hız) * r
//   z = cos(y * freq + thetaOff + uTime * hız) * r
// Sonuç: yukarı doğru kıvrılarak ilerleyen dinamik kozmik tünel
const cloudVert = /* glsl */ `
  uniform float uTime;
  attribute vec3 aColor;
  varying   vec3 vColor;

  void main() {
    float thetaOff = position.x;
    float y        = position.y;
    float r        = position.z;

    // Helix frekansı: Y ekseni boyunca kaç tam sarım yapılacağı
    float freq  = 1.8;
    float theta = y * freq + thetaOff + uTime * 0.25;

    vec3 pos = vec3(
      sin(theta) * r,
      y,
      cos(theta) * r
    );

    vColor       = aColor;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.8;
  }
`

// ─── Kozmik Bulut Fragment Shader ─────────────────────────────────────────────
const cloudFrag = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float g = exp(-d * d * 10.0);
    gl_FragColor = vec4(vColor, g * 0.72);
  }
`

// ─── HoloCarousel ─────────────────────────────────────────────────────────────
export default function HoloCarousel({ activeIndexRef }) {
  const cloudRef    = useRef()
  const groupRef    = useRef()
  const cardRefs    = useRef([])
  const hoveredCard = useRef(-1)
  const currentRot  = useRef(0)
  const pushRefs    = useRef(Array.from({ length: CARD_COUNT }, () => 0))

  // ── Spiral/Helix Kozmik Bulut Geometrisi ──────────────────────────────────
  // Her parçacık için (thetaOff, y, r) saklanır; x/z shader'da hesaplanır.
  // Bu sayede tüm parçacıklar GPU'da helix formülüne göre konumlandırılır —
  // CPU'da buffer güncellenmez, performans kaybı yoktur.
  const cloudGeo = useMemo(() => {
    const pos    = new Float32Array(CLOUD_PTS * 3)
    const colors = new Float32Array(CLOUD_PTS * 3)

    for (let i = 0; i < CLOUD_PTS; i++) {
      const y        = (Math.random() - 0.5) * CLOUD_H
      const r        = CLOUD_R_MIN + Math.pow(Math.random(), 0.7) * (CLOUD_R_MAX - CLOUD_R_MIN)
      const thetaOff = Math.random() * Math.PI * 2

      pos[i * 3]     = thetaOff  // x slot = faz sapması
      pos[i * 3 + 1] = y         // y slot = yükseklik
      pos[i * 3 + 2] = r         // z slot = yarıçap

      const col = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)]
      colors[i * 3]     = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  // ── Kozmik Bulut ShaderMaterial (uTime uniform ile spiral animasyonu) ─────
  const cloudMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
        },
        vertexShader:   cloudVert,
        fragmentShader: cloudFrag,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    [],
  )

  // ── Bireysel Kart Materyalleri (6 adet, her biri bağımsız opacity/glow) ──
  // Tek paylaşımlı materyal yerine her karta özgü materyal:
  // → Aktif kartın opaklığını/parlamasını diğerlerinden bağımsız lerp edebiliriz.
  const cardMats = useMemo(
    () => Array.from({ length: CARD_COUNT }, () =>
      new THREE.MeshPhysicalMaterial({
        color:                     new THREE.Color('#e8f0ff'),
        transmission:              0.98,
        roughness:                 0.02,
        thickness:                 1.50,
        ior:                       1.50,
        iridescence:               1.0,
        iridescenceIOR:            1.38,
        iridescenceThicknessRange: [150, 750],
        clearcoat:                 1.0,
        clearcoatRoughness:        0.02,
        emissive:                  new THREE.Color('#ffffff'),
        emissiveIntensity:         0.20,
        transparent:               true,
        opacity:                   0.98,
        side:                      THREE.DoubleSide,
        depthWrite:                false,
        envMapIntensity:           1.4,
      })
    ),
    [],
  )

  // ── Frame Döngüsü ──────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    // ── 1. Spiral helix: uTime ilerle + hafif genel yörünge dönüşü ───────────
    cloudMat.uniforms.uTime.value += delta
    if (cloudRef.current) {
      // Küçük rigid-body dönüşü helix animasyonuna ek derinlik katar
      cloudRef.current.rotation.y += delta * 0.02
    }

    // ── 2. Snap carousel ─────────────────────────────────────────────────────
    const activeIdx = activeIndexRef?.current ?? 0
    const targetRot = -(activeIdx / CARD_COUNT) * Math.PI * 2
    currentRot.current = THREE.MathUtils.lerp(
      currentRot.current,
      targetRot,
      Math.min(delta * 7.0, 0.30),
    )
    if (groupRef.current) {
      groupRef.current.rotation.y = currentRot.current
    }

    // ── 3. Bireysel kart animasyonları ────────────────────────────────────────
    cardRefs.current.forEach((card, i) => {
      if (!card) return

      const isActive  = i === activeIdx
      const isHovered = hoveredCard.current === i

      // Scale: aktif kart öne çıkar
      const targetScale = isActive
        ? (isHovered ? 1.38 : 1.30)
        : (isHovered ? 1.07 : 1.00)
      card.scale.setScalar(
        THREE.MathUtils.lerp(card.scale.x, targetScale, delta * 5.5),
      )

      // Hover push: radyal yönde öne çıkma
      const targetPush = isHovered ? 0.38 : 0
      pushRefs.current[i] = THREE.MathUtils.lerp(
        pushRefs.current[i], targetPush, delta * 6,
      )
      const angle = BASE_ANGLES[i]
      const r     = CARD_RADIUS + pushRefs.current[i]
      card.position.x = Math.sin(angle) * r
      card.position.z = Math.cos(angle) * r
      card.position.y = 0

      // ── Silindir hizalaması: her karede merkeze bak ──────────────────────
      // lookAt(0,0,0) → kartın −Z yüzü dünya merkezine (0,0,0) döner.
      // Three.js parent matrisini (group rotation) hesaba katarak
      // local quaternion'u doğru şekilde günceller.
      // Pozisyon GÜNCELLENDİKTEN SONRA çağrılır → push'lu konum da doğru.
      card.lookAt(0, 0, 0)

      // ── Odak / Kontrast: aktif kart parlak, diğerleri soluk ──────────────
      const mat = cardMats[i]
      const targetOpacity  = isActive ? 0.98 : 0.50
      const targetEmissive = isActive ? 0.42 : 0.07
      mat.opacity           = THREE.MathUtils.lerp(mat.opacity,           targetOpacity,  delta * 3.5)
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, delta * 3.5)
    })
  })

  return (
    <>
      {/* ── Spiral Helix Kozmik Parçacık Bulutu ──────────────────────────── */}
      {/* GPU shader'da helix formülü; CPU'da buffer güncellemesi yok       */}
      <points ref={cloudRef} geometry={cloudGeo} material={cloudMat} />

      {/* ── 6 Sinematik Cam Kart (snap carousel, lookAt ile silindir hizalı) */}
      {/* rotation prop'u yok — useFrame'deki card.lookAt her kareyi yönetir */}
      <group ref={groupRef}>
        {BASE_ANGLES.map((angle, i) => (
          <mesh
            key={`card-${i}`}
            ref={el => { cardRefs.current[i] = el }}
            position={[
              Math.sin(angle) * CARD_RADIUS,
              0,
              Math.cos(angle) * CARD_RADIUS,
            ]}
            onPointerOver={() => { hoveredCard.current = i }}
            onPointerOut={() => { hoveredCard.current = -1 }}
          >
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <primitive object={cardMats[i]} attach="material" />
          </mesh>
        ))}
      </group>
    </>
  )
}
