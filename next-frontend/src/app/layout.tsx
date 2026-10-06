import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/Menu";
import { LenisProvider } from "@/components/layout/LenisProvider";

const brandon = localFont({
  src: [
    {
      path: "../fonts/brandonprinted-one-webfont.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-brandon",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ericdjohnson.net"),
  title: {
    default: "Eric Johnson | Design Engineer",
    template: "%s | Eric Johnson",
  },
  description: "Design engineer who designs and builds interactive, WebGL-heavy web experiences.",
  openGraph: {
    title: "Eric Johnson | Design Engineer",
    description: "Design engineer who designs and builds interactive, WebGL-heavy web experiences.",
    url: "https://www.ericdjohnson.net",
    siteName: "Eric Johnson Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eric Johnson | Design Engineer",
    description: "Design engineer who designs and builds interactive, WebGL-heavy web experiences.",
    creator: "@ericdjohnson", // Assuming handle, can be updated
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${brandon.variable} font-sans`}>
        <LenisProvider>
          <div className="page-wrapper min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow pb-16 md:pb-0">{children}</main>
            <MobileMenu />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
