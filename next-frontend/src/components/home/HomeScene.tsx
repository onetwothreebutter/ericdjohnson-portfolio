"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import ContentCube from "./ContentCube";
import { Environment, MeshTransmissionMaterial, Sphere } from "@react-three/drei";
import Depth3DBackground from "./Depth3DBackground";
import { Noise } from "../shaders/Noise";
import { SceneGradient } from "./SceneGradient";
import { WebGPURenderer } from 'three/webgpu';
import { useControls } from "leva";
import * as THREE from "three";

export default function HomeScene() {
    const [frameloop, setFrameloop] = useState<'never' | 'always'>('never');
    const [isRotating, setIsRotating] = useState(false);

    const config = useControls({
        transmission: { value: 1, min: 0, max: 1 },
        thickness: { value: 0.5, min: 0, max: 5 },
        roughness: { value: 0.2, min: 0, max: 1 },
        chromaticAberration: { value: 0.05, min: 0, max: 1 },
        anisotropy: { value: 0.2, min: 0, max: 1 },
        distortion: { value: 0.2, min: 0, max: 1 },
        distortionScale: { value: 0.2, min: 0, max: 1 },
        temporalDistortion: { value: 0.2, min: 0, max: 1 },
        ior: { value: 1.2, min: 1, max: 2 },
        color: "#fff",
    });

    return (
        <div className="absolute inset-0 z-0">
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                frameloop={frameloop}
                gl={(config) => {
                    const canvas = config.canvas as unknown as HTMLCanvasElement;
                    const renderer = new WebGPURenderer({ canvas: canvas, antialias: true, forceWebGL: false });
                    renderer.init().then(() => {
                        setFrameloop('always');
                    }).catch((err) => {
                        console.error('HomeScene: WebGPURenderer init failed', err);
                    });
                    return renderer;
                }}
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <React.Suspense fallback={null}>
                    <ContentCube
                        onRotationStart={() => {
                            setIsRotating(true);
                            // Reset speed after animation typically finishes (approx 500ms for rotation effect)
                            setTimeout(() => setIsRotating(false), 500);
                        }}
                    />
                    <mesh position={[3, 0, 0]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial color="red" />
                    </mesh>
                    <Sphere args={[1, 32, 32]} position={[0, 0, 2]}>
                        <MeshTransmissionMaterial {...config} />
                    </Sphere>
                    <SceneGradient position={[0, 0, -0.9]} />
                    <Noise
                        position={[0, 0, -1]}
                        noiseType="Turbulence"
                        scale={5.0}
                        lacunarity={2.5}
                        speed={0.2}
                        colorMode="Palette"
                    />
                </React.Suspense>
                {/* Environment for nice reflections on the colored materials */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
