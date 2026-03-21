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
                <Link href="/shaders/gaussian-splat" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Gaussian Splat
                </Link>
                <Link href="/shaders/drip-grid" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Drip Grid
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
                <Link href="/shaders/fractal-like" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Fractal Like
                </Link>
                <Link href="/shaders/kaleidoscope-fractal" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Kaleidoscope Fractal
                </Link>
                <Link href="/shaders/rise-shirt" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Rise Shirt
                </Link>
                <Link href="/shaders/rise-shirt-text" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Rise Shirt Text
                </Link>
                <Link href="/shaders/blank-shader" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Blank Shader
                </Link>
                <Link href="/shaders/line-circle" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Line Circle
                </Link>
                <Link href="/shaders/three-square" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Three Square
                </Link>
                <Link href="/shaders/stacked-gradient" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Stacked Gradient
                </Link>
                <Link href="/shaders/letter-grid" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Letter Grid
                </Link>
                <Link href="/shaders/apollonian-gasket" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Apollonian Gasket
                </Link>
                <Link href="/shaders/sdf-packing" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    SDF Packing
                </Link>
                <Link href="/shaders/echo-text" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Echo Text
                </Link>
                <Link href="/shaders/four-shapes" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Four Shapes
                </Link>
                <Link href="/shaders/scaling-letters" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Scaling Letters
                </Link>
                <Link href="/shaders/line-text" className="text-white opacity-70 hover:opacity-100 transition-opacity">
                    Line Text
                </Link>
            </div>

            <ShaderGallery />
        </main>
    );
}
