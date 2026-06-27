import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// ── 1. Parçacık sayısı artırıldı (boyut küçülünce doluluk için) ────────────────
const PARTICLE_COUNT = 40_000

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

  // ── İki katmanlı organik dalgalanma ─────────────────────────────────────────
  float nx  = noise(vec3(pos.x * 1.1 + t,       pos.y * 1.1,       pos.z * 0.9));
  float ny  = noise(vec3(pos.y * 1.1,       pos.z * 1.1 + t,       pos.x * 1.1));
  float nz  = noise(vec3(pos.z * 0.9 + t * 0.4, pos.x * 1.1,       pos.y * 1.1));
  float nx2 = noise(vec3(pos.x * 2.5 + t * 1.8, pos.y * 2.5, pos.z * 1.8));
  float ny2 = noise(vec3(pos.y * 2.5, pos.z * 2.5 + t * 1.8, pos.x * 2.5));

  pos.x += nx * 0.20 + nx2 * 0.04;
  pos.y += ny * 0.20 + ny2 * 0.04;
  pos.z += nz * 0.10;

  // ── 3. Yumuşak dalga bükülmesi — sert delik yok ─────────────────────────────
  // Gaussian zarf: merkezde yoğun, dışa doğru yavaşça söner — keskin kenar yok
  vec2  mouseWorld = uMouse * 2.0;
  vec2  toMouse    = pos.xy - mouseWorld;
  float mDist      = length(toMouse);

  // Gaussian yumuşak zarf (hard smoothstep yerine)
  float waveEnv = exp(-mDist * mDist * 2.2);

  // Radyal sine dalgası: parçacıklar sabit itilmek yerine ileri-geri titrer
  // → siyah dairesel delik oluşmaz, organik kıvrılma olur
  float wave = sin(mDist * 9.0 - uTime * 1.8) * waveEnv * 0.09;

  pos.xy += normalize(toMouse + vec2(0.0001)) * wave;

  // ── Derinlik vary ───────────────────────────────────────────────────────────
  vDepth = position.z;

  // ── 2. Küçük nokta boyutu: ~4× küçüldü ────────────────────────────────────
  // Eski: 3.5 * (300 / -z)  →  Yeni: 0.85 * (300 / -z)
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize    = clamp(0.85 * (300.0 / -mvPosition.z), 0.2, 2.0);
  gl_Position     = projectionMatrix * mvPosition;
}
`

// ─── Fragment Shader ────────────────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
varying float vDepth;

void main() {
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);

  // Soft circle — küçük noktalarda daha sert kenar daha güzel durur
  float edge = 1.0 - smoothstep(0.3, 0.5, dist);
  float glow = exp(-dist * dist * 20.0) * 0.45;
  float alpha = clamp(edge + glow, 0.0, 1.0);

  // Derinlik renk gradyanı: uzak → buz mavisi, yakın → beyaz
  float t      = clamp((vDepth + 4.0) / 5.0, 0.0, 1.0);
  vec3  farCol  = vec3(0.878, 0.949, 0.996);  // #e0f2fe
  vec3  nearCol = vec3(1.0,   1.0,   1.0  );
  vec3  color   = mix(farCol, nearCol, t);

  gl_FragColor = vec4(color, alpha * 0.82);
}
`

// ───────────────────────────────────────────────────────────────────────────────
export default function ParticleCloud() {
  const pointsRef   = useRef()
  const mouseTarget = useRef(new THREE.Vector2(0, 0))

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      arr[i3]     = (Math.random() - 0.5) * 4   // X : [-2, 2]
      arr[i3 + 1] = (Math.random() - 0.5) * 4   // Y : [-2, 2]
      arr[i3 + 2] = Math.random() * -5 + 1       // Z : [-4, 1]
    }
    return arr
  }, [])

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), [])

  useEffect(() => {
    const onMove = (e) => {
      mouseTarget.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseTarget.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_state, delta) => {
    material.uniforms.uTime.value += delta
    material.uniforms.uMouse.value.lerp(mouseTarget.current, delta * 3)
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
