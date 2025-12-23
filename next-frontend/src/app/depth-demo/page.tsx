"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import Depth3DBackground from "@/components/home/Depth3DBackground";

export default function DepthDemoPage() {
    return (
        <div className="w-full h-screen bg-black">
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <React.Suspense fallback={null}>
                    <Depth3DBackground
                        imageSrc="/images/homepage/eric-shopify-summit-2025.JPG"
                        depthMapSrc="/images/homepage/eric-shopify-summit-2025--depth-map.png"
                        intensity={0.05}
                    />
                </React.Suspense>
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
