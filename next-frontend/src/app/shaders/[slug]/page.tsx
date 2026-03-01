'use client';

import { ShaderCanvas } from '@/components/shaders/ShaderCanvas';
import { ExampleShader } from '@/components/shaders/ExampleShader';
import { PowerfulTriangle } from '@/components/shaders/PowerfulTriangle';
import { SDFLine } from '@/components/shaders/SDFLine';
import { ImaginaryShader } from '@/components/shaders/ImaginaryShader';
import { VerticalLines } from '@/components/shaders/VerticalLines';
import { FractalLikeV2 } from '@/components/shaders/FractalLikeV2';
import { FractalLikeV1 } from '@/components/shaders/FractalLikeV1';
import { FractalLikeV3 } from '@/components/shaders/FractalLikeV3';
import { FractalLikeV4 } from '@/components/shaders/FractalLikeV4';
import { FractalLikeV5 } from '@/components/shaders/FractalLikeV5';
import { FractalLikeV6 } from '@/components/shaders/FractalLikeV6';
import { KaleidoscopeFractal } from '@/components/shaders/KaleidoscopeFractal';
import { Noise } from '@/components/shaders/Noise';
import { NoiseV2 } from '@/components/shaders/NoiseV2';
import { RayMarching } from '@/components/shaders/RayMarching';
import { RayMarching2 } from '@/components/shaders/RayMarching2';
import { GaussianSplat } from '@/components/shaders/GaussianSplat';
import { DripGrid } from '@/components/shaders/DripGrid';
import { RiseShirt } from '@/components/shaders/RiseShirt';
import { RiseShirtText } from '@/components/shaders/RiseShirtText';
import { BlankShader } from '@/components/shaders/BlankShader';
import { NumberDot } from '@/components/shaders/NumberDot';
import { LineCircle } from '@/components/shaders/LineCircle';


import { notFound } from 'next/navigation';
import React from 'react';

export default function ShaderPage({ params }: { params: { slug: string } }) {
    // Unwrapping params using React.use() as recommended for Next.js 15+ or just handling it if it's already resolved in this version context.
    // Ideally in Next.js 13+ app dir, params is a prop. In newer versions it might be a promise.
    // For safety in modern Next, we can assume it's available or await it if it's a server component, but this is 'use client'.
    // Wait, 'use client' components receive params as props directly in recent versions, but sometimes it's better to pass it from a server parent.
    // Actually, for simplicity in 'use client' page, Next.js passes params.

    const { slug } = React.use(params as any) as { slug: string };

    let ShaderComponent;

    switch (slug) {
        case 'powerful-triangle':
            ShaderComponent = PowerfulTriangle;
            break;
        case 'sdf-line':
            ShaderComponent = SDFLine;
            break;
        case 'example':
            ShaderComponent = ExampleShader;
            break;
        case 'imaginary':
            ShaderComponent = ImaginaryShader;
            break;
        case 'vertical-lines':
            ShaderComponent = VerticalLines;
            break;
        case 'fractal-like-v2':
            ShaderComponent = FractalLikeV2;
            break;
        case 'fractal-like-v1':
            ShaderComponent = FractalLikeV1;
            break;
        case 'fractal-like-v3':
            ShaderComponent = FractalLikeV3;
            break;
        case 'fractal-like-v4':
            ShaderComponent = FractalLikeV4;
            break;
        case 'fractal-like-v5':
            ShaderComponent = FractalLikeV5;
            break;
        case 'fractal-like-v6':
            ShaderComponent = FractalLikeV6;
            break;
        case 'kaleidoscope-fractal':
            ShaderComponent = KaleidoscopeFractal;
            break;
        case 'noise':
            ShaderComponent = Noise;
            break;
        case 'noise-v2':
            ShaderComponent = NoiseV2;
            break;
        case 'ray-marching':
            ShaderComponent = RayMarching;
            break;
        case 'ray-marching-2':
            ShaderComponent = RayMarching2;
            break;
        case 'gaussian-splat':
            ShaderComponent = GaussianSplat;
            break;
        case 'drip-grid':
            ShaderComponent = DripGrid;
            break;
        case 'rise-shirt':
            ShaderComponent = RiseShirt;
            break;
        case 'rise-shirt-text':
            ShaderComponent = RiseShirtText;
            break;
        case 'blank-shader':
            ShaderComponent = BlankShader;
            break;
        case 'number-dot':
            ShaderComponent = NumberDot;
            break;
        case 'line-circle':
            ShaderComponent = LineCircle;
            break;

        default:
            return notFound();
    }

    return (
        <main className="w-full h-screen bg-black overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 text-white mix-blend-difference">
                <h1 className="text-2xl font-bold">{slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</h1>
                <a href="/shaders" className="text-sm opacity-70 hover:opacity-100 transition-opacity">← Back to Gallery</a>
            </div>
            <ShaderCanvas>
                <ShaderComponent />
            </ShaderCanvas>
        </main>
    );
}
