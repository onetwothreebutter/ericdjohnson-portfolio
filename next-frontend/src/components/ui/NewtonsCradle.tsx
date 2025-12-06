"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function NewtonsCradle() {
    const leftBallRef = useRef<SVGGElement>(null);
    const rightBallRef = useRef<SVGGElement>(null);

    useEffect(() => {
        const tl = gsap.timeline({ repeat: -1 });
        const leftBall = leftBallRef.current;
        const rightBall = rightBallRef.current;

        if (leftBall && rightBall) {
            tl.fromTo(
                leftBall,
                { rotation: 15, transformOrigin: "top center" },
                { rotation: 0, duration: 0.25, ease: "power4.in" }
            )
                .to(
                    rightBall,
                    {
                        rotation: -15,
                        transformOrigin: "top center",
                        duration: 0.25,
                        ease: "power4.out",
                    }
                )
                .to(rightBall, { rotation: 0, duration: 0.25, ease: "power4.in" })
                .to(leftBall, { rotation: 15, duration: 0.25, ease: "power4.out" });
        }

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <svg
            id="newtons-cradle"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 142 100"
            className="w-full h-full"
            role="img"
            aria-label="Newton's Cradle animation"
        >
            <g id="holder">
                <line
                    x1="2"
                    y1="2"
                    x2="140"
                    y2="2"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
                <line
                    x1="111"
                    y1="2"
                    x2="111"
                    y2="100"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
                <line
                    x1="31"
                    y1="2"
                    x2="31"
                    y2="100"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                />
            </g>

            {/* Left Ball */}
            <g id="left-ball" ref={leftBallRef}>
                <line
                    x1="31"
                    y1="2"
                    x2="31"
                    y2="75"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <circle cx="31" cy="75" r="10" fill="#cd6258" />
            </g>

            {/* Middle Balls */}
            <g id="middle-balls">
                <line
                    x1="51"
                    y1="2"
                    x2="51"
                    y2="75"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <circle cx="51" cy="75" r="10" fill="#cd6258" />
                <line
                    x1="71"
                    y1="2"
                    x2="71"
                    y2="75"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <circle cx="71" cy="75" r="10" fill="#cd6258" />
                <line
                    x1="91"
                    y1="2"
                    x2="91"
                    y2="75"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <circle cx="91" cy="75" r="10" fill="#cd6258" />
            </g>

            {/* Right Ball */}
            <g id="right-ball" ref={rightBallRef}>
                <line
                    x1="111"
                    y1="2"
                    x2="111"
                    y2="75"
                    fill="none"
                    stroke="#cd6258"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                />
                <circle cx="111" cy="75" r="10" fill="#cd6258" />
            </g>
        </svg>
    );
}

