import Image from "next/image";
import { DesktopMenu } from "@/components/layout/Menu";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/homepage/eric-and-elwood-2.jpg"
          alt="Eric and Elwood"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay/Gradient if needed, original seemed to have gray background color behind it */}
        <div className="absolute inset-0 bg-gray-500/20 mix-blend-multiply" />
      </div>

      <div className="z-10 text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full mx-4">
        <h1 className="text-5xl md:text-7xl font-brandon text-black mb-4">
          Eric Johnson
        </h1>
        <div className="text-xl md:text-2xl font-brandon text-gray-800 mb-8">
          Web&nbsp;Developer & Vanquisher of Boring Websites
        </div>

        <DesktopMenu />
      </div>
    </div>
  );
}
