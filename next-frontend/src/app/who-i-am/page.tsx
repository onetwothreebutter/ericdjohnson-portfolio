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
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I&apos;m a design-minded frontend developer with Iowa roots, a love of visual craft and motion design, and a soft spot for weird, memorable web experiences.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I grew up on a corn, soybean, cow, and pig farm in southeast Iowa. I loved farm life, but I also loved technology. As a kid, I was hooked on using, upgrading, and tinkering with our custom-built computer. That combination still shapes how I work today: practical, curious, resourceful, and always interested in how things are made.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        These days, I live on a small you-pick blueberry farm with two pet llamas. I love the taste of fresh blueberries, the rhythm of rural life, and the joy of being around animals.
                    </p>
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
                        <Image
                            src="/images/skills-i-have/jake-elwood-sunset.JPG"
                            alt="Jake and Elwood, the llamas, at sunset"
                            fill
                            className="object-cover object-center"
                        />
                    </div>
                </section>

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Outside the Job</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        When I&apos;m not working, I like making things with my hands &mdash; or at least with machines that make things with their nozzles. I design and print 3D lamps using Blender and my Elegoo Neptune 4 Max, and I also 3D print molds for casting objects in concrete.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        I&apos;m drawn to projects that combine digital tools with physical materials: printed lamps, concrete objects, strange little sculptures, and anything that lets me experiment with form, texture, and process.
                    </p>
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-6">
                        <Image
                            src="/images/who-i-am/squiggle-lamp-2.jpg"
                            alt="3D printed squiggle lamp"
                            fill
                            className="object-cover object-center"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}
