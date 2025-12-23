"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import ContentCube from "./ContentCube";
import { Environment } from "@react-three/drei";
import Depth3DBackground from "./Depth3DBackground";

export default function HomeScene() {
    return (
        <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <React.Suspense fallback={null}>
                    {/* <Depth3DBackground
                        imageSrc="/images/homepage/eric-shopify-summit-2025.JPG"
                        depthMapSrc="/images/homepage/eric-shopify-summit-2025--depth-map.png"
                        intensity={0.05}
                    /> */}
                    <ContentCube />
                </React.Suspense>
                {/* Environment for nice reflections on the colored materials */}
                <Environment preset="city" />
            </Canvas>
        </div>
    );
}
