import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "@/components/layout/Header";
import { MobileMenu } from "@/components/layout/Menu";

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
  metadataBase: new URL("https://ericdjohnson.com"),
  title: {
    default: "Eric Johnson | Web Developer",
    template: "%s | Eric Johnson",
  },
  description: "Eric Johnson's portfolio of web animations, code, and other skills.",
  openGraph: {
    title: "Eric Johnson | Web Developer",
    description: "Eric Johnson's portfolio of web animations, code, and other skills.",
    url: "https://ericdjohnson.com",
    siteName: "Eric Johnson Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eric Johnson | Web Developer",
    description: "Eric Johnson's portfolio of web animations, code, and other skills.",
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
        <div className="page-wrapper min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow pb-16 md:pb-0">{children}</main>
          <MobileMenu />
        </div>
      </body>
    </html>
  );
}
