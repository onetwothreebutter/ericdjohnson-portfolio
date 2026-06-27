"use client";

import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import ContentCube from "./ContentCube";
import { Environment } from "@react-three/drei";
import Depth3DBackground from "./Depth3DBackground";
import { VerticalLines } from "../shaders/VerticalLines";
import { SceneGradient } from "./SceneGradient";
import { WebGPURenderer } from 'three/webgpu';

export default function HomeScene() {
    const [frameloop, setFrameloop] = useState<'never' | 'always'>('never');
    const [isRotating, setIsRotating] = useState(false);

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
                    <SceneGradient position={[0, 0, -0.9]} />
                    <VerticalLines position={[0, 0, -1]} speedBoost={isRotating} />
                </React.Suspense>
                {/* Environment for nice reflections on the colored materials */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
