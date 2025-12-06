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
                    alt="Who I Am Banner"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white">
                    <AnimatedHeading
                        text="Who I Am"
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
                        I’m a creative, good-humored guy who loves art, rural living, and joking around.
                        I live on a small pick-your-own blueberry farm in Iowa with my wife, daughter,
                        and two llamas (Jake and Elwood).

                        [Photo of blueberry farm/llamas]
                    </p>
                </section>

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Rural Nerd</h2>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        I grew up on a corn and soybean farm in southeast Iowa, where I balanced
                        farm responsibilities like driving tractors and baling hay with a growing
                        fascination for technology. I loved tinkering with our family's
                        first computer and installing sound cards and RAM. One of my most memorable gifts was a
                        SoundBlaster sound card, which solidified my status as a dedicated
                        "rural nerd".

                        [THIS NEEDS WORK OR DELETION]
                    </p>
                    <div className="relative h-64 md:h-96 w-full rounded-xl overflow-hidden shadow-lg">
                        <Image
                            src="/images/who-i-am/rural-nerd.jpg"
                            alt="Rural Nerd"
                            fill
                            className="object-cover"
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Open-minded</h2>
                    <p className="text-gray-700 leading-relaxed">
                        I embrace adaptability and am always willing to adjust my perspective when
                        presented with compelling evidence. I view being wrong as an opportunity to
                        learn, and I believe that progress comes from having the courage to voice
                        ideas rather than staying silent.
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
