"use client";

import Link from "next/link";
import clsx from "clsx";
import React from "react";

interface WorkTileProps {
    link: string;
    heading: string;
    description: string;
    svg?: React.ReactNode;
}

export default function WorkTile({ link, heading, description, svg }: WorkTileProps) {
    const href = `/work-ive-done/${link}`;

    return (
        <Link
            href={href}
            className={clsx(
                "group relative flex flex-col items-center justify-center p-8 text-center transition-all duration-300 hover:bg-gray-50",
                "border-b border-r border-gray-200 last:border-r-0",
                "w-full md:w-1/2 lg:w-1/3 h-[300px]"
            )}
        >
            <div className="mb-6 w-24 h-24 flex items-center justify-center text-brand-red">
                {svg ? (
                    svg
                ) : (
                    // Placeholder icon if no SVG provided
                    <div className="w-16 h-16 bg-gray-200 rounded-full" />
                )}
            </div>
            <div className="relative z-10">
                <h2 className="text-2xl font-brandon font-bold mb-2 text-gray-800 group-hover:text-brand-red transition-colors">
                    {heading}
                </h2>
                <p className="text-sm text-gray-600 font-sans">{description}</p>
            </div>
        </Link>
    );
}
