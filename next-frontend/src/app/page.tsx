import Image from "next/image";
import HomeScene from "@/components/home/HomeScene";
import { DesktopMenu } from "@/components/layout/Menu";
import cn from "classnames";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Top Menu */}
      <div className={cn(
        "absolute top-0 left-0 w-full z-20 p-8 flex justify-center"
      )}>
        <DesktopMenu />
      </div>

      {/* R3F Scene */}
      <HomeScene />
    </div >
  );
}
