"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import clsx from "clsx";

interface AnimatedHeadingProps {
    text: string;
    className?: string;
}

export default function AnimatedHeading({ text, className }: AnimatedHeadingProps) {
    const containerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const letters = containerRef.current?.querySelectorAll(".letter");
            if (letters) {
                gsap.fromTo(
                    letters,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        stagger: 0.05,
                        ease: "back.out(1.7)",
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Split text into words and characters for granular animation
    const words = text.split(" ");

    return (
        <h1
            ref={containerRef}
            className={clsx("font-brandon font-bold uppercase", className)}
        >
            {words.map((word, wordIndex) => (
                <span key={wordIndex} className="inline-block mr-[0.25em] whitespace-nowrap">
                    {Array.from(word).map((letter, letterIndex) => (
                        <span
                            key={letterIndex}
                            className="letter inline-block"
                        >
                            {letter}
                        </span>
                    ))}
                </span>
            ))}
        </h1>
    );
}
