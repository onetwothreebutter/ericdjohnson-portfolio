import { HomepageHero } from "@/components/home/HomepageHero";
import { HeroCard } from "@/components/home/HeroCard";

export default function Home() {
  return (
    <div className="h-[200vh]">
      <HomepageHero />
      <div className="fixed top-0 left-0 right-0 h-[100svh] z-10 flex flex-col items-center justify-center px-4">
        <HeroCard />
      </div>
    </div>
  );
}
