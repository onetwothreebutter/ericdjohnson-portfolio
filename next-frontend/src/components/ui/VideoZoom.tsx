"use client";

import { useState } from "react";

interface VideoZoomProps {
    mp4: string;
    webm?: string;
    className?: string;
}

export default function VideoZoom({ mp4, webm, className }: VideoZoomProps) {
    const [zoomed, setZoomed] = useState(false);

    return (
        <video
            autoPlay
            muted
            loop
            playsInline
            onClick={() => setZoomed((z) => !z)}
            className={className}
            style={{
                cursor: "zoom-in",
                transform: zoomed ? "scale(1.5)" : "scale(1)",
                filter: zoomed ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" : "none",
                transformOrigin: "center center",
                transition: "transform 0.3s ease",
                ...(zoomed && { cursor: "zoom-out" }),
            }}
        >
            {webm && <source src={webm} type="video/webm" />}
            <source src={mp4} type="video/mp4" />
        </video>
    );
}
