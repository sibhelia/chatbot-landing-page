import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 60_000

// ─── Vertex Shader ─────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2  uMouse;
uniform float uExplosion;   // 0→1 anlık patlama, JS'de decay ile 0'a iner

varying float vDepth;
varying float vExplosion;

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

  // ── Organik dalgalanma — patlama sırasında genlik fırlar ──────────────────
  float explodeAmp = 1.0 + uExplosion * 5.5;  // patlama genliği

  float nx  = noise(vec3(pos.x * 1.1 + t,        pos.y * 1.1,        pos.z * 0.9));
  float ny  = noise(vec3(pos.y * 1.1,        pos.z * 1.1 + t,        pos.x * 1.1));
  float nz  = noise(vec3(pos.z * 0.9 + t * 0.4,  pos.x * 1.1,        pos.y * 1.1));
  float nx2 = noise(vec3(pos.x * 2.5 + t * 1.8,  pos.y * 2.5,        pos.z * 1.8));
  float ny2 = noise(vec3(pos.y * 2.5,        pos.z * 2.5 + t * 1.8,  pos.x * 2.5));

  pos.x += (nx * 0.20 + nx2 * 0.04) * explodeAmp;
  pos.y += (ny * 0.20 + ny2 * 0.04) * explodeAmp;
  pos.z += nz * 0.10 * explodeAmp;

  // ── Z tünel akışı ─────────────────────────────────────────────────────────
  float zAnimated = mod(position.z + 5.0 + uTime * 0.12, 6.0) - 5.0;
  pos.z = zAnimated + nz * 0.08 * explodeAmp;

  // ── Fare sine dalgası ──────────────────────────────────────────────────────
  vec2  mouseWorld = uMouse * 2.5;
  vec2  toMouse    = pos.xy - mouseWorld;
  float mDist      = length(toMouse);
  float waveEnv    = exp(-mDist * mDist * 1.8);
  float wave       = sin(mDist * 9.0 - uTime * 1.8) * waveEnv * 0.09;
  pos.xy += normalize(toMouse + vec2(0.0001)) * wave;

  vDepth     = pos.z;
  vExplosion = uExplosion;

  vec4  mvPosition = modelViewMatrix * vec4(pos, 1.0);
  float dist       = max(-mvPosition.z, 0.1);
  gl_PointSize = clamp(5.5 / dist, 0.15, 3.8);
  gl_Position  = projectionMatrix * mvPosition;
}
`

// ─── Fragment Shader ────────────────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
uniform vec3 uColor;

varying float vDepth;
varying float vExplosion;

void main() {
  vec2  uv   = gl_PointCoord - 0.5;
  float dist = length(uv);

  float edge  = 1.0 - smoothstep(0.3, 0.5, dist);
  float glow  = exp(-dist * dist * 20.0) * 0.45;
  float alpha = clamp(edge + glow, 0.0, 1.0);

  float t      = clamp((vDepth + 5.0) / 6.0, 0.0, 1.0);
  vec3  farCol  = uColor * 0.55;
  vec3  nearCol = mix(uColor, vec3(1.0), 0.30);
  vec3  color   = mix(farCol, nearCol, t);

  // Patlama anında parçacıklar hafif parlar (AdditiveBlending etkisini artırır)
  float brightness = 1.0 + vExplosion * 0.35;
  gl_FragColor = vec4(color * brightness, alpha * 0.80);
}
`

// ───────────────────────────────────────────────────────────────────────────────
export default function ParticleCloud({ targetColor = '#e0f2fe', explosionRef }) {
  const pointsRef      = useRef()
  const mouseTarget    = useRef(new THREE.Vector2(0, 0))
  const targetColorRef = useRef(new THREE.Color(targetColor))
  const mouseVelocity  = useRef(0)   // fare hız skalar değeri

  useEffect(() => {
    targetColorRef.current.set(targetColor)
  }, [targetColor])

  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3
      arr[i3]     = (Math.random() - 0.5) * 10    // X : [-5, 5]
      arr[i3 + 1] = (Math.random() - 0.5) * 10    // Y : [-5, 5]
      arr[i3 + 2] = Math.random() * 6 - 5          // Z : [-5, 1]
    }
    return arr
  }, [])

  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime:      { value: 0 },
      uMouse:     { value: new THREE.Vector2(0, 0) },
      uColor:     { value: new THREE.Color(targetColor) },
      uExplosion: { value: 0 },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  // Fare takibi — hız hesapla
  useEffect(() => {
    const onMove = (e) => {
      const nx =  (e.clientX / window.innerWidth)  * 2 - 1
      const ny = -((e.clientY / window.innerHeight) * 2 - 1)
      const dx = nx - mouseTarget.current.x
      const dy = ny - mouseTarget.current.y
      // Anlık hızı al, cap ile sınırla
      mouseVelocity.current = Math.min(Math.sqrt(dx * dx + dy * dy) * 18, 2.5)
      mouseTarget.current.set(nx, ny)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useFrame((_state, delta) => {
    // Zaman ilerlet
    material.uniforms.uTime.value  += delta
    material.uniforms.uMouse.value.lerp(mouseTarget.current, delta * 3)
    material.uniforms.uColor.value.lerp(targetColorRef.current, delta * 1.2)

    // Patlama decay: ~1 saniyede 0'a iner
    if (explosionRef) {
      explosionRef.current = Math.max(0, explosionRef.current - delta * 1.1)
      material.uniforms.uExplosion.value = explosionRef.current
    }

    // Parçacık bulutu döndür — fare hareket edince hızlanır, durunca yavaşlar
    if (pointsRef.current) {
      const baseY = 0.028
      const baseX = 0.012
      pointsRef.current.rotation.y += delta * (baseY + mouseVelocity.current * 0.055)
      pointsRef.current.rotation.x += delta * (baseX + mouseVelocity.current * 0.018)
      // Hız söndürme
      mouseVelocity.current *= 0.90
    }
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
