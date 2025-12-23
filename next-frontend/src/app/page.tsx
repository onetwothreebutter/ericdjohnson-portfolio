import Image from "next/image";
import HomeScene from "@/components/home/HomeScene";
import { DesktopMenu } from "@/components/layout/Menu";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Top Menu */}
      <div className="absolute top-0 left-0 w-full z-20 p-8 flex justify-center">
        <DesktopMenu />
      </div>

      {/* Background Image - Keep this for atmosphere */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/homepage/eric-and-elwood-2.jpg"
          alt="Eric and Elwood"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay/Gradient */}
        <div className="absolute inset-0 bg-gray-500/20 mix-blend-multiply" />
      </div>

      {/* R3F Scene */}
      <HomeScene />
    </div>
  );
}
