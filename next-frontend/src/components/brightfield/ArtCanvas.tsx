"use client";

import { useEffect, useRef } from "react";
import { drawSquareDance, type SquareDanceOptions } from "./art";

type ArtCanvasProps = {
    className?: string;
    label?: string;
} & { kind: "square-dance" } & Partial<SquareDanceOptions>;

/** Canvas that redraws one of the Brightfield stand-in artworks whenever it resizes. */
export default function ArtCanvas(props: ArtCanvasProps) {
    const ref = useRef<HTMLCanvasElement>(null);
    const { kind, className, label } = props;
    const width = props.kind === "square-dance" ? props.width ?? 0 : 0;
    const gap = props.kind === "square-dance" ? props.gap ?? 0 : 0;
    const distress = props.kind === "square-dance" ? !!props.distress : false;
    const crosshatch = props.kind === "square-dance" ? !!props.crosshatch : false;
    const halftone = props.kind === "square-dance" ? !!props.halftone : false;
    const lift = props.kind === "square-dance" ? props.lift ?? 0 : 0;

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const draw = () => drawSquareDance(canvas, { width, gap, distress, crosshatch, halftone, lift });
        draw();
        const observer = new ResizeObserver(draw);
        observer.observe(canvas);
        return () => observer.disconnect();
    }, [kind, width, gap, distress, crosshatch, halftone, lift]);

    return (
        <canvas
            ref={ref}
            className={className}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
        />
    );
}
