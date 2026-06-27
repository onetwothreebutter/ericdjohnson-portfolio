"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import HomepageImageShader from "./HomepageImageShader";

export function HomepageHero() {
    const [shaderReady, setShaderReady] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 10) setHasScrolled(true);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="fixed inset-0 -z-10 bg-black">
            <div
                className="absolute inset-0 transition-opacity duration-[2500ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
                style={{ opacity: shaderReady ? 1 : 0 }}
            >
                <Image
                    src="/images/homepage/eric-and-elwood-2.jpg"
                    alt="Eric and Elwood"
                    fill
                    className="object-cover object-[20%_center] md:object-center md:object-cover"
                    priority
                />
                <HomepageImageShader onReady={() => setShaderReady(true)} />
            </div>

            <div
                className="absolute bottom-[20%] md:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white select-none pointer-events-none transition-opacity duration-700"
                style={{ opacity: shaderReady && !hasScrolled ? 1 : 0 }}
            >
                <div className="absolute inset-0 -z-10 scale-[2.5] rounded-full" style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.75) 0%, transparent 70%)" }} />
                <span className="text-4xl font-brandon tracking-[0.2em] uppercase">Scroll</span>
                <svg width="50" height="50" viewBox="0 0 20 20" fill="none" className="animate-bounce">
                    <path d="M10 3v14M4 11l6 6 6-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}
