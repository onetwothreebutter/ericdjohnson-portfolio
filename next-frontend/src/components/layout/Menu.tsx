"use client";

import Link from "next/link";
import type React from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const menuItems = [
    { href: "/work-ive-done", label: "Work", sub: "i've done", mobileLabel: "Work" },
    { href: "/how-i-work", label: "How", sub: "i work", mobileLabel: "How" },
    { href: "/who-i-am", label: "Who", sub: "i am", mobileLabel: "Bio" },
    { href: "/contact-me", label: "Contact", sub: "me", mobileLabel: "Contact" },
];

export function DesktopMenu({ className, linkStyle }: { className?: string; linkStyle?: React.CSSProperties }) {
    return (
        <nav className={clsx("hidden md:flex justify-center items-center h-[60px] font-brandon", className)}>
            {menuItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className="group relative flex flex-col items-center justify-center ml-[50px] text-brand-red no-underline first:ml-0"
                    style={linkStyle}
                >
                    <span className="absolute left-[-20px] top-[3px] text-[30px] font-light opacity-0 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-[5px]">
                        (
                    </span>
                    <span className="text-lg uppercase">{item.label}</span>
                    <span className="text-[10px] uppercase transition-opacity duration-300 group-hover:opacity-100">
                        {item.sub}
                    </span>
                    <span className="absolute right-[-20px] top-[3px] text-[30px] font-light opacity-0 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:-translate-x-[5px]">
                        )
                    </span>
                </Link>
            ))}
        </nav>
    );
}

export function MobileMenu() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-[#f1f1f1] md:hidden z-50 font-brandon">
            <nav className="flex justify-around py-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                            "flex flex-col items-center text-brand-red",
                            pathname === item.href && "font-bold"
                        )}
                    >
                        <span className="text-sm uppercase block md:hidden">{item.mobileLabel}</span>
                        <span className="text-sm uppercase hidden md:block">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    );
}
