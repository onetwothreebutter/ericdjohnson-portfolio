"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";
import { scrollState } from "@/lib/scrollState";

export function LenisProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis();
        let rafId: number;

        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        lenis.on("scroll", (e: { progress: number }) => {
            scrollState.progress = e.progress;
        });

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return <>{children}</>;
}
