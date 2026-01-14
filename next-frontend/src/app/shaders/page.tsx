import { ShaderGallery } from '@/components/shaders/ShaderGallery';
import Link from 'next/link';

export default function ShadersPage() {
    return (
        <main className="w-full h-screen bg-black overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 text-white mix-blend-difference pointer-events-none">
                <h1 className="text-2xl font-bold">WebGPU Shader Gallery</h1>
                <p className="opacity-70">Experiments with TSL (Three.js Shading Language)</p>
            </div>

            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 text-right">
                <Link href="/shaders/powerful-triangle" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Powerful Triangle
                </Link>
                <Link href="/shaders/sdf-line" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    SDF Line
                </Link>
                <Link href="/shaders/example" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Example Shader
                </Link>
                <Link href="/shaders/imaginary" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Imaginary
                </Link>
                <Link href="/shaders/vertical-lines" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Vertical Lines
                </Link>
            </div>

            <ShaderGallery />
        </main>
    );
}
