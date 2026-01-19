import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import WorkTile from "@/components/features/WorkTile";
import NewtonsCradle from "@/components/ui/NewtonsCradle";
import Image from "next/image";

export default function WorkIveDonePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Banner */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/work-ive-done/michal-grosicki-221225.jpg"
                    alt="Work Banner"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white">
                    <AnimatedHeading
                        text="Work I've Done"
                        className="text-5xl md:text-7xl mb-4"
                    />
                    <PhotoCredit
                        name="Michał Grosicki"
                        imageUrl="http://unsplash.com/@groosheck"
                    />
                </div>
            </section>

            {/* Work Tiles */}
            <div className="max-w-3xl mx-auto px-6 space-y-12 pt-20">
                <section>

                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Shopify Editions</h2>
                    <p className="text-gray-700 leading-relaxed">
                        The work I’m most proud of is helping create and build the Shopify Editions websites. I’ve worked on most of them and they’re always headspinning, imagination-stretching, feats of engineering.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Here's my favorites:
                    </p>
                </section>

                <section className="mb-12">
                    <h3 className="mb-2 text-2xl">Shopify Winter '24 Edition</h3>
                    <p className="text-gray-700 leading-relaxed">
                        I was the lead developer for the 3d hero. I worked closely with a 3d designer to implement the 3d model of the “building” in React Three Fiber. The biggest challenge was matching the look and feel of the colors in the renders from Cinema4d. Additionally, I used HTML on top of the 3d scene for accessibility (although I ran into bugs with browser zoom, I would probably put the content in the 3d scene if I were to build it again). I built a custom camera path visualizer using catmullrom curves so we could fine-tune animation of the camera as it pans around to the side of the “building”
                    </p><p>
                        To get perfect color matching with the designer's renders from Cinema4d, we baked the texture and used a MeshBasicMaterial in ThreeJS so it wouldn’t respond to lighting in the scene.
                    </p><p>
                        I also crafted the hero to first section transition using the battle-tested GreenSock animation library. The biggest challenge was getting the rotation of the 3d scene to line up with the HTML animating in to the page, and then making that work responsively 😅

                    </p>
                </section>
                <section className="mb-12">
                    <h3 className="mb-2 text-2xl">Shopify Winter ’25 Edition (aka “The Boring Edition”)
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                        I was the lead developer for the 3d easter egg called “Boring TV”, which was a 3d model of an old TV that featured 188 AI generated videos/channels about Shopify’s latest releases. The TV screen was a render target so we could apply a CRT TV screen shader effect and a static effect when the channels were changed.

                        The TV UI was done using React Three Fiber’s <code>Text</code> component which dynamically creates SDFs for each letter of a font file. We also included a 3d remote control for the TV with functioning buttons. I implemented the remote’s interactivity (the raise/lower animation) using React Spring which pairs really nicely with React Three Fiber to make interruptible animations.


                    </p>
                </section>
                <section className="mb-12">
                    <h3 className="mb-2 text-2xl">Shopify Editions Record Albums Index Page

                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                        I was one of two main developers on this project. We created a music record album store to act as an index page for the Shopify Editions. The shelves are a 3d model with a baked texture, while the albums use dynamic shadows.

                        The dynamic album shadows were difficult to get to have the softness we wanted while also having them be performant. If I were to build this again, I would try a texture projection for the album shadows.

                        Another big challenge was to try and take advantage of ThreeJS’s default rendering when the album store loads and then switch to a custom post processing pass for the blur effect (this was a performance optimization). We consistently ran into a color shift when switching between the two rendering pathways. We took advantage of Safari’s shader debugger that allows you to see the compiled shader and really drilled down and tried many different debugging steps but couldn’t resolve the color shift. In the end we ended up using the custom post processing pass for all rendering.

                        We attempted to use an out-of-the-box blur effect from React Three Fiber but it was causing low FPS, so we implemented our own blur shader using the golden ratio blur. This allowed us to dial in the blur parameters to match the Cinema4d renders.


                    </p>
                </section>
            </div>
        </div >
    );
}
