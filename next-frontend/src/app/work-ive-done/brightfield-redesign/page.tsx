import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Merriweather, Poppins } from "next/font/google";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import FigmaEmbed from "@/components/brightfield/FigmaEmbed";
import { DesignsMockup, EndingMockup, HumanMockup } from "@/components/brightfield/Mockups";

const FIGMA_FILE = "g1xZl2Yb6dmDzGv7zwKyvK/Brightfield-web-redesign-Nov-2026---Portfolio?node-id=0-1";
const FIGMA_URL = `https://www.figma.com/design/${FIGMA_FILE}`;
const FIGMA_EMBED_URL = `https://embed.figma.com/design/${FIGMA_FILE}&embed-host=share`;

// Brightfield's own typefaces, used only inside the mockups and type specimens.
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-poppins",
});
const merriweather = Merriweather({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-merriweather",
});

export const metadata: Metadata = {
    title: "Brightfield Redesign",
    description:
        "Why and how I redesigned the Brightfield Studio homepage: the old page, the new one, and the decisions between them.",
};

const IMG = "/images/work-ive-done/brightfield-redesign";
const P = "text-gray-700 leading-relaxed";

const heroExplorations = [
    "Light lowercase type, art for your body, sculpted with code by a human, over a soft teal and pink wave render.",
    "Light uppercase type, ART FOR YOUR BODY, SCULPTED WITH CODE, BY A HUMAN, over the same wave render.",
    "A bold uppercase headline with a sentence-case line under it, over the same wave render.",
    "The bold headline over a photo of a man in a black tee in a shop.",
    "The bold headline over a grainy yellow and orange gradient.",
    "The bold headline over the orange glass-block render, the direction used in the final design.",
];

const humanExplorations = [
    "Centered heading, a very large quotation mark behind the bio, and a round avatar with a pink ring.",
    "Centered heading, a smaller quotation mark, and a plain round avatar.",
    "Everything left aligned, with the quotation mark behind the text.",
    "Left-aligned text beside a large black and white portrait.",
];

const mobileControls = [
    { name: "closed", label: "Closed", width: 372, height: 99, alt: "A bar with three tabs: Colors, Code, and Finish." },
    { name: "colors", label: "Colors", width: 372, height: 186, alt: "The Colors tab open, with a row of palette chips named Coastal and Fiery above the tab bar." },
    { name: "code", label: "Code", width: 372, height: 263, alt: "The Code tab open, with Line Width and Line Spacing toggles above a slider drawn as bars that grow wider from left to right." },
    { name: "finish", label: "Finish", width: 372, height: 186, alt: "The Finish tab open, with chips for Distress, Crosshatch and Halftone dots." },
];

const stayedTheSame = [
    "The dark page.",
    "The order: shop first, then make your own, then sign up.",
    "Nine designs in a three-by-three grid.",
    "The canvas on the left with controls on the right, ending in Preview on shirt.",
    "Two buttons in the hero, one for each thing you can do.",
];

const whatChanged = [
    "The headline went from “Source Code for Your Shirt” to “Art for your body”.",
    "The hero went from a model photo with a shader laid over it to the art by itself, edge to edge.",
    "Neon cyan and magenta with monospace labels became warm neutrals, one pink accent, and Poppins.",
    "A new section introduces the person making the art.",
    "Product cards went from a model photo with two buttons to the art, a name, and a price.",
    "The customizer went from a dropdown and numbered sliders (Lines, Power, Center Circle) to a palette, two visual sliders, and three effects.",
    "The navigation dropped Community Designs and went from four links to three.",
];

const colors = [
    ["color-bg-page", "#121111"],
    ["color-bg-surface", "#191818"],
    ["color-neutral-10", "#1e1b1b"],
    ["color-border-default", "#372e2e"],
    ["color-border-strong", "#665c5c"],
    ["color-neutral-50", "#7f7575"],
    ["color-text-secondary", "#cfc4c4"],
    ["color-neutral-99", "#fffbfb"],
    ["color-pink-54", "#ff0a54"],
    ["color-text-brand", "#ff516a"],
];

const typeScale: Array<{ sample: string; spec: string; className: string }> = [
    { sample: "ART FOR YOUR BODY", spec: "H1, Poppins Bold 80 / 96", className: "text-4xl md:text-6xl font-bold tracking-[-0.04em]" },
    { sample: "The designs", spec: "H2, Bold 72 / 74", className: "text-4xl md:text-5xl font-bold tracking-[-0.04em]" },
    { sample: "Sculpted with code by a human", spec: "Lead, Regular 32 / 40", className: "text-2xl tracking-[-0.04em]" },
    { sample: "Turning math into original designs", spec: "Quote, Merriweather 32 / 40", className: "text-2xl font-[family-name:var(--font-merriweather)]" },
    { sample: "Create and discover your own design", spec: "Body, Regular 25 / 30", className: "text-xl tracking-[-0.04em]" },
    { sample: "Contour Pareidolia", spec: "Small, Regular 20 / 24", className: "text-base tracking-[-0.04em]" },
    { sample: "CODE SETTINGS", spec: "Overline, SemiBold 15, +22%", className: "text-xs font-semibold tracking-[0.22em]" },
];

const spacing = [
    ["3xs", 2],
    ["2xs", 4],
    ["xs", 8],
    ["sm", 12],
    ["md", 16],
    ["lg", 24],
    ["xl", 32],
    ["2xl", 48],
    ["3xl", 64],
] as const;

const radii = [
    ["sm", 4],
    ["md", 8],
    ["lg", 12],
    ["xl", 32],
    ["full", 999],
] as const;

const lettermarks = [
    { src: "/images/work-ive-done/brightfield-redesign/lettermark-v1.svg", alt: "Lettermark: a white b inside a frame of pink dots." },
    { src: "/images/work-ive-done/brightfield-redesign/lettermark-v2.svg", alt: "Lettermark: a frame of white dots with one pink dot in the top right corner." },
    { src: "/images/work-ive-done/brightfield-redesign/lettermark-v3.svg", alt: "Lettermark: a white b inside a frame of dots fading from white at the top to grey at the bottom." },
];

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
    return (
        <h2 id={id} className="group text-3xl font-brandon text-brand-red mb-6">
            {children}
            <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-brand-red/40 hover:text-brand-red transition-opacity text-2xl">#</a>
        </h2>
    );
}

/** Mockups break out of the text column on large screens so they stay legible. */
function Figure({ caption, children }: { caption: string; children: ReactNode }) {
    return (
        <figure className="mt-6 lg:-mx-32">
            {children}
            <figcaption className="mt-2 text-sm text-gray-500 lg:mx-32">{caption}</figcaption>
        </figure>
    );
}

export default function BrightfieldRedesignPage() {
    return (
        <div className={`min-h-screen bg-white pb-20 ${poppins.variable} ${merriweather.variable}`}>
            {/* Banner */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12 bg-[#121111]">
                <Image src="/images/work-ive-done/brightfield-redesign/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white px-6">
                    <AnimatedHeading
                        text="Brightfield Redesign"
                        className="text-5xl md:text-7xl mb-4"
                    />
                </div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 space-y-12">
                <section>
                    <SectionHeading id="the-project">The Project</SectionHeading>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        <a href="https://brightfield.studio/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Brightfield</a> is my generative art studio, where WebGL shaders become shirts you can wear. In fall 2026 I redesigned its homepage in Figma around three things: the art, the person making it, and a tool that lets visitors make their own.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        I own the brand, the design, and the build. Below is why I redesigned it, the old page next to the new one, the decisions behind three parts of it, and the variables it&apos;s built from. For the story of the studio itself, see <Link href="/work-ive-done#brightfield" className="text-brand-red hover:underline">Work I&apos;ve Done</Link>.
                    </p>
                    <a
                        href={FIGMA_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-block rounded-md border-2 border-brand-red px-5 py-2 font-brandon uppercase tracking-wide text-brand-red transition-colors hover:bg-brand-red hover:text-white"
                    >
                        View in Figma
                    </a>
                </section>

                <section>
                    <SectionHeading id="why-redesign">Why Redesign?</SectionHeading>
                    <p className={`${P} mb-4`}>
                        The old Brightfield worked. You could pick a design, change it, and buy a shirt. But the homepage led with how the shirts are made. The headline was &ldquo;Source Code for Your Shirt&rdquo;, and a visitor had to decipher the technology before they understood the product.
                    </p>
                    <p className={`${P} mb-4`}>
                        I wanted the order reversed. Brightfield should read first as an art and design studio with a person behind it, not as a print-on-demand store or a tech demo. The code is still the reason the art exists, but it should come in after the art has earned your attention.
                    </p>
                    <p className={P}>
                        So the brief I wrote for myself came down to one question: how can Brightfield present generative art as something you&apos;d want to wear, while making it simple to create your own? That meant three things: a clearer identity, a homepage that gives equal weight to buying a design and making one, and shader controls that work for someone who has never heard of a shader.
                    </p>
                </section>

                <section>
                    <SectionHeading id="before-and-after">Before and After</SectionHeading>
                    <p className={P}>
                        Here is the homepage I started from, next to the redesign. The old one isn&apos;t bad. It has a clear grid, a working customizer, and a look of its own. It just talks about code before it talks about art.
                    </p>
                    <Figure caption="The old homepage and the redesign, both at desktop width.">
                        <div className="grid grid-cols-2 gap-4 items-start">
                            {[
                                {
                                    label: "Before",
                                    src: `${IMG}/before-full.webp`,
                                    height: 2617,
                                    alt: "Old Brightfield homepage: a photo of a model in a stone alley under the headline Source Code for Your Shirt, a grid of nine shirts on models with cyan buttons, a customizer with sliders, and an email sign-up.",
                                },
                                {
                                    label: "After",
                                    src: `${IMG}/after-full.webp`,
                                    height: 4096,
                                    alt: "Redesigned Brightfield homepage: a full-width orange shader render under the headline Art for your body, a portrait and bio of Eric, a grid of nine designs, shader controls, and an email sign-up.",
                                },
                            ].map(({ label, src, height, alt }) => (
                                <div key={label}>
                                    <p className="mb-2 text-sm text-gray-500">{label}</p>
                                    <div className="rounded-lg overflow-hidden bg-[#121111]">
                                        <Image src={src} alt={alt} width={844} height={height} sizes="(min-width: 1024px) 500px, 50vw" className="w-full h-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Figure>
                    <div className="grid md:grid-cols-2 gap-10 mt-10">
                        <div>
                            <h3 className="mb-4 text-2xl font-brandon">What&apos;s the same</h3>
                            <ul className={`${P} list-disc pl-5 space-y-2`}>
                                {stayedTheSame.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-2xl font-brandon">What changed</h3>
                            <ul className={`${P} list-disc pl-5 space-y-2`}>
                                {whatChanged.map((item) => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <SectionHeading id="hero">The Hero</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        The art fills the first screen, edge to edge, and a model wears one of the designs, so the first thing you see is the art as a shirt. The headline is three words, and the two buttons name the two things you can do at Brightfield: shop a design, or create one.
                    </p>
                    <Figure caption="Hero, 1440 × 1024.">
                        <Image
                            src="/images/work-ive-done/brightfield-redesign/hero-section.webp"
                            alt="Hero section: a full-bleed orange shader render with the Brightfield wordmark and navigation, the headline Art for your body, the line Sculpted with code by a human, and Shop and Create buttons, beside a model in a black shirt printed with a Brightfield line design."
                            width={1440}
                            height={1024}
                            sizes="(min-width: 1024px) 1024px, 100vw"
                            className="w-full h-auto rounded-lg"
                        />
                    </Figure>
                    <p className={`${P} mt-6 mb-4`}>
                        I tried the headline three ways before the image changed at all: light lowercase, light uppercase, and bold uppercase with a quieter line under it.
                    </p>
                    <p className={`${P} mb-4`}>
                        Then the image. The obvious choice for a shirt store is a photo of someone wearing the shirt, and I mocked that up. The old homepage did the same thing. I also tried a plain gradient before settling on the orange render.
                    </p>
                    <Figure caption="Six hero directions. The last one is the final.">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {heroExplorations.map((alt, i) => (
                                <Image
                                    key={alt}
                                    src={`${IMG}/hero-explore-${i + 1}.webp`}
                                    alt={`Hero direction ${i + 1}: ${alt}`}
                                    width={960}
                                    height={683}
                                    sizes="(min-width: 1024px) 340px, 50vw"
                                    className="w-full h-auto rounded-lg"
                                />
                            ))}
                        </div>
                    </Figure>
                    <p className={`${P} mt-6 mb-4`}>
                        The first line I wrote was &ldquo;Art crafted with code (by a human)&rdquo;. It became &ldquo;Art for your body&rdquo; with &ldquo;Sculpted with code by a human&rdquo; beneath it, so the code moves to the second line and the wearing moves to the first.
                    </p>
                    <p className={P}>
                        The final hero shows no garment. The shirt appears once you click through.
                    </p>
                </section>

                <section>
                    <SectionHeading id="human">The Human</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        I want people to know each design is made by a person, so the second section shows that person: a face and a short bio. It is the one place on the page set in Merriweather, so it reads like a person talking and not like interface.
                    </p>
                    <Figure caption="The human behind the designs.">
                        <HumanMockup />
                    </Figure>
                    <p className={`${P} mt-6 mb-4`}>
                        I laid this section out four ways with the same words. The first three set the bio as a quote, with a heading, a large quotation mark, and a small round avatar. The fourth gives a portrait half the section. It is the only photograph on the page, and it&apos;s black and white. In the final version the avatar is gone, and the Brightfield lettermark sits in its place next to my name.
                    </p>
                    <Figure caption="Four layouts for the same words. The portrait made it into the final.">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {humanExplorations.map((alt, i) => (
                                <Image
                                    key={alt}
                                    src={`${IMG}/human-explore-${i + 1}.webp`}
                                    alt={`Layout ${i + 1}: ${alt}`}
                                    width={720}
                                    height={544}
                                    sizes="(min-width: 1024px) 250px, 50vw"
                                    className="w-full h-auto rounded-lg"
                                />
                            ))}
                        </div>
                    </Figure>
                    <p className={`${P} mt-6`}>
                        The words changed too. My outline called this &ldquo;The human behind the code&rdquo;. It became &ldquo;The human behind the designs&rdquo;. The bio also got shorter: &ldquo;turning math, color, and motion into original designs&rdquo; became &ldquo;turning math into original designs&rdquo;.
                    </p>
                </section>

                <section>
                    <SectionHeading id="designs">The Designs</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        I wanted the experience to feel spare, more like an art museum than a traditional online store. The art fills the card, and the name and price sit in one thin bar at the bottom.
                    </p>
                    <Figure caption="Product grid. The Figma file uses one piece, Square Dance, as the stand-in on every card.">
                        <DesignsMockup />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="tool">The Tool</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        After the in-house designs comes the invitation to make your own. The controls are the parameters of the code itself: a palette, line width, line spacing, and three print effects.
                    </p>
                    <Figure caption="Craft your own.">
                        <Image
                            src="/images/work-ive-done/brightfield-redesign/craft-your-own.webp"
                            alt="Craft your own section: a canvas showing a generative line design beside controls for the Coastal color palette, line width, line spacing, and Distress, Crosshatch and Halftone dots effects, above a Preview on shirt button."
                            width={1440}
                            height={1310}
                            sizes="(min-width: 1024px) 1024px, 100vw"
                            className="w-full h-auto rounded-lg"
                        />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="sign-up">The Sign-Up</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        New art arrives monthly, so the page ends with one field and one button, then a footer that stays out of the way.
                    </p>
                    <Figure caption="Get notified, and the footer.">
                        <EndingMockup />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="tablet-and-mobile">Tablet and Mobile</SectionHeading>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        The page is designed at three widths: 1440 for desktop, 1024 for tablet, and 402 for mobile. On tablet the layout keeps its desktop shape at a smaller size. On mobile the navigation shrinks to search, bag, and a menu, and the Shop and Create buttons stack full width so both stay easy to tap.
                    </p>
                    <Figure caption="Hero on tablet and mobile.">
                        <div className="flex items-start gap-4">
                            <Image
                                src="/images/work-ive-done/brightfield-redesign/tablet-hero.webp"
                                alt="Tablet hero: the orange shader render with the headline Art for your body and Shop and Create buttons side by side, and the model in the printed shirt on the right."
                                width={1024}
                                height={875}
                                sizes="(min-width: 1024px) 745px, 72vw"
                                className="w-[73.3%] min-w-0 h-auto rounded-lg"
                            />
                            <Image
                                src="/images/work-ive-done/brightfield-redesign/mobile-hero.webp"
                                alt="Mobile hero: the same headline over the shader render, with search, bag and menu icons in the navigation, full-width Shop and Create buttons stacked, and the model in the printed shirt below them."
                                width={402}
                                height={945}
                                sizes="(min-width: 1024px) 275px, 27vw"
                                className="w-[26.7%] min-w-0 h-auto rounded-lg"
                            />
                        </div>
                    </Figure>
                    <p className="text-gray-700 leading-relaxed mt-6">
                        The shader controls change the most. On tablet the canvas stays in view beside the controls as you scroll through them.
                    </p>
                    <Figure caption="Craft your own on tablet and mobile.">
                        <div className="flex items-start gap-4">
                            <Image
                                src="/images/work-ive-done/brightfield-redesign/tablet-craft-your-own.webp"
                                alt="Tablet craft your own section: the design canvas on the left, with Colors, Code settings and Effects panels and a Preview on shirt button on the right."
                                width={1024}
                                height={1261}
                                sizes="(min-width: 1024px) 650px, 62vw"
                                className="w-[63.6%] min-w-0 h-auto rounded-lg"
                            />
                            <Image
                                src="/images/work-ive-done/brightfield-redesign/mobile-craft-your-own.webp"
                                alt="Mobile craft your own section: the design canvas filling the width, with a bar of Colors, Code and Finish tabs beneath it."
                                width={402}
                                height={866}
                                sizes="(min-width: 1024px) 370px, 36vw"
                                className="w-[36.4%] min-w-0 h-auto rounded-lg"
                            />
                        </div>
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="mobile-shader-controls">Mobile Shader Controls</SectionHeading>
                    <p className={`${P} mb-4`}>
                        On desktop the canvas and the three control panels sit side by side. On a phone there isn&apos;t room, and stacking them would mean scrolling away from the art to change it, then scrolling back to see what happened. My brief had a line for this: keep the artwork visible while the shopper experiments.
                    </p>
                    <p className={P}>
                        So on mobile the controls are a bar over the bottom of the canvas, with three tabs: Colors, Code, and Finish. Tap one and a single row opens above it. The canvas never leaves the screen.
                    </p>
                    <Figure caption="The mobile control bar closed, and with each of its three drawers open.">
                        <div className="rounded-lg bg-[#121111] p-6 md:p-8">
                            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                                {mobileControls.map(({ name, label, width, height, alt }) => (
                                    <li key={name} className="text-center">
                                        <Image
                                            src={`${IMG}/mobile-controls-${name}.webp`}
                                            alt={alt}
                                            width={width}
                                            height={height}
                                            sizes="(min-width: 1024px) 240px, 45vw"
                                            className="w-full h-auto"
                                        />
                                        <span className="mt-3 block text-sm text-gray-400">{label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Figure>
                    <p className={`${P} mt-6 mb-4`}>
                        Each drawer holds one row and no more. Colors is a strip of named palettes you swipe through. Code has two settings, Line Width and Line Spacing, and you switch between them with a toggle so only one slider shows at a time. Finish is three effects.
                    </p>
                    <p className={`${P} mb-4`}>
                        The sliders have no numbers. The old customizer had sliders named Lines, Power, and Center Circle, with numeric values beside them. The new slider for line width is drawn as a row of bars getting wider, and the one for spacing as lines moving apart, so the control shows you what it does before you touch it.
                    </p>
                    <p className={P}>
                        The cost is reach. The old page had an All Settings panel, and the new one exposes a palette, two sliders, and three effects. One small thing: the panel called Effects on desktop is called Finish on mobile.
                    </p>
                </section>

                <section>
                    <SectionHeading id="wordmark">The Wordmark</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        The final wordmark stacks &ldquo;bright&rdquo; over &ldquo;field&rdquo; in lowercase, with the dot on the i in pink. Alongside it is a lettermark built from a frame of dots, drawn in three versions: pink dots around a b, white dots with a single pink corner, and a b with dots fading from white to grey.
                    </p>
                    <Figure caption="The final wordmark and three versions of the lettermark.">
                        <div className="rounded-lg bg-[#121111] px-6 py-12 md:py-16">
                            <Image
                                src="/images/work-ive-done/brightfield-redesign/wordmark-final.svg"
                                alt="Brightfield wordmark: bright stacked over field in white lowercase, the dot on the i in pink."
                                width={262}
                                height={113}
                                className="mx-auto w-48 md:w-64 h-auto"
                            />
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-10 md:gap-16">
                                {lettermarks.map(({ src, alt }) => (
                                    <Image key={src} src={src} alt={alt} width={120} height={131} className="w-16 md:w-20 h-auto" />
                                ))}
                            </div>
                        </div>
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="system">The System</SectionHeading>
                    <p className="text-gray-700 leading-relaxed mb-8">
                        Every value on the page is a Figma variable, named the way it will be named in CSS. Two typefaces, nine spacing steps, five radii, and a neutral ramp that leans slightly red all the way down, so that even the black sits comfortably next to the pink.
                    </p>

                    <h3 className="mb-4 text-2xl font-brandon">Color</h3>
                    <ul className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-10">
                        {colors.map(([name, hex]) => (
                            <li key={name} className="text-xs text-gray-500">
                                <span className="block h-14 rounded-lg border border-gray-200 mb-2" style={{ background: hex }} />
                                <span className="block text-gray-700 break-words">{name}</span>
                                {hex}
                            </li>
                        ))}
                    </ul>

                    <h3 className="mb-4 text-2xl font-brandon">Type</h3>
                    <ul className="border-t border-gray-200 mb-10 font-[family-name:var(--font-poppins)]">
                        {typeScale.map(({ sample, spec, className }) => (
                            <li key={spec} className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6 py-3 border-b border-gray-200">
                                <span className={`text-gray-900 leading-tight ${className}`}>{sample}</span>
                                <span className="text-xs text-gray-500 font-sans md:whitespace-nowrap">{spec}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="mb-4 text-2xl font-brandon">Spacing</h3>
                            <ul className="flex flex-wrap items-end gap-3">
                                {spacing.map(([name, px]) => (
                                    <li key={name} className="text-xs text-gray-500 text-center">
                                        <span className="block mx-auto mb-2 bg-brand-red" style={{ width: px, height: px }} />
                                        {name} {px}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="mb-4 text-2xl font-brandon">Radius</h3>
                            <ul className="flex flex-wrap items-end gap-3">
                                {radii.map(([name, px]) => (
                                    <li key={name} className="text-xs text-gray-500 text-center">
                                        <span className="block w-14 h-14 mx-auto mb-2 border-2 border-gray-700" style={{ borderRadius: px }} />
                                        {name} {px}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section>
                    <SectionHeading id="file">The File</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        Everything above comes from one Figma file, with a frame for each of desktop, tablet, and mobile. Here it is, with the variables and components intact. You can also <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">open it in Figma</a>.
                    </p>
                    <Figure caption="The Figma file: desktop, tablet, and mobile frames.">
                        <FigmaEmbed src={FIGMA_EMBED_URL} title="Brightfield homepage redesign in Figma" />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="reflection">Reflection</SectionHeading>
                    <p className={`${P} mb-4`}>
                        This redesign isn&apos;t live yet, so there are no numbers to show.
                    </p>
                    <p className={P}>
                        The biggest surprise was how much clearer the shader controls became once I designed them instead of using default sliders. The difference was obvious even to me, and I wrote the shaders. It&apos;s the part I&apos;m happiest with: controls that show what they change and invite you to try them.
                    </p>
                </section>

                <section>
                    <p className="text-gray-700 leading-relaxed">
                        <Link href="/work-ive-done" className="text-brand-red hover:underline">Back to all work</Link>
                    </p>
                </section>
            </div>
        </div>
    );
}
