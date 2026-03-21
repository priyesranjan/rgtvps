"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows, PresentationControls } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

// The 3D Premium Gold object
function GoldVault() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[2, 0]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
        />
      </mesh>
    </Float>
  );
}

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen pt-32 pb-20 lg:pt-24 lg:pb-0 overflow-hidden lg:flex lg:items-center">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-gold-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Content Area */}
        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-surface/50 border border-gold-500/20 backdrop-blur-sm shrink-0">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
              <span className="text-sm font-medium text-text-secondary">Institutional-Grade Security</span>
            </div>

            {/* Client Trust Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-bg-surface/50 border border-gold-500/20 backdrop-blur-sm">
              <div className="flex -space-x-2 shrink-0">
                <div className="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-[10px] font-bold text-white border-2 border-bg-app">JD</div>
                <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-bg-app">VK</div>
                <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center text-[10px] font-bold text-white border-2 border-bg-app">SK</div>
              </div>
              <span className="text-sm font-medium text-text-secondary">
                Trusted by <span className="text-text-primary font-semibold">500+ Clients in Patna</span>
              </span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold font-heading leading-tight"
          >
            The Ultimate <br />
            <span className="text-gradient-gold">Digital Vault</span> <br />
            For Your Wealth.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-lg leading-relaxed"
          >
            Participate directly in physical gold. Earn steady, reliable returns with zero market hassle, backed by tangible assets in our secure facilities.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 pt-4"
          >
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-base">
                Start Earning <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/about" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-base">
                How It Works
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right 3D Canvas Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="h-[400px] lg:h-[700px] w-full relative mt-8 lg:mt-0"
        >
          <div className="absolute inset-0 bg-gold-500/5 rounded-full blur-3xl" />
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} intensity={2} angle={0.15} penumbra={1} color="#FFF5D1" />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#4A90E2" />
            
            <PresentationControls
              global
              rotation={[0, 0.3, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.4, Math.PI / 2]}
            >
              <GoldVault />
            </PresentationControls>

            <Environment preset="city" />
            <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2} far={4} color="#D4AF37" />
          </Canvas>
        </motion.div>
      </div>
    </section>
  );
}


