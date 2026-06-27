"use client";

import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { scrollState } from "@/lib/scrollState";

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * Math.min(Math.max(t, 0), 1);
}

function lerpRgb(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, t: number) {
    return `rgb(${Math.round(lerp(r1, r2, t))}, ${Math.round(lerp(g1, g2, t))}, ${Math.round(lerp(b1, b2, t))})`;
}

const menuItems = [
    { href: "/work-ive-done", label: "Work", sub: "i've done", mobileLabel: "Work" },
    { href: "/how-i-work", label: "How", sub: "i work", mobileLabel: "How" },
    { href: "/who-i-am", label: "Who", sub: "i am", mobileLabel: "Bio" },
    { href: "/contact-me", label: "Contact", sub: "me", mobileLabel: "Contact" },
];

export function DesktopMenu({ className, linkStyle }: { className?: string; linkStyle?: React.CSSProperties }) {
    return (
        <nav className={clsx("hidden md:flex justify-center items-center h-[60px] font-brandon", className)}>
            {menuItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex flex-col items-center justify-center ml-[50px] text-brand-red no-underline first:ml-0"
                    style={linkStyle}
                >
                    <span className="absolute left-[-20px] top-[3px] text-[30px] font-light opacity-0 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-[5px]">
                        (
                    </span>
                    <span className="text-lg uppercase">{item.label}</span>
                    <span className="text-[10px] uppercase transition-opacity duration-300 group-hover:opacity-100">
                        {item.sub}
                    </span>
                    <span className="absolute right-[-20px] top-[3px] text-[30px] font-light opacity-0 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:-translate-x-[5px]">
                        )
                    </span>
                </Link>
            ))}
        </nav>
    );
}

export function MobileMenu() {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [progress, setProgress] = useState(isHome ? 0 : 1);
    const rafRef = useRef<number>(0);

    useEffect(() => {
        if (!isHome) { setProgress(1); return; }
        const tick = () => {
            const next = Math.min(scrollState.scrollY / (window.innerHeight * 0.2), 1);
            setProgress(prev => (prev !== next ? next : prev));
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [isHome]);

    const t = progress;
    const bgVal = Math.round(lerp(0, 255, t));
    const bgAlpha = lerp(0.85, 1, t);
    const borderAlpha = lerp(0, 1, t);
    const linkColor = lerpRgb(255, 255, 255, 205, 98, 88, t);

    return (
        <div
            className="fixed bottom-0 left-0 w-full md:hidden z-50 font-brandon"
            style={{
                background: `rgba(${bgVal}, ${bgVal}, ${bgVal}, ${bgAlpha})`,
                borderTop: `1px solid rgba(241, 241, 241, ${borderAlpha})`,
            }}
        >
            <nav className="flex justify-around py-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center",
                            pathname === item.href && "font-bold"
                        )}
                        style={{ color: linkColor }}
                    >
                        <span className="text-sm uppercase block md:hidden">{item.mobileLabel}</span>
                        <span className="text-sm uppercase hidden md:block">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
