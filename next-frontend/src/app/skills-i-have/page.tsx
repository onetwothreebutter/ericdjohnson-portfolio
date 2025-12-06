import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import Image from "next/image";

export default function SkillsPage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Banner */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
                <Image
                    src="/images/skills-i-have/jakob-owens-299038.jpg"
                    alt="Skills Banner"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white">
                    <AnimatedHeading
                        text="Skills I Have"
                        className="text-5xl md:text-7xl mb-4"
                    />
                    <PhotoCredit
                        name="Jakob Owens"
                        imageUrl="http://unsplash.com/@jakobowens1"
                    />
                </div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 space-y-12">
                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Web Skills</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I have a BS in Computer Science from the University of Iowa and have
                        been a professional web developer for {new Date().getFullYear() - 2006}{" "}
                        years.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        I maintain and improve my coding skills by using a variety of tools
                        and materials. I train on Codewars and read books on programming like{" "}
                        <span className="italic">Clean Code</span> and{" "}
                        <span className="italic">The Pragmatic Programmer</span>.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-6">
                        I also subscribe to Frontend Masters so I can dive deeply into new
                        technologies quickly.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { src: "/images/skills-i-have/elm-frontend-masters.jpg", href: "https://frontendmasters.com/courses/elm/" },
                            { src: "/images/skills-i-have/svg-animation-frontend-masters.jpg", href: "https://frontendmasters.com/courses/svg-animation/" },
                            { src: "/images/skills-i-have/js-good-parts-frontend-masters.jpg", href: "https://frontendmasters.com/courses/good-parts-javascript-web/" },
                            { src: "/images/skills-i-have/intro-to-react-frontend-masters.jpg", href: "https://frontendmasters.com/courses/react-intro/" },
                        ].map((course, i) => (
                            <a
                                key={i}
                                href={course.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block hover:opacity-80 transition-opacity"
                            >
                                <Image
                                    src={course.src}
                                    alt="Frontend Masters Course"
                                    width={200}
                                    height={200}
                                    className="rounded-lg shadow-md"
                                />
                            </a>
                        ))}
                    </div>
                </section>

                <hr className="border-gray-200" />

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Communication</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        Good communication is often taken for granted, but I know that it
                        doesn&apos;t happen automatically. Here are some steps I take to improve
                        communication:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                        <li>
                            I try to reduce the number of emails required to reach a decision by
                            summarizing long email chains.
                        </li>
                        <li>
                            I&apos;m aware of my audience and I adjust my language and jargon
                            accordingly.
                        </li>
                        <li>
                            I convey my uncertainty when I&apos;m not sure about something and ask
                            for other&apos;s input when warranted.
                        </li>
                        <li>
                            I&apos;m honest about weaknesses in my ideas (and other&apos;s ideas).
                        </li>
                        <li>
                            I use screenshots and screencasts to capture information and context
                            when it would be harder to convey using solely words.
                        </li>
                    </ul>
                </section>

                <hr className="border-gray-200" />

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Remote Work</h2>
                    <p className="text-gray-700 leading-relaxed mb-4">
                        After working in both corporate and home office environments, I&apos;ve
                        learned that working from home full-time takes a ton of
                        self-discipline, as well as strong communication skills.
                    </p>
                    <div className="float-right ml-6 mb-4 w-48">
                        <Image
                            src="/images/skills-i-have/cardboard-cutout.jpg"
                            alt="Cardboard Cutout"
                            width={300}
                            height={400}
                            className="rounded-lg shadow-lg rotate-3"
                        />
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                        However, there are challenges to not being physically present in the
                        office. I try to increase my connection to the office by using video
                        presence software and high-quality equipment. I even bought a
                        life-size cardboard cutout of myself for my team to keep in the
                        office!
                    </p>
                </section>
            </div>
        </div>
    );
}
