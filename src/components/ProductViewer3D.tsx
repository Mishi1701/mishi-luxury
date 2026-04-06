import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PresentationControls } from "@react-three/drei";
import * as THREE from "three";

const DiamondRing = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group>
      {/* Ring band */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusGeometry args={[1, 0.15, 32, 100]} />
        <meshStandardMaterial
          color="#F3E5AB"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>
      {/* Diamond */}
      <mesh position={[0, 1.05, 0]}>
        <octahedronGeometry args={[0.35, 2]} />
        <meshPhysicalMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0}
          transmission={0.9}
          thickness={0.5}
          ior={2.42}
          clearcoat={1}
          clearcoatRoughness={0}
        />
      </mesh>
      {/* Prong settings */}
      {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(angle) * 0.2,
            0.7,
            Math.sin(angle) * 0.2,
          ]}
        >
          <cylinderGeometry args={[0.02, 0.03, 0.5, 8]} />
          <meshStandardMaterial color="#F3E5AB" metalness={0.95} roughness={0.05} />
        </mesh>
      ))}
    </group>
  );
};

interface ProductViewer3DProps {
  className?: string;
}

const ProductViewer3D = ({ className = "" }: ProductViewer3DProps) => {
  return (
    <div className={`w-full aspect-square rounded-lg overflow-hidden bg-gradient-to-b from-lavender/20 to-background ${className}`}>
      <Canvas
        camera={{ position: [0, 2, 5], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={0.3} />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#F3E5AB" />
          
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, -Math.PI / 6, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <DiamondRing />
          </PresentationControls>
          
          <ContactShadows position={[0, -1.2, 0]} opacity={0.3} scale={5} blur={2} />
          <Environment preset="studio" />
          <OrbitControls enableZoom enablePan={false} minDistance={3} maxDistance={8} />
        </Suspense>
      </Canvas>
      <div className="text-center -mt-10 relative z-10">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Drag to rotate • Scroll to zoom
        </p>
      </div>
    </div>
  );
};

export default ProductViewer3D;
