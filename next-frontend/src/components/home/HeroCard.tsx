"use client";

import { useState, useEffect, useRef } from "react";
import { DesktopMenu } from "@/components/layout/Menu";
import { scrollState } from "@/lib/scrollState";

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function lerpRgb(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number) {
    return `rgb(${Math.round(lerp(r1, r2, t))}, ${Math.round(lerp(g1, g2, t))}, ${Math.round(lerp(b1, b2, t))})`;
}

export function HeroCard() {
    const [progress, setProgress] = useState(0);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const tick = () => {
            const next = Math.min(scrollState.scrollY / (window.innerHeight * 0.2), 1);
            setProgress(prev => (prev !== next ? next : prev));
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const t = progress;

    const bgVal = Math.round(lerp(0, 255, t));
    const bgAlpha = lerp(1, 0.8, t);
    const borderAlpha = lerp(1, 0, t);

    const containerStyle = {
        background: `rgba(${bgVal}, ${bgVal}, ${bgVal}, ${bgAlpha})`,
        border: `3px solid rgba(255, 255, 255, ${borderAlpha})`,
    };

    // white → black
    const h1Color = lerpRgb(255, 255, 255, 0, 0, 0, t);
    // white → gray-800 (#1f2937)
    const subtitleColor = lerpRgb(255, 255, 255, 31, 41, 55, t);
    // white → brand-red (#CD6258)
    const linkColor = lerpRgb(255, 255, 255, 205, 98, 88, t);

    return (
        <div
            className="text-center p-4 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full mx-4"
            style={containerStyle}
        >
            <h1 className="text-5xl md:text-7xl font-brandon mb-4" style={{ color: h1Color }}>
                Eric Johnson
            </h1>
            <div className="text-xl md:text-2xl font-brandon mb-8" style={{ color: subtitleColor }}>
                Web&nbsp;Developer &amp; Vanquisher of Boring Websites
            </div>
            <DesktopMenu linkStyle={{ color: linkColor }} />
        </div>
    );
}
