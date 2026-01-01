'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Torus, Octahedron, Dodecahedron, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Shape({ geometry: Geometry, ...props }: any) {
  const ref = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x += 0.005
      ref.current.rotation.y += 0.005
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Geometry ref={ref} {...props}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          chromaticAberration={0.1}
          anisotropy={0.1}
          distortion={0.1}
          distortionScale={0.1}
          temporalDistortion={0.1}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color={props.color || "white"}
        />
      </Geometry>
    </Float>
  )
}

export default function FloatingShapes() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [0, 0, 10], fov: 45 }}>
        <ambientLight intensity={1} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#00ffff" />
        
        <Shape geometry={Torus} args={[0.8, 0.2, 16, 32]} position={[-4, 2, 0]} color="#00e5ff" />
        <Shape geometry={Octahedron} args={[1]} position={[4, -2, -2]} color="#ff00ff" />
        <Shape geometry={Dodecahedron} args={[0.8]} position={[-3, -3, 0]} color="#7000ff" />
        <Shape geometry={Torus} args={[0.5, 0.1, 16, 32]} position={[3, 3, 0]} color="#F3BA2F" />
      </Canvas>
    </div>
  )
}
