"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DesktopMenu } from "./Menu";

export default function Header() {
    const pathname = usePathname();

    // Don't show header on homepage
    if (pathname === "/") return null;

    return (
        <header className="w-full py-4">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-2xl font-brandon text-black no-underline">
                    Eric Johnson
                </Link>
                <DesktopMenu />
            </div>
        </header>
    );
}
