"use client";

import { PortableText } from "@portabletext/react";
import { urlFor } from "@/sanity/image";
import { format, differenceInDays, formatDistance } from "date-fns";
import Link from "next/link";
import Image from "next/image";

interface BlogPostProps {
    post: {
        title: string;
        publishedAt: string;
        slug: { current: string };
        mainImage: any;
        body: any;
    };
}

export default function BlogPost({ post }: BlogPostProps) {
    const { title, slug, body, mainImage, publishedAt } = post;

    const formattedPublish =
        differenceInDays(new Date(), new Date(publishedAt)) >= 1
            ? format(new Date(publishedAt), "MMM dd, y")
            : formatDistance(new Date(publishedAt), new Date(), { addSuffix: true });

    return (
        <div className="mb-16 max-w-3xl mx-auto">
            <h2 className="text-4xl font-brandon text-brand-red mb-2">{title}</h2>
            <div className="text-sm text-gray-500 mb-6 uppercase tracking-wider">
                {formattedPublish}
            </div>

            {mainImage && (
                <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden shadow-md">
                    <Image
                        src={urlFor(mainImage).width(800).url()}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="prose prose-lg max-w-none text-gray-700">
                <PortableText
                    value={body}
                    components={{
                        types: {
                            image: ({ value }: any) => {
                                if (!value?.asset?._ref) {
                                    return null;
                                }
                                return (
                                    <div className="relative w-full h-[400px] my-8 not-prose rounded-lg overflow-hidden">
                                        <Image
                                            src={urlFor(value).width(800).url()}
                                            alt={value.alt || 'Blog Post Image'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                );
                            },
                        },
                    }}
                />
            </div>

            <div className="mt-8">
                <Link
                    href={`/blog/${slug.current}`}
                    className="text-brand-red hover:text-black transition-colors font-bold uppercase tracking-wide text-sm"
                >
                    Permalink
                </Link>
            </div>
        </div>
    );
}
