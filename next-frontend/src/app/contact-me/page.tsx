import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import Image from "next/image";
import { MdEmail, MdPhone } from "react-icons/md";
import { FaLinkedin } from "react-icons/fa";

export default function ContactMePage() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Banner */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
                <Image
                    src="/images/contact-me/hello-i-m-nik-281498.jpg"
                    alt="Contact Banner"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white">
                    <AnimatedHeading
                        text="Resume"
                        className="text-5xl md:text-7xl mb-4"
                    />
                    <PhotoCredit
                        name="Hello I'm Nik"
                        imageUrl="http://unsplash.com/@helloimnik"
                    />
                </div>
            </section>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 space-y-12">
                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Resume</h2>
                    <div className="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                        <object
                            data="/files/Eric-Johnson-Resume.pdf"
                            type="application/pdf"
                            className="w-full h-full"
                        >
                            <p>
                                Your browser does not support PDFs.{" "}
                                <a href="/files/Eric-Johnson-Resume.pdf">Download the PDF</a>.
                            </p>
                        </object>
                    </div>
                </section>

                <hr className="border-gray-200" />

                <section>
                    <h2 className="text-3xl font-brandon text-brand-red mb-6">Contact Info</h2>
                    <div className="space-y-6">
                        <a
                            href="mailto:eric.d.johnson@gmail.com"
                            className="flex items-center space-x-4 text-xl text-gray-700 hover:text-brand-red transition-colors"
                        >
                            <MdEmail className="text-3xl" />
                            <span>eric.d.johnson@gmail.com</span>
                        </a>
                        <a
                            href="tel:+13194009903"
                            className="flex items-center space-x-4 text-xl text-gray-700 hover:text-brand-red transition-colors"
                        >
                            <MdPhone className="text-3xl" />
                            <span>(319) 400-9903</span>
                        </a>
                        <a
                            href="https://www.linkedin.com/in/er1cj0hns0n/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-4 text-xl text-gray-700 hover:text-brand-red transition-colors"
                        >
                            <FaLinkedin className="text-3xl" />
                            <span>linkedin.com/in/er1cj0hns0n</span>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
}
