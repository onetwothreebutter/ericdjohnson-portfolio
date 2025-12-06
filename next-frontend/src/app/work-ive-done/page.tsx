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
            <section className="flex flex-wrap max-w-7xl mx-auto border-l border-gray-200">
                <WorkTile
                    link="web-animations"
                    svg={<NewtonsCradle />}
                    heading="Web Animation"
                    description="I love bringing the web to life!"
                />
                <WorkTile
                    link="ui-components"
                    heading="UI Components"
                    description="My fun, reusable interface elements"
                />
                <WorkTile
                    link="ux-design"
                    heading="UX Design"
                    description="A couple of examples of UX improvement ideas"
                />
                <WorkTile
                    link="product-design"
                    heading="Product Design"
                    description="Some of my bright ideas"
                />
                <WorkTile
                    link="visual-design"
                    heading="Visual Design"
                    description="Stickers, t-shirts, and logos I've designed"
                />
                <WorkTile
                    link="writing"
                    heading="Writing"
                    description="Good writing makes good code"
                />
            </section>
        </div>
    );
}
