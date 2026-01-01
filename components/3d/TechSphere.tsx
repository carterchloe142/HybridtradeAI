'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Float } from '@react-three/drei'
import * as THREE from 'three'

function ParticleSphere(props: any) {
  const ref = useRef<any>()
  
  // Generate particles on a sphere surface
  const { positions, colors } = useMemo(() => {
    const count = 3000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const colorA = new THREE.Color('#00e5ff') // Neon Cyan
    const colorB = new THREE.Color('#d946ef') // Neon Fuchsia
    const colorC = new THREE.Color('#F3BA2F') // Crypto Gold
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)
      const r = 1.5 + (Math.random() * 0.1) // Radius with slight surface variation
      
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      
      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z
      
      // Randomly pick one of the 3 colors
      const rand = Math.random()
      let color
      if (rand < 0.33) color = colorA
      else if (rand < 0.66) color = colorB
      else color = colorC
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta / 10
      ref.current.rotation.z += delta / 20
    }
  })

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} colors={colors} stride={3} {...props}>
        <PointMaterial
          transparent
          vertexColors
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  )
}

function ConnectingLines() {
    const ref = useRef<any>()
    
    useFrame((state) => {
        if(ref.current) {
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.1
        }
    })

    return (
        <group ref={ref}>
            <mesh>
                <icosahedronGeometry args={[1.4, 1]} />
                <meshBasicMaterial wireframe color="#4f46e5" transparent opacity={0.1} />
            </mesh>
            <mesh>
                <icosahedronGeometry args={[1.2, 1]} />
                <meshBasicMaterial wireframe color="#06b6d4" transparent opacity={0.05} />
            </mesh>
        </group>
    )
}

export default function TechSphere() {
  return (
    <div className="w-full h-full relative min-h-[400px]">
       <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }} gl={{ alpha: true, antialias: true }}>
          <ambientLight intensity={0.5} />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <ParticleSphere />
            <ConnectingLines />
          </Float>
       </Canvas>
    </div>
  )
}
