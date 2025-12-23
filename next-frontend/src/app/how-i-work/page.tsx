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
                    <p className="text-gray-700 leading-relaxed">
                        I love collaborating with designers, trying new things with AI, and experimenting with new creative coding ideas.
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Pairing</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        Pairing on a screen sharing app (Tuple is my preferred) really helps cut down the communication barrier
                        and get a problem solved quickly with understanding and input from both sides, whether it be a dev issue
                        or a question of a design implementation.

                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">AI</h2>
                    <p className="text-gray-700 leading-relaxed">
                        I use Cursor (both the chat and the autocomplete) and Claude Code.
                        I try new models when they’re released but so far Claude Sonnet/Opus
                        are my main gotos. I use both few-shot prompts to build something a bit
                        bigger (ie, a new component) or focused questions/prompts to address
                        bugs. I’ve started a prompt library so I can keep track of what
                        prompts work well, and so I can try them out to evaluate new models.

                        Lately, I’ve been experimenting with AI agents to build features, and
                        I've refactored this website using Google Antigravity.

                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Artistic</h2>
                    <p className="text-gray-700 leading-relaxed">
                        I love visual art and design. I enjoy creating unique and engaging visual
                        experiences for both the web and other mediums. My hobby business is
                        designing concrete sculptures and other art pieces using Blender and my
                        Elegoo 3D printer.
                    </p>
                </section>
            </div>
        </div>
    );
}
