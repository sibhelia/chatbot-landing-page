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
// CLOUD_R_MAX=3.0 → bulut kartların içinde (radius 4.0) kalır; net görsel ayrım
const CLOUD_PTS   = 48000      // toplam parçacık (görkem için üst sınır)
const CLOUD_R_MIN = 0.4        // iç boş alan (merkez serbest)
const CLOUD_R_MAX = 3.0        // dış yarıçap — CARD_RADIUS'un (4.0) içinde kalır
const CLOUD_H     = 5.5        // silindir yüksekliği

// 6 kart için taban açıları: 0°, 60°, 120°, 180°, 240°, 300°
const BASE_ANGLES = Array.from(
  { length: CARD_COUNT },
  (_, i) => (i / CARD_COUNT) * Math.PI * 2,
)

// ─── 4 Fütüristik Neon Rengi ──────────────────────────────────────────────────
const NEON_COLORS = [
  new THREE.Color('#ff44bb'),  // neon pembe
  new THREE.Color('#00aaff'),  // siber mavi
  new THREE.Color('#aa44ff'),  // parlak mor
  new THREE.Color('#00ffaa'),  // zümrüt yeşili
]

// ─── Kozmik Bulut Vertex Shader ───────────────────────────────────────────────
// aColor: her parçacığa BufferGeometry attribute olarak atanan renk
// gl_PointSize sabit 2.8px → 48k nokta AdditiveBlending ile üst üste binerek
// gerçek nebula/galaksi bulutu görünümü oluşturur
const cloudVert = /* glsl */ `
  attribute vec3 aColor;
  varying   vec3 vColor;
  void main() {
    vColor       = aColor;
    gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 2.8;
  }
`

// ─── Kozmik Bulut Fragment Shader ─────────────────────────────────────────────
// Gaussian düşüş: merkez parlak beyaz, dış kenar renkli ve saydam
// AdditiveBlending ile yüz binlerce nokta duman, nebula, galaksi efekti verir
const cloudFrag = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float g = exp(-d * d * 10.0);       // gaussian glow
    gl_FragColor = vec4(vColor, g * 0.72);
  }
`

// ─── HoloCarousel ─────────────────────────────────────────────────────────────
export default function HoloCarousel({ activeIndexRef }) {
  const cloudRef    = useRef()                               // dönen kozmik bulut Points
  const groupRef    = useRef()                               // snap ile dönen kart grubu
  const cardRefs    = useRef([])                             // bireysel kart mesh'leri
  const hoveredCard = useRef(-1)                             // hover altındaki kart (-1 = yok)
  const currentRot  = useRef(0)                              // smooth group rotasyonu
  // pushRefs: her kart için lerp'lenmiş radyal öne çıkma miktarı (hover)
  // Array(6).fill(0) ile başlatılır; useFrame'de smooth animasyon uygulanır
  const pushRefs    = useRef(Array.from({ length: CARD_COUNT }, () => 0))

  // ── Kozmik Bulut Geometrisi ────────────────────────────────────────────────
  // Silindirik dağılım: θ uniform, r kare-kök ile → dış kenara yoğunlaşan nebula
  // Her parçacığa 4 neon renginden biri rastgele atanır (aColor attribute)
  const cloudGeo = useMemo(() => {
    const pos    = new Float32Array(CLOUD_PTS * 3)
    const colors = new Float32Array(CLOUD_PTS * 3)

    for (let i = 0; i < CLOUD_PTS; i++) {
      const theta = Math.random() * Math.PI * 2
      // pow(rand, 0.7): dış kenara doğru yoğunlaşan radyal dağılım (gerçek nebula profili)
      const r = CLOUD_R_MIN + Math.pow(Math.random(), 0.7) * (CLOUD_R_MAX - CLOUD_R_MIN)

      pos[i * 3]     = Math.cos(theta) * r
      pos[i * 3 + 1] = (Math.random() - 0.5) * CLOUD_H
      pos[i * 3 + 2] = Math.sin(theta) * r

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

  // ── Kozmik Bulut ShaderMaterial ────────────────────────────────────────────
  const cloudMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   cloudVert,
        fragmentShader: cloudFrag,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    [],
  )

  // ── Ayna Cam Kart Materyali ───────────────────────────────────────────────
  // transmission:0.98     → neredeyse tam şeffaf; arka nebula doğrudan görünür
  // roughness:0.02        → ayna pürüzsüzlüğü → mikro çizik yok, katı yansıma
  // clearcoatRoughness:0.02 → clearcoat ayna gibi → siber ışıklar net yansır
  // emissive + intensity  → ince fütüristik iç parlama → bulut içinde cam olduğu seçilir
  const cardMat = useMemo(
    () =>
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
      }),
    [],
  )

  // ── Frame Döngüsü ─────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    // Kozmik bulut ağır ve sinematik döner (tam tur ≈ 125 saniye)
    if (cloudRef.current) {
      cloudRef.current.rotation.y += delta * 0.05
    }

    const activeIdx = activeIndexRef?.current ?? 0

    // Snap rotasyonu: aktif kart tam merkeze (0°) getirilir
    // Her 60°'de bir kart → 6 × 60° = 360°
    const targetRot = -(activeIdx / CARD_COUNT) * Math.PI * 2
    currentRot.current = THREE.MathUtils.lerp(
      currentRot.current,
      targetRot,
      Math.min(delta * 7.0, 0.30), // 0.30 cap: yavaş frame'lerde overshoot yok
    )
    if (groupRef.current) {
      groupRef.current.rotation.y = currentRot.current
    }

    // Bireysel kart animasyonları (scale + smooth hover push)
    cardRefs.current.forEach((card, i) => {
      if (!card) return

      const isActive  = i === activeIdx
      const isHovered = hoveredCard.current === i

      // Scale: aktif kart 1.30× büyür (fark edilir odak efekti)
      //        hover'da ek %7 genişleme; diğer kartlar 1.0×
      const targetScale = isActive
        ? (isHovered ? 1.38 : 1.30)
        : (isHovered ? 1.07 : 1.00)
      card.scale.setScalar(
        THREE.MathUtils.lerp(card.scale.x, targetScale, delta * 5.5),
      )

      // Smooth hover push: kart radyal yönde (merkeze göre dışa = kameraya doğru) lerp ile çıkar
      // delta * 6 → 0.35 birim hedefe ~250ms'de ulaşır (kaygan, hızlı hissettiren)
      const targetPush = isHovered ? 0.38 : 0
      pushRefs.current[i] = THREE.MathUtils.lerp(
        pushRefs.current[i], targetPush, delta * 6,
      )
      const angle = BASE_ANGLES[i]
      const r     = CARD_RADIUS + pushRefs.current[i]
      card.position.x = Math.sin(angle) * r
      card.position.z = Math.cos(angle) * r
      card.position.y = 0
    })
  })

  return (
    <>
      {/* ── Devasa Kozmik Parçacık Bulutu (48k nokta, silindirik nebula) ──── */}
      {/* Kendi etrafında yavaş döner; kartların arkasındaki ışık tüneli     */}
      <points ref={cloudRef} geometry={cloudGeo} material={cloudMat} />

      {/* ── 6 Sinematik Geniş Cam Kart (60° aralıklı, snap carousel) ───────── */}
      {/* groupRef.rotation.y → snap ile aktif kart tam ön plana gelir        */}
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
            // rotation.y = angle → her kart merkeze bakan yönde konumlanır
            // (kameraya en yakın kart her zaman kameraya bakıyor olur)
            rotation={[0, angle, 0]}
            onPointerOver={() => { hoveredCard.current = i }}
            onPointerOut={() => { hoveredCard.current = -1 }}
          >
            {/*
              boxGeometry [2.2 × 1.2 × 0.03]: geniş sinematik ekran formatı.
              0.03 derinlik → kenar yüzeyleri son derece ince; transmission:0.96
              ile neredeyse görünmez → kenarsız cam bloğu illüzyonu.
            */}
            <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
            <primitive object={cardMat} attach="material" />
          </mesh>
        ))}
      </group>
    </>
  )
}
