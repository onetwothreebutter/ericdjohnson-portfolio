import Image from "next/image";
import { DesktopMenu } from "@/components/layout/Menu";
import HomepageImageShader from "@/components/home/HomepageImageShader";

export default function Home() {
  return (
    <div className="relative h-[200vh]">
      {/* Sticky hero — pins to top while user scrolls through the reveal */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/homepage/eric-and-elwood-2.jpg"
            alt="Eric and Elwood"
            fill
            className="object-cover object-center"
            priority
          />
          <HomepageImageShader />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full">
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <h1 className="text-5xl md:text-7xl font-brandon text-black mb-4">
              Eric Johnson
            </h1>
            <div className="text-xl md:text-2xl font-brandon text-gray-800 mb-8">
              Web&nbsp;Developer & Vanquisher of Boring Websites
            </div>

            <DesktopMenu />
          </div>
        </div>
      </div>
    </div>
  );
}
