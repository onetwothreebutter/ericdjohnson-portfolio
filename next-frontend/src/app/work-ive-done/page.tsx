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
                        name="Michal Grosicki"
                        imageUrl="http://unsplash.com/@groosheck"
                    />
                </div>
            </section>

            {/* Work Tiles */}
            <div className="max-w-3xl mx-auto px-6 space-y-12 pt-20">
                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Shopify Editions</h2>
                    <p className="text-gray-700 leading-relaxed">
                        The work I&apos;m most proud of is helping create and build the Shopify Editions websites. I&apos;ve worked on most of them and they&apos;re always headspinning, imagination-stretching, feats of engineering.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Here&apos;s my favorites:
                    </p>
                </section>

                <section className="mb-12 border-l-4 border-brand-red pl-6 py-1">
                    <h3 className="mb-2 text-2xl font-brandon">Shopify Winter &apos;24 Edition &mdash; &ldquo;Foundations&rdquo;</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I led development of the 3D hero for Shopify&apos;s Winter &apos;24 Edition, working closely with a 3D designer to bring an abstract architectural model from Cinema 4D into React Three Fiber.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        A key challenge was matching the final WebGL scene to the designer&apos;s rendered visuals. To preserve the exact color and material treatment, we baked the texture and used Three.js MeshBasicMaterial, allowing the model to display consistently without being affected by scene lighting.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I also built a custom camera-path visualizer using Catmull-Rom curves, which gave us a way to fine-tune the camera animation as it moved around the structure. For accessibility, I layered semantic HTML over the 3D scene, ensuring the hero content remained readable and navigable outside the canvas.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        Finally, I crafted the transition from the hero into the first content section using GSAP. The most complex part was synchronizing the 3D scene&apos;s rotation with the incoming HTML animation, then adapting that choreography across responsive breakpoints.
                    </p>
                </section>

                <section className="mb-12 border-l-4 border-brand-red pl-6 py-1">
                    <h3 className="mb-2 text-2xl font-brandon">Shopify Winter &apos;25 Edition &mdash; &ldquo;The Boring Edition&rdquo;</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I led development of Boring TV, a 3D easter egg for Shopify&apos;s Winter &apos;25 Edition: an interactive retro television featuring 188 AI-generated videos about Shopify&apos;s latest product releases.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The TV screen used a Three.js render target, which allowed us to layer in custom CRT-style shader effects, including screen curvature, scanline treatment, and static when switching channels.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        I built the in-scene TV interface with React Three Fiber&apos;s <code>Text</code> component, using dynamically generated SDF text for crisp typography inside the 3D environment. We also added a 3D remote control with fully functioning buttons. I implemented the remote&apos;s press interactions with React Spring, which paired well with React Three Fiber for smooth, interruptible animation states.
                    </p>
                </section>

                <section className="mb-12 border-l-4 border-brand-red pl-6 py-1">
                    <h3 className="mb-2 text-2xl font-brandon">Shopify Editions &mdash; Record Albums Index Page</h3>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I was one of two lead developers on the Shopify Editions Record Albums index page, a 3D record-store-inspired experience that served as an archive for past Shopify Editions.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The scene combined baked and dynamic rendering techniques: the shelves used a baked 3D texture for visual fidelity and performance, while the individual albums used dynamic shadows to respond naturally within the space. Fine-tuning those shadows was one of the harder challenges, especially balancing softness, quality, and frame rate. In a future iteration, I&apos;d explore texture projection as a more performant approach for the album shadows.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        We also worked through a complex rendering challenge around blur. Our initial goal was to use Three.js&apos;s default render path on load, then switch to a custom post-processing pass only when blur was needed. That switch introduced a subtle but persistent color shift between rendering paths. After extensive debugging, including inspecting compiled shaders with Safari&apos;s shader debugger, we chose to use the custom post-processing pipeline consistently across the experience.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        The out-of-the-box React Three Fiber blur effect caused FPS issues, so we implemented a custom golden-ratio blur shader instead. This gave us precise control over the blur parameters, improved performance, and helped us closely match the original Cinema 4D renders.
                    </p>
                </section>
            </div>
        </div>
    );
}
