"use client";

import { useEffect, useRef, useState } from "react";

interface VideoZoomProps {
    mp4: string;
    webm?: string;
    className?: string;
    showAudioToggle?: boolean;
}

export default function VideoZoom({ mp4, webm, className, showAudioToggle }: VideoZoomProps) {
    const [zoomed, setZoomed] = useState(false);
    const [muted, setMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = muted;
        }
    }, [muted]);

    if (!showAudioToggle) {
        return (
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                onClick={() => setZoomed((z) => !z)}
                className={className}
                style={{
                    cursor: zoomed ? "zoom-out" : "zoom-in",
                    transform: zoomed ? "scale(1.5)" : "scale(1)",
                    filter: zoomed ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" : "none",
                    transformOrigin: "center center",
                    transition: "transform 0.3s ease",
                }}
            >
                {webm && <source src={webm} type="video/webm" />}
                <source src={mp4} type="video/mp4" />
            </video>
        );
    }

    return (
        <div
            className={`relative block ${className ?? ""}`}
            style={{
                cursor: zoomed ? "zoom-out" : "zoom-in",
                transform: zoomed ? "scale(1.5)" : "scale(1)",
                filter: zoomed ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" : "none",
                transformOrigin: "center center",
                transition: "transform 0.3s ease",
            }}
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                loop
                playsInline
                onClick={() => setZoomed((z) => !z)}
                className="w-full rounded-lg"
            >
                {webm && <source src={webm} type="video/webm" />}
                <source src={mp4} type="video/mp4" />
            </video>
            <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute video" : "Mute video"}
                className="absolute top-1/2 -translate-y-1/2 left-full ml-3 bg-black/50 hover:bg-black/75 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors backdrop-blur-sm"
            >
                {muted ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                )}
            </button>
        </div>
    );
}
