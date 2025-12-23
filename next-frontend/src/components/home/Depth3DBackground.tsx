import React, { useRef, useMemo } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { shaderMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Create a custom ShaderMaterial
const DepthMaterial = shaderMaterial(
    {
        uImage: null,
        uDepthMap: null,
        uMouse: new THREE.Vector2(0, 0),
        uIntensity: 0.02,
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform sampler2D uImage;
    uniform sampler2D uDepthMap;
    uniform vec2 uMouse;
    uniform float uIntensity;
    varying vec2 vUv;

    void main() {
      vec4 depthDistortion = texture2D(uDepthMap, vUv);
      float parallaxMult = depthDistortion.r;

      vec2 parallax = (uMouse) * parallaxMult * uIntensity;

      vec2 uv = vUv + parallax;
      
      gl_FragColor = texture2D(uImage, uv);
    }
  `
);

extend({ DepthMaterial });

// Add type definition for the custom material
declare module '@react-three/fiber' {
    interface ThreeElements {
        depthMaterial: any;
    }
}

interface Depth3DBackgroundProps {
    imageSrc?: string;
    depthMapSrc?: string;
    intensity?: number;
}

export default function Depth3DBackground({
    imageSrc = "https://images.unsplash.com/photo-1518744962963-4ce499af7e9d?w=1920&q=80", // Placeholder
    depthMapSrc = "https://github.com/pmndrs/drei-assets/blob/master/depth-map/depth.jpg?raw=true", // Placeholder (random depth map just for init if not provided)
    intensity = 0.02
}: Depth3DBackgroundProps) {
    const meshRef = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<any>(null!);
    const { viewport } = useThree();

    // Load textures
    const [image, depth] = useTexture([imageSrc, depthMapSrc]);

    // Keep aspect ratio correct for the plane
    // A standard way is to cover the viewport
    // For a full background, we often want the plane to fill the screen.

    useFrame((state) => {
        if (materialRef.current) {
            // Smoothly interpolate mouse movement
            materialRef.current.uMouse.lerp(state.mouse, 0.1);
        }
    });

    return (
        <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]} position={[0, 0, -5]}>
            <planeGeometry args={[1, 1]} />

            <depthMaterial
                ref={materialRef}
                uImage={image}
                uDepthMap={depth}
                uIntensity={intensity}
                transparent
            />
        </mesh>
    );
}
