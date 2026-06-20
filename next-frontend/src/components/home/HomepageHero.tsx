"use client";

import Image from "next/image";
import { useState } from "react";
import HomepageImageShader from "./HomepageImageShader";

export function HomepageHero() {
    const [shaderReady, setShaderReady] = useState(false);

    return (
        <div className="absolute inset-0 -z-10 bg-black">
            <div
                className="absolute inset-0 transition-opacity duration-[2500ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
                style={{ opacity: shaderReady ? 1 : 0 }}
            >
                <Image
                    src="/images/homepage/eric-and-elwood-2.jpg"
                    alt="Eric and Elwood"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <HomepageImageShader onReady={() => setShaderReady(true)} />
            </div>
        </div>
    );
}
