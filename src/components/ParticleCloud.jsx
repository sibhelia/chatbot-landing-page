import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── Parçacık sayısı artırıldı: geniş alana yayılım için ──────────────────────
const PARTICLE_COUNT = 60_000

// Z animasyon parametreleri (shader ile JS'te eşleşmeli)
const Z_MIN  = -5.0
const Z_SPAN =  6.0   // [-5, 1] → 6 birim toplam

// ─── Vertex Shader ─────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2  uMouse;

varying float vDepth;

vec3 hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx) * 2.0 - 1.0;
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(
      mix(dot(hash3(i),               f              ),
          dot(hash3(i + vec3(1,0,0)), f - vec3(1,0,0)), u.x),
      mix(dot(hash3(i + vec3(0,1,0)), f - vec3(0,1,0)),
          dot(hash3(i + vec3(1,1,0)), f - vec3(1,1,0)), u.x),
    u.y),
    mix(
      mix(dot(hash3(i + vec3(0,0,1)), f - vec3(0,0,1)),
          dot(hash3(i + vec3(1,0,1)), f - vec3(1,0,1)), u.x),
      mix(dot(hash3(i + vec3(0,1,1)), f - vec3(0,1,1)),
          dot(hash3(i + vec3(1,1,1)), f - vec3(1,1,1)), u.x),
    u.y),
  u.z);
}

void main() {
  vec3  pos = position;
  float t   = uTime * 0.18;

  // ── Organik XY dalgalanma (iki katman) ─────────────────────────────────────
  float nx  = noise(vec3(pos.x * 1.1 + t,        pos.y * 1.1,        pos.z * 0.9));
  float ny  = noise(vec3(pos.y * 1.1,        pos.z * 1.1 + t,        pos.x * 1.1));
  float nz  = noise(vec3(pos.z * 0.9 + t * 0.4,  pos.x * 1.1,        pos.y * 1.1));
  float nx2 = noise(vec3(pos.x * 2.5 + t * 1.8,  pos.y * 2.5,        pos.z * 1.8));
  float ny2 = noise(vec3(pos.y * 2.5,        pos.z * 2.5 + t * 1.8,  pos.x * 2.5));

  pos.x += nx * 0.20 + nx2 * 0.04;
  pos.y += ny * 0.20 + ny2 * 0.04;

  // ── Z derinlik akışı: kameraya doğru sonsuz tünel ─────────────────────────
  // Parçacıklar arka plandan öne doğru akar; ön tarafa gelince arka plana atlar.
  // mod() ile [-5, 1] aralığında döngüsel pozisyon hesaplanır.
  float zSpeed    = 0.12;
  float zAnimated = mod(position.z - (-5.0) + uTime * zSpeed, 6.0) + (-5.0);

  // Gürültü ile organik Z titreşimi
  pos.z = zAnimated + nz * 0.08;

  // ── Fare sine dalgası (dairesel delik oluşmaz) ─────────────────────────────
  vec2  mouseWorld = uMouse * 2.5;           // geniş alana ölçekle
  vec2  toMouse    = pos.xy - mouseWorld;
  float mDist      = length(toMouse);
  float waveEnv    = exp(-mDist * mDist * 1.8);
  float wave       = sin(mDist * 9.0 - uTime * 1.8) * waveEnv * 0.09;
  pos.xy += normalize(toMouse + vec2(0.0001)) * wave;

  // ── Derinlik değeri fragment'a gönderilir ──────────────────────────────────
  vDepth = pos.z;   // animated Z (renk gradyanı için)

  // ── Perspektif nokta boyutu: derinlik hissi için 1/dist formülü ───────────
  vec4  mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float dist       = max(-mvPosition.z, 0.1);  // negatif z = kamera önü
  gl_PointSize = clamp(5.5 / dist, 0.15, 3.8);
  gl_Position  = projectionMatrix * mvPosition;
}
`

// ─── Fragment Shader ────────────────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
uniform vec3 uColor;

varying float vDepth;

void main() {
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Soft circle + halo
  float edge  = 1.0 - smoothstep(0.3, 0.5, dist);
  float glow  = exp(-dist * dist * 20.0) * 0.45;
  float alpha = clamp(edge + glow, 0.0, 1.0);

  // Derinlik renk gradyanı: Z ∈ [-5, 1] → t ∈ [0, 1]
  float t      = clamp((vDepth + 5.0) / 6.0, 0.0, 1.0);
  vec3  farCol  = uColor * 0.55;                  // uzak → koyu
  vec3  nearCol = mix(uColor, vec3(1.0), 0.30);   // yakın → parlak/beyaza yakın

  // Kameraya yakın parçacıklar AdditiveBlending ile daha parlak görünür
  vec3  color   = mix(farCol, nearCol, t);

  gl_FragColor = vec4(color, alpha * 0.80);
}
`

// ───────────────────────────────────────────────────────────────────────────────
export default function ParticleCloud({ targetColor = '#e0f2fe' }) {
  const pointsRef      = useRef()
  const mouseTarget    = useRef(new THREE.Vector2(0, 0))
  const targetColorRef = useRef(new THREE.Color(targetColor))

  useEffect(() => {
    targetColorRef.current.set(targetColor)
  }, [targetColor])

  // ── Geniş dağılım: tüm Canvas'ı kaplar ─────────────────────────────────────
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      arr[i3]     = (Math.random() - 0.5) * 10    // X : [-5, 5]
      arr[i3 + 1] = (Math.random() - 0.5) * 10    // Y : [-5, 5]
      arr[i3 + 2] = Math.random() * Z_SPAN + Z_MIN // Z : [-5, 1]
    }
    return arr
  }, [])

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uColor: { value: new THREE.Color(targetColor) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,   // üst üste binen parçacıklar PARLAR
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onMove = (e) => {
      mouseTarget.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_state, delta) => {
    material.uniforms.uTime.value  += delta
    material.uniforms.uMouse.value.lerp(mouseTarget.current, delta * 3)
    material.uniforms.uColor.value.lerp(targetColorRef.current, delta * 1.2)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <primitive object={material} attach="material" />
    </points>
  )
}
