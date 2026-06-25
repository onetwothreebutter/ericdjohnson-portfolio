"use client";

import { useEffect, useRef, useState } from "react";

interface VideoZoomProps {
    mp4: string;
    webm?: string;
    className?: string;
    showAudioToggle?: boolean;
    mobileScale?: number;
}

const SCALE = 1.5;
const PAN_STEP = 80;

export default function VideoZoom({ mp4, webm, className, showAudioToggle, mobileScale }: VideoZoomProps) {
    const [zoomed, setZoomed] = useState(false);
    const [panX, setPanX] = useState(0);
    const [muted, setMuted] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) videoRef.current.muted = muted;
    }, [muted]);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        setIsMobile(mq.matches);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        if (!zoomed) return;
        const close = (e: MouseEvent) => {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setZoomed(false);
                setPanX(0);
            }
        };
        document.addEventListener("click", close);
        return () => document.removeEventListener("click", close);
    }, [zoomed]);

    const handleZoomToggle = () => {
        setZoomed((z) => {
            if (z) setPanX(0);
            return !z;
        });
    };

    const pan = (dir: -1 | 1) => {
        if (!wrapperRef.current) return;
        const maxPan = (wrapperRef.current.clientWidth * (SCALE - 1)) / 2;
        setPanX((prev) => Math.max(-maxPan, Math.min(maxPan, prev + dir * PAN_STEP)));
    };

    const effectiveScale = isMobile && mobileScale != null ? mobileScale : SCALE;
    const showPanArrows = zoomed && !showAudioToggle;
    const showControls = showAudioToggle || showPanArrows;

    return (
        <div ref={rootRef} className={`block ${className ?? ""}`}>
            {/* Video — transformed independently so controls stay in place */}
            <div
                ref={wrapperRef}
                style={{
                    transform: zoomed ? `translateX(${panX}px) scale(${effectiveScale})` : "scale(1)",
                    filter: zoomed ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" : "none",
                    transformOrigin: "center center",
                    transition: "transform 0.3s ease, filter 0.3s ease",
                }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    onClick={handleZoomToggle}
                    className="w-full rounded-lg block"
                    style={{ cursor: zoomed ? "zoom-out" : "zoom-in" }}
                >
                    {webm && <source src={webm} type="video/webm" />}
                    <source src={mp4} type="video/mp4" />
                </video>
            </div>

            {/* Controls row — sits below the video, unaffected by transform */}
            {showControls && (
                <div className="flex items-center justify-center gap-3 mt-2">
                    {showPanArrows && (
                        <button
                            onClick={() => pan(-1)}
                            aria-label="Pan left"
                            className="md:hidden bg-black/50 hover:bg-black/75 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}

                    {showAudioToggle && (
                        <button
                            onClick={() => setMuted((m) => !m)}
                            aria-label={muted ? "Unmute video" : "Mute video"}
                            className="bg-black/50 hover:bg-black/75 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
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
                    )}

                    {showPanArrows && (
                        <button
                            onClick={() => pan(1)}
                            aria-label="Pan right"
                            className="md:hidden bg-black/50 hover:bg-black/75 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors backdrop-blur-sm cursor-pointer"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
