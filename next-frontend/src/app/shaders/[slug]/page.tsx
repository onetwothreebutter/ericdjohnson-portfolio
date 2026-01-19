'use client';

import { ShaderCanvas } from '@/components/shaders/ShaderCanvas';
import { ExampleShader } from '@/components/shaders/ExampleShader';
import { PowerfulTriangle } from '@/components/shaders/PowerfulTriangle';
import { SDFLine } from '@/components/shaders/SDFLine';
import { ImaginaryShader } from '@/components/shaders/ImaginaryShader';
import { VerticalLines } from '@/components/shaders/VerticalLines';
import { FractalLike } from '@/components/shaders/FractalLike';
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
        case 'fractal-like':
            ShaderComponent = FractalLike;
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
