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

const EMOJI = '🔥';

type Edge = 'top' | 'right' | 'bottom' | 'left';

interface Particle {
    emoji: string;
    edge: Edge;
    ox: number;
    oy: number;
    startX: string;
    startY: string;
    endX: string;  // 80% peek-out end translate
    endY: string;
    orderIndex: number;
    delay: number;
    duration: number;
    size: number;
    id: number;
}

let particleCounter = 0;

function generateParticles(card: HTMLElement): Particle[] {
    return [{
        emoji: EMOJI,
        edge: 'top',
        ox: card.offsetWidth / 2,
        oy: 0,
        startX: '-50%', startY: '0%',
        endX: '-50%',   endY: '-80%',
        orderIndex: 0,
        delay: 0,
        duration: 0.55,
        size: 5,
        id: particleCounter++,
    }];
}

export function HeroCard() {
    const [progress, setProgress] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const hasGenerated = useRef(false);
    const rafRef = useRef<number>(0);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const tick = () => {
            const next = Math.min(scrollState.scrollY / (window.innerHeight * 0.2), 1);
            setProgress(prev => (prev !== next ? next : prev));

            if (!hasGenerated.current && scrollState.progress >= 0.85 && cardRef.current) {
                hasGenerated.current = true;
                setParticles(generateParticles(cardRef.current));
            }

            const shouldReveal = scrollState.progress >= 0.85;
            setIsRevealed(prev => prev !== shouldReveal ? shouldReveal : prev);

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
        filter: 'drop-shadow(0px 4px 24px rgba(0,0,0,0.5))',
    };

    const h1Color = lerpRgb(255, 255, 255, 0, 0, 0, t);
    const subtitleColor = lerpRgb(255, 255, 255, 31, 41, 55, t);
    const linkColor = lerpRgb(255, 255, 255, 205, 98, 88, t);

    const n = particles.length;

    return (
        <div className="relative max-w-2xl w-full">
            {particles.map(p => {
                const animName = isRevealed ? 'emoji-peek' : 'emoji-peek-out';
                const delay = isRevealed ? p.delay : (n - 1 - p.orderIndex) * 0.035;
                return (
                    <span
                        key={p.id}
                        className="absolute pointer-events-none select-none"
                        style={{
                            left: p.ox,
                            top: p.oy,
                            fontSize: `${p.size}rem`,
                            lineHeight: 1,
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                            animation: `${animName} ${p.duration}s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s both`,
                            ['--peek-sx' as string]: p.startX,
                            ['--peek-sy' as string]: p.startY,
                            ['--peek-ex' as string]: p.endX,
                            ['--peek-ey' as string]: p.endY,
                        }}
                    >
                        {p.emoji}
                    </span>
                );
            })}
            <div
                ref={cardRef}
                className="relative text-center p-4 backdrop-blur-sm rounded-xl shadow-2xl w-full"
                style={containerStyle}
            >
                <h1 className="text-4xl md:text-7xl font-brandon mb-4" style={{ color: h1Color }}>
                    Eric Johnson
                </h1>
                <div className="text-xl md:text-2xl font-brandon mb-[10px] md:mb-8" style={{ color: subtitleColor }}>
                    Web&nbsp;Developer &amp; Vanquisher of Boring Websites
                </div>
                <DesktopMenu linkStyle={{ color: linkColor }} />
            </div>
        </div>
    );
}
