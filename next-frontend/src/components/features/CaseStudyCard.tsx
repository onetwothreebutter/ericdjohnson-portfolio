import Image from "next/image";
import Link from "next/link";

export interface CaseStudy {
    slug: string;
    title: string;
    summary: string;
    image: string;
    tags: string[];
}

export default function CaseStudyCard({ slug, title, summary, image, tags }: CaseStudy) {
    return (
        <Link
            href={`/work-ive-done/${slug}`}
            className="group block overflow-hidden rounded-lg border border-gray-200 transition-colors hover:border-brand-red"
        >
            <div className="relative aspect-[16/9] overflow-hidden bg-[#121111]">
                <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                />
            </div>
            <div className="p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {tags.join(" · ")}
                </p>
                <h3 className="mb-2 text-2xl font-brandon text-gray-800 transition-colors group-hover:text-brand-red">
                    {title}
                </h3>
                <p className="mb-4 text-gray-700 leading-relaxed">{summary}</p>
                <span className="font-brandon uppercase tracking-wide text-brand-red">
                    Read the case study &rarr;
                </span>
            </div>
        </Link>
    );
}
