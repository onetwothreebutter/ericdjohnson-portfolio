import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Merriweather, Poppins } from "next/font/google";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import FigmaEmbed from "@/components/brightfield/FigmaEmbed";
import { DesignsMockup, EndingMockup, HumanMockup } from "@/components/brightfield/Mockups";

const FIGMA_FILE = "DiDquPfATSCtAbBgIOOs1T/Brightfield-web-redesign-Sept-2026?node-id=233-147";
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
        "A redesign of the Brightfield Studio homepage: generative art made with code, and a tool for making your own.",
};

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
                        <a href="https://brightfield.studio/" target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">Brightfield</a> is my generative art studio, where WebGL shaders become shirts you can wear. In September 2026 I redesigned its homepage in Figma around three things: the art, the person making it, and a tool that lets visitors make their own.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                        I own the brand, the design, and the build. Below is the page from top to bottom, followed by the variables it&apos;s built from. For the story of the studio itself, see <Link href="/work-ive-done#brightfield" className="text-brand-red hover:underline">Work I&apos;ve Done</Link>.
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
                    <SectionHeading id="hero">The Hero</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        The art fills the first screen, edge to edge, before anything is said about it. The headline is three words, and the two buttons name the two things you can do at Brightfield: shop a design, or create one.
                    </p>
                    <Figure caption="Hero, 1440 × 1024.">
                        <Image
                            src="/images/work-ive-done/brightfield-redesign/hero-section.webp"
                            alt="Hero section: a full-bleed orange shader render with the Brightfield wordmark and navigation, the headline Art for your body, the line Sculpted with code by a human, and Shop and Create buttons."
                            width={1440}
                            height={1024}
                            sizes="(min-width: 1024px) 1024px, 100vw"
                            className="w-full h-auto rounded-lg"
                        />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="human">The Human</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        &ldquo;By a human&rdquo; is a claim, so the second section backs it up with a face and a short bio. It is the one place on the page set in Merriweather, so it reads like a person talking and not like interface.
                    </p>
                    <Figure caption="The human behind the designs.">
                        <HumanMockup />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="designs">The Designs</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        Nine designs on one card component. Each card gives the art the whole frame and keeps the name and price to a single bar along the bottom.
                    </p>
                    <Figure caption="Product grid. The Figma file uses one piece, Square Dance, as the stand-in on every card.">
                        <DesignsMockup />
                    </Figure>
                </section>

                <section>
                    <SectionHeading id="tool">The Tool</SectionHeading>
                    <p className="text-gray-700 leading-relaxed">
                        After the shop comes the invitation to make your own. The controls are the parameters of the code itself: a palette, line width, line spacing, and three print effects.
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
                        Everything above comes from one Figma frame. Here it is, with the variables and components intact. You can also <a href={FIGMA_URL} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">open it in Figma</a>.
                    </p>
                    <Figure caption="The Figma file, Desktop frame.">
                        <FigmaEmbed src={FIGMA_EMBED_URL} title="Brightfield homepage redesign in Figma" />
                    </Figure>
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
