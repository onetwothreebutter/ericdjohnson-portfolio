import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import Image from "next/image";

export default function WhatImLookingForPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Banner */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
                <Image
                    src="/images/what-im-looking-for/ray-hennessy-233399.jpg"
                    alt="Goals Banner"
                    fill
                    className="object-cover object-[center_top]"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white">
                    <AnimatedHeading
                        text="What I'm Looking For"
                        className="text-5xl md:text-7xl mb-4"
                    />
                    <PhotoCredit
                        name="Ray Hennessy"
                        imageUrl="http://unsplash.com/@rayhennessy"
                    />
                </div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 space-y-12">
                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Motion Design</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I love implementing motion designs on the web and imagining ways in
                        which a static design can be animated. Motion is fundamental to how
                        people understand the physical environment around them.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        I&apos;m passionate getting motion design right and I get great
                        satisfaction tweaking easing curves until the UI animation feels as
                        natural possible. I&apos;m looking for opportunities to work with people
                        who are as excited about motion as I am.
                    </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Pixel Perfection</h2>
                    <p className="text-gray-700 leading-relaxed">
                        I have a great design eye and I love figuring out what CSS and media
                        queries I need to bring a designer&apos;s vision to life. Spacing issues
                        are a big deal to me. I want to work with people who are passionate
                        about making stunning designs so I can build stunning web experiences.
                    </p>
                </section>

                <hr className="border-gray-200" />

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">
                        A User-Centered Universe
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                        I&apos;m happiest and most productive when I&apos;m working on user-facing
                        interfaces or trying to improve a design for the user.
                    </p>
                </section>
            </div>
        </div>
    );
}
