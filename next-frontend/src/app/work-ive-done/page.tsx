import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import ProjectHeader from "@/components/features/ProjectHeader";
import VideoZoom from "@/components/ui/VideoZoom";
import Image from "next/image";

const projectIndex = [
    {
        heading: "At Shopify",
        projects: [
            { id: "ucp", name: "Universal Commerce Protocol Launch Page" },
            { id: "winter-25", name: "Boring TV" },
            { id: "winter-24", name: "Foundations 3D Hero" },
            { id: "record-albums", name: "Editions Record Albums Archive" },
            { id: "summer-26", name: "Plot" },
        ],
    },
    {
        heading: "Independent",
        projects: [
            { id: "brightfield", name: "Brightfield Studio" },
        ],
    },
];

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

            <div className="max-w-3xl mx-auto px-6 pt-12 pb-20">
                {/* Intro + index */}
                <section className="mb-16">
                    <p className="text-xl text-gray-800 leading-relaxed mb-4">
                        Selected WebGL and interactive work, mostly from Shopify&apos;s brand and launch sites.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-8">
                        The work I&apos;m most proud of is helping create and build the Shopify Editions websites. I&apos;ve worked on most of them and they&apos;re always headspinning, imagination-stretching, feats of engineering.
                    </p>
                    <nav aria-label="Projects on this page" className="grid gap-6 sm:grid-cols-2">
                        {projectIndex.map((group) => (
                            <div key={group.heading}>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{group.heading}</p>
                                <ul className="space-y-1">
                                    {group.projects.map((project) => (
                                        <li key={project.id}>
                                            <a href={`#${project.id}`} className="text-brand-red hover:underline">
                                                {project.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </section>

                <section className="mb-16">
                    <h2 id="at-shopify" className="group text-3xl font-brandon text-brand-red mb-8">
                        At Shopify
                        <a href="#at-shopify" className="ml-2 opacity-0 group-hover:opacity-100 text-brand-red/40 hover:text-brand-red transition-opacity text-2xl">#</a>
                    </h2>

                    <article className="mb-12 md:border-l-4 md:border-brand-red md:pl-6 md:py-1">
                        <ProjectHeader
                            id="ucp"
                            title="Universal Commerce Protocol Launch Page"
                            subtitle="Shopify and Google"
                            role="Sole developer"
                            year="2026"
                            stack="Three.js/WebGL shader, CSS mix-blend-mode"
                            summary="Shopify's public launch page for the Universal Commerce Protocol, built in 2.5 weeks across Winter Break to go live with Sundar Pichai's NRF keynote, with a WebGL hero that still had to perform and work with reduced motion or WebGL disabled."
                            links={[
                                { href: "https://shopify.com/ucp", label: "Live site" },
                                { href: "https://x.com/tobi/status/2010372720035504396?s=20", label: "Shopify's CEO announcing the UCP page launch" },
                            ]}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I was the sole developer for <a href="https://shopify.com/ucp" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Shopify&apos;s launch page</a> announcing the Universal Commerce Protocol, a collaboration between Shopify and Google. The page launched in sync with Google CEO Sundar Pichai&apos;s keynote at the National Retail Federation Conference and served as the primary public artifact for Shopify&apos;s UCP announcement.
                        </p>
                        <VideoZoom
                            mp4="/ucp-interaction.mp4"
                            webm="/ucp-interaction.webm"
                            className="w-full rounded-lg mb-4"
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The project had a compressed 2.5-week timeline split by Winter Break. I owned the build end-to-end, from core implementation to performance and launch coordination. Beyond executing the page, I designed the interactive hero globe grid shader and contributed the line &ldquo;forged from billions of transactions.&rdquo;
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            A major technical challenge was creating an immersive WebGL-driven hero while maintaining performance and accessibility. I paired a pure-black-background video with CSS <code>mix-blend-mode</code> and an async WebGL shader grid, while ensuring the experience still worked with reduced motion enabled and with WebGL disabled. The final page achieved a Lighthouse score of 93.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I also integrated an interactive API widget requested by Ilya Grigorik. Instead of embedding it as an iframe, I imported it natively into the codebase, creating a fast iteration workflow while keeping the page architecture clean and maintainable.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The weekend before launch, I identified that our deployment plan needed to change, coordinated with the dot com platform team, ran an ad-hoc Mission Control launch channel, and shipped the page with zero launch issues.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            The project was highlighted internally as a model for how engineering can partner with design early, prototype quickly, and elevate a launch through thoughtful interaction design. It became one of Shopify&apos;s highest-stakes brand and developer-facing launches of the quarter.
                        </p>
                    </article>

                    <article className="mb-12 md:border-l-4 md:border-brand-red md:pl-6 md:py-1">
                        {/* TODO(eric): confirm the year Boring TV shipped; it isn't stated in the repo, git history, or existing copy. */}
                        <ProjectHeader
                            id="winter-25"
                            title="Boring TV"
                            subtitle="Shopify Winter '25 Edition — “The Boring Edition”"
                            role="Lead developer"
                            stack="Three.js, React Three Fiber, React Spring"
                            summary="An interactive retro TV playing 188 AI-generated videos, where the hard part was making it feel like a real set inside a 3D scene: CRT shader effects on a render target, crisp SDF text, and a working 3D remote."
                            links={[
                                { href: "https://www.shopify.com/editions/winter2025/tv", label: "Live site" },
                                { href: "https://www.creativereview.co.uk/how-to-find-creative-inspiration-in-boring-tech-updates/", label: "Creative Review — How to find creative inspiration in boring tech updates" },
                            ]}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I led development of Boring TV, a 3D easter egg for <a href="https://www.shopify.com/editions/winter2025/tv" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Shopify&apos;s Winter &apos;25 Edition</a>: an interactive retro television featuring 188 AI-generated videos about Shopify&apos;s latest product releases.
                        </p>
                        <VideoZoom
                            mp4="/editions-winter-2025.mp4"
                            webm="/editions-winter-2025.webm"
                            className="w-full rounded-lg mb-4"
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The TV screen used a Three.js render target, which allowed us to layer in custom CRT-style shader effects, including screen curvature, scanline treatment, and static when switching channels.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            I built the in-scene TV interface with React Three Fiber&apos;s <code>Text</code> component, using dynamically generated SDF text for crisp typography inside the 3D environment. We also added a 3D remote control with fully functioning buttons. I implemented the remote&apos;s press interactions with React Spring, which paired well with React Three Fiber for smooth, interruptible animation states.
                        </p>
                    </article>

                    <article className="mb-12 md:border-l-4 md:border-brand-red md:pl-6 md:py-1">
                        <ProjectHeader
                            id="winter-24"
                            title="Foundations 3D Hero"
                            subtitle="Shopify Winter '24 Edition"
                            role="Lead developer"
                            year="2024"
                            stack="React Three Fiber, GSAP, Cinema 4D pipeline"
                            summary="An abstract architectural model brought from Cinema 4D into React Three Fiber, where the hard parts were matching the designer's renders exactly and syncing the 3D rotation with the HTML transition across breakpoints."
                            links={[
                                { href: "https://www.shopify.com/editions/winter2024", label: "Live site" },
                                { href: "https://x.com/tobi/status/1752728111739961375?s=46", label: "Shopify's CEO announcing the Winter '24 Edition" },
                            ]}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I led development of the 3D hero for <a href="http://shopify.com/editions/winter2024" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Shopify&apos;s Winter &apos;24 Edition</a>, working closely with a 3D designer to bring an abstract architectural model from Cinema 4D into React Three Fiber.
                        </p>
                        <VideoZoom
                            mp4="/editions-winter-2024.mp4"
                            webm="/editions-winter-2024.webm"
                            className="w-full rounded-lg mb-4"
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            A key challenge was matching the final WebGL scene to the designer&apos;s rendered visuals. To preserve the exact color and material treatment, we baked the texture and used Three.js MeshBasicMaterial, allowing the model to display consistently without being affected by scene lighting.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I also built a custom camera-path visualizer using Catmull-Rom curves, which gave us a way to fine-tune the camera animation as it moved around the structure. For accessibility, I layered semantic HTML over the 3D scene, ensuring the hero content remained readable and navigable outside the canvas.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Finally, I crafted the transition from the hero into the first content section using GSAP. The most complex part was synchronizing the 3D scene&apos;s rotation with the incoming HTML animation, then adapting that choreography across responsive breakpoints.
                        </p>
                    </article>

                    <article className="mb-12 md:border-l-4 md:border-brand-red md:pl-6 md:py-1">
                        <ProjectHeader
                            id="record-albums"
                            title="Editions Record Albums Archive"
                            subtitle="Shopify Editions"
                            role="Co-lead developer"
                            year="2025"
                            stack="Three.js, React Three Fiber, custom post-processing"
                            summary="A 3D record-store archive of past Shopify Editions, where the hard parts were balancing shadow quality against frame rate and tracking down a color shift between rendering paths."
                            links={[
                                { href: "https://www.shopify.com/editions", label: "Live site" },
                                { href: "https://www.linkedin.com/feed/update/urn:li:activity:7329013366297886720/", label: "LinkedIn post about the Record Albums page" },
                            ]}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I was one of two lead developers on the <a href="https://www.shopify.com/editions" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Shopify Editions Record Albums index page</a>, a 3D record-store-inspired experience that served as an archive for past Shopify Editions.
                        </p>
                        <VideoZoom
                            mp4="/all-editions.mp4"
                            webm="/all-editions.webm"
                            className="w-full rounded-lg mb-4"
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            The scene combined baked and dynamic rendering techniques: the shelves used a baked 3D texture for visual fidelity and performance, while the individual albums used dynamic shadows to respond naturally within the space. Fine-tuning those shadows was one of the harder challenges, especially balancing softness, quality, and frame rate. In a future iteration, I&apos;d explore texture projection as a more performant approach for the album shadows.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We also worked through a complex rendering challenge around blur. Our initial goal was to use Three.js&apos;s default render path on load, then switch to a custom post-processing pass only when blur was needed. That switch introduced a subtle but persistent color shift between rendering paths. After extensive debugging, including inspecting compiled shaders with Safari&apos;s shader debugger, we chose to use the custom post-processing pipeline consistently across the experience.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            The out-of-the-box React Three Fiber blur effect caused FPS issues, so we implemented a custom golden-ratio blur shader instead. This gave us precise control over the blur parameters, improved performance, and helped us closely match the original Cinema 4D renders.
                        </p>
                    </article>

                    <article className="md:border-l-4 md:border-brand-red md:pl-6 md:py-1">
                        {/* TODO(eric): add Plot's role, key stack, and live site link; none are stated in the repo or existing copy. */}
                        <ProjectHeader
                            id="summer-26"
                            title="Plot"
                            subtitle="Shopify Summer '26 Edition"
                            year="2026"
                            summary="A backyard garden-planning app with an AI model doing the planning at runtime, where the hard part was telling whether a prompt change was actually an improvement."
                            links={[]}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I created Plot, a backyard garden-planning app that used AI as part of its core functionality, for Shopify&apos;s Summer &apos;26 Edition. On most of my projects AI is a coding partner during the build. On this one the model was part of the product itself, doing the planning work at runtime based on what someone told the app about their space.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            A key challenge was verifying prompt changes. Unlike code, a prompt can get worse without anything visibly breaking, so clicking through the app a few times wasn&apos;t enough to tell me whether a change was an improvement.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            This is where I learned how to write evals and use Braintrust to prevent regressions, compare model behavior, and evaluate prompt changes with more confidence.
                        </p>
                    </article>
                </section>

                <section>
                    <h2 id="independent" className="group text-3xl font-brandon text-brand-red mb-8">
                        Independent
                        <a href="#independent" className="ml-2 opacity-0 group-hover:opacity-100 text-brand-red/40 hover:text-brand-red transition-opacity text-2xl">#</a>
                    </h2>

                    <article className="md:border-l-4 md:border-brand-red md:pl-6 md:py-1">
                        {/* TODO(eric): confirm the year Brightfield launched; the repo only dates the homepage redesign (September 2026). */}
                        <ProjectHeader
                            id="brightfield"
                            title="Brightfield Studio"
                            subtitle="Generative art studio and Shopify storefront"
                            role="Solo designer & developer"
                            stack="Shopify, WebGL shaders"
                            tags={["Brand", "UI Design", "Design System"]}
                            summary="A generative art studio I built end to end, from the brand and WebGL shaders to the Shopify storefront and launch, to test how far one designer-developer can take an idea."
                            links={[
                                { href: "https://brightfield.studio/", label: "Live site" },
                                { href: "/work-ive-done/brightfield-redesign", label: "Read the redesign case study" },
                            ]}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            <a href="https://brightfield.studio/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Brightfield</a> is a generative art studio I created to explore how WebGL shader visuals can become physical products and ecommerce experiences.
                        </p>
                        <VideoZoom
                            mp4="/brightfield-main.mp4"
                            webm="/brightfield-main.webm"
                            className="w-1/3 mx-auto rounded-lg mb-4"
                            showAudioToggle
                            mobileScale={2.5}
                        />
                        <p className="text-gray-700 leading-relaxed mb-4">
                            I built the project end-to-end: the brand, Shopify storefront, WebGL shaders, product presentation, custom art submission flow, launch content, and social strategy. The goal was to make generative art feel approachable and collectible while giving people a playful way to discover what&apos;s possible by adjusting shader inputs.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Brightfield brings together creative frontend development, interaction design, commerce UX, and performance-conscious implementation. It also let me test how far a single developer/designer can take an idea&mdash;from visual experimentation to a live storefront and launch campaign&mdash;using Claude as a coding partner for much of the implementation.
                        </p>
                    </article>
                </section>
            </div>
        </div>
    );
}
