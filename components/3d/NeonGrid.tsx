'use client'

import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Plane, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function MovingGrid() {
  const mesh = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (mesh.current) {
        // Move texture or position to simulate infinite scroll
        // Simple approach: move the mesh and reset
        mesh.current.position.z = (state.clock.elapsedTime * 0.5) % 1
    }
  })

  return (
    <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -1, 0]}>
      <gridHelper args={[20, 40, 0xff00ff, 0x00ffff]} position={[0, 0, 0]} />
      <gridHelper args={[20, 40, 0xff00ff, 0x00ffff]} position={[0, 0, -20]} />
    </group>
  )
}

function RetroGrid() {
    const gridRef = useRef<any>()
    
    useFrame((state) => {
        if(gridRef.current) {
            gridRef.current.position.z = (state.clock.elapsedTime * 2) % 2
        }
    })

    return (
        <group rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -1, 0]}>
            <group ref={gridRef}>
                <gridHelper args={[30, 30, 0xff00ff, 0x00e5ff]} position={[0, 0, 0]} />
                <gridHelper args={[30, 30, 0xff00ff, 0x00e5ff]} position={[0, 0, -30]} />
            </group>
             <Plane args={[30, 30]} rotation={[-Math.PI/2, 0, 0]} position={[0, -0.1, -15]}>
                <meshBasicMaterial color="#050A18" opacity={0.9} transparent />
            </Plane>
        </group>
    )
}

export default function NeonGrid() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
      <Canvas gl={{ alpha: true, antialias: true }}>
        <PerspectiveCamera makeDefault position={[0, 1, 3]} fov={75} />
        <fog attach="fog" args={['#050A18', 2, 15]} />
        <RetroGrid />
      </Canvas>
    </div>
  )
}
