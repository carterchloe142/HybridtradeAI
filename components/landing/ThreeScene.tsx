'use client'

import React, { useRef, useState, Suspense, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Float, Html, PresentationControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

function Laptop() {
  const group = useRef<THREE.Group>(null!)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  
  // Basic geometry for a stylized laptop
  // Base: 1.5 width, 0.1 height, 1 depth
  // Screen: 1.5 width, 1 height, 0.05 depth
  
  return (
    <group ref={group} position={[0, -0.5, 0]}>
      {/* Laptop Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.8} />
      </mesh>
      
      {/* Laptop Screen Pivot */}
      <group position={[0, 0.05, -0.8]} rotation={[-0.2, 0, 0]}>
        {/* Screen Frame */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[2.4, 1.6, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.8} />
        </mesh>
        
        {/* Screen Content (The "Live" Part) */}
        <mesh position={[0, 0.8, 0.051]}>
          <planeGeometry args={[2.3, 1.5]} />
          <meshBasicMaterial color="#000" />
          <Html
            transform
            wrapperClass="htmlScreen"
            distanceFactor={1.5}
            position={[0, 0, 0]}
            style={{
              width: '920px',
              height: '600px',
              background: '#0a0e17',
              borderRadius: '8px',
              overflow: 'hidden',
              padding: '20px'
            }}
          >
            <div className="w-full h-full text-white font-sans flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                 <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                 </div>
                 <div className="text-xs text-gray-500">HybridTrade AI Dashboard</div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 h-full">
                {/* Sidebar */}
                <div className="col-span-1 bg-white/5 rounded p-3 flex flex-col gap-2">
                   <div className="h-8 w-full bg-blue-500/20 rounded animate-pulse"></div>
                   <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse"></div>
                   <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse"></div>
                   <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse"></div>
                   <div className="mt-auto h-20 w-full bg-green-500/10 rounded border border-green-500/30 p-2">
                      <div className="text-xs text-green-400">Profit +12.4%</div>
                      <div className="text-lg font-bold text-green-500">$14,204</div>
                   </div>
                </div>
                
                {/* Main Chart Area */}
                <div className="col-span-2 flex flex-col gap-4">
                   <div className="h-1/2 bg-white/5 rounded p-3 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
                      <div className="flex items-end h-full gap-1 justify-between px-2 pb-2">
                          {[40, 60, 45, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                              <div key={i} className="w-full bg-blue-500/50 rounded-t" style={{ height: `${h}%` }}></div>
                          ))}
                      </div>
                   </div>
                   <div className="h-1/2 grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded p-3">
                        <div className="text-xs text-gray-400 mb-2">Active Trades</div>
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs"><span className="text-white">BTC/USD</span> <span className="text-green-400">+2.4%</span></div>
                            <div className="flex justify-between text-xs"><span className="text-white">ETH/USD</span> <span className="text-red-400">-0.8%</span></div>
                            <div className="flex justify-between text-xs"><span className="text-white">SOL/USD</span> <span className="text-green-400">+5.1%</span></div>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded p-3 relative">
                         <div className="absolute inset-2 border-2 border-dashed border-white/10 rounded flex items-center justify-center">
                            <span className="text-xs text-gray-500">AI Analysis Running...</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </Html>
        </mesh>
      </group>
      
      {/* Keyboard Area (Simplified) */}
      <mesh position={[0, 0.055, 0.2]} rotation={[-0.05, 0, 0]}>
         <planeGeometry args={[2.2, 0.8]} />
         <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>
    </group>
  )
}

export default function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }} dpr={[1, 2]}>
      <Suspense fallback={null}>
        <Environment files="/potsdamer_platz_1k.hdr" />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        
        <PresentationControls
          global
          rotation={[0.13, 0.1, 0]}
          polar={[-0.4, 0.2]}
          azimuth={[-1, 0.75]}
          config={{ mass: 2, tension: 400 }}
          snap={{ mass: 4, tension: 400 }}
        >
          <Float rotationIntensity={0.4}>
            <Laptop />
          </Float>
        </PresentationControls>
        <ContactShadows position={[0, -1.4, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Suspense>
    </Canvas>
  )
}
