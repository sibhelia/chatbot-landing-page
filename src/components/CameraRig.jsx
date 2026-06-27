import { useFrame } from '@react-three/fiber'

/**
 * CameraRig
 * Canvas içine konulur — kameraya sinüs bazlı sinematik salınım verir.
 * Z sabit kalır (Scene'deki position: [0,0,2]), sadece X ve Y yavaşça döner.
 */
export default function CameraRig() {
  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime
    camera.position.x = Math.sin(t * 0.18) * 0.25
    camera.position.y = Math.sin(t * 0.12) * 0.12
    camera.lookAt(0, 0, 0)
  })
  return null
}
