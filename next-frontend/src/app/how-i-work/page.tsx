import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import Image from "next/image";

export default function WhoIAmPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
        <Image
          src="/images/who-i-am/kristopher-roller-188180.jpg"
          alt="How I Work Banner"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white">
          <AnimatedHeading
            text="How I Work"
            className="text-5xl md:text-7xl mb-4"
          />
          <PhotoCredit
            name="Kristopher Roller"
            imageUrl="http://unsplash.com/@krisroller"
          />
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 space-y-12">
        <section>
          <h2 className="text-3xl font-brandon text-brand-red mb-6">Collaborating with Designers</h2>
          <p className="text-gray-700 leading-relaxed">
            In my experience, the best interactive work comes from close collaboration between designers and developers. On Shopify&apos;s Universal Commerce Protocol page, I took a static background grid design, rebuilt it as a WebGL shader, and prototyped an interactive mouse-highlight effect. Designers and stakeholders immediately saw its potential, and I paired with the designer to refine the grid, hover behavior, and visual details into a hero moment that exceeded the original ask.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-brandon text-brand-red mb-6">Creative Coding Prototyping</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            I&apos;m hooked on the depth and possibility of creative coding. I love recreating interesting interaction ideas I see on Dribbble, social media, or in the wild, then pushing them further through experimentation. Some of the best discoveries happen accidentally during iteration.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Debug controls are a core part of my prototyping process. Tools like Leva and lil-gui let me expose shader, motion, and layout variables through sliders, giving designers fine-grained control and making collaboration faster, more playful, and more precise.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-brandon text-brand-red mb-6">AI-Assisted Development</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            I use AI tools heavily in my development workflow, especially Claude Code, Claude Sonnet, and Claude Opus. I try new models as they&apos;re released, but Claude has become my primary coding partner for prototyping, debugging, refactoring, and exploring implementation options.
          </p>
          <p className="text-gray-700 leading-relaxed">
            I&apos;ve also built AI-powered product experiences. For Shopify&apos;s Summer 2026 Edition, I created Plot, a backyard garden-planning app that used AI as part of its core functionality. I have also learned how to write evals and use Braintrust to prevent regressions, compare model behavior, and evaluate prompt changes with more confidence.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-brandon text-brand-red mb-6">Work Ethos</h2>
          <p className="text-gray-700 leading-relaxed">
            I also like to keep work fun. I enjoy joking around, bringing energy to a team, and finding the perfect Slack emoji or GIF to make the day more lively and human. 🫣🫠🤌
          </p>
        </section>
      </div>
    </div>
  );
}
