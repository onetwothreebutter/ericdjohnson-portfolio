'use client';

import { Canvas } from '@react-three/fiber';
import { WebGPURenderer } from 'three/webgpu';
import { Suspense, useState, ReactNode } from 'react';

interface ShaderCanvasProps {
    children: ReactNode;
    cameraPosition?: [number, number, number];
}

export function ShaderCanvas({ children, cameraPosition = [0, 0, 5] }: ShaderCanvasProps) {
    const [frameloop, setFrameloop] = useState<'never' | 'always'>('never');
    const [error, setError] = useState<string | null>(null);

    return (
        <div className="w-full h-full relative">
            {error && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 text-white">
                    <div className="max-w-md p-6 bg-red-900/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-2 text-red-500">WebGPU Not Supported</h2>
                        <p className="mb-4 text-sm opacity-80">{error}</p>
                        <p className="text-xs opacity-50">
                            Please try a browser with WebGPU support (e.g., Chrome 113+).
                            If you are developing, you can try enabling "Unsafe WebGPU" flags.
                        </p>
                    </div>
                </div>
            )}
            <Canvas
                frameloop={frameloop}
                camera={{ position: cameraPosition }}
                gl={(config) => {
                    const canvas = config.canvas as unknown as HTMLCanvasElement;
                    const renderer = new WebGPURenderer({ canvas: canvas, antialias: true, alpha: true, forceWebGL: false });
                    renderer.init().then(() => {
                        setFrameloop('always');
                    }).catch((err) => {
                        console.error('ShaderCanvas: WebGPURenderer init failed', err);
                        setError(err.message || 'Failed to initialize WebGPURenderer');
                    });
                    return renderer;
                }}
            >
                <Suspense fallback={null}>
                    <color attach="background" args={['#111']} />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />
                    {children}
                </Suspense>
            </Canvas>
        </div>
    );
}
