import { HomepageHero } from "@/components/home/HomepageHero";
import { HeroCard } from "@/components/home/HeroCard";

export default function Home() {
  return (
    <div className="relative h-[200vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <HomepageHero />

        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          <HeroCard />
        </div>
      </div>
    </div>
  );
}
