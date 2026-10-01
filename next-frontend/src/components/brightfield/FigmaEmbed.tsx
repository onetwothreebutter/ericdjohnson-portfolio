"use client";

import { useState } from "react";

/** Figma's embedded viewer, loaded only on request since it pulls in the full Figma app. */
export default function FigmaEmbed({ src, title }: { src: string; title: string }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-[#121111]">
            {loaded ? (
                <iframe src={src} title={title} allowFullScreen className="absolute inset-0 h-full w-full border-0" />
            ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                    <button
                        type="button"
                        onClick={() => setLoaded(true)}
                        className="rounded-md border-2 border-white px-5 py-2 font-brandon uppercase tracking-wide text-white transition-colors hover:bg-white hover:text-[#121111]"
                    >
                        Load the Figma file
                    </button>
                    <p className="text-sm text-gray-400">Opens Figma&apos;s viewer here. Pan and zoom to explore.</p>
                </div>
            )}
        </div>
    );
}
