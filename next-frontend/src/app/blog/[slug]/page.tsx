import { client } from "@/sanity/client";
import BlogPost from "@/components/features/BlogPost";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import Image from "next/image";
import { notFound } from "next/navigation";

// Revalidate every 60 seconds
export const revalidate = 60;

export async function generateStaticParams() {
    const posts = await client.fetch(`*[_type == "post"]{ "slug": slug.current }`);
    return posts.map((post: any) => ({
        slug: post.slug,
    }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await client.fetch(
        `*[_type == "post" && slug.current == $slug][0]{
    title,
    publishedAt,
    "slug": slug,
    "mainImage": mainImage,
    "body": body,
    "author": author->name,
    "categories": categories[]->title
  }`,
        { slug }
    );

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Banner (Reusing same banner for consistency, or could use post image) */}
            <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden mb-12">
                <Image
                    src="/images/blog/jess-bailey-l3N9Q27zULw-unsplash.jpg"
                    alt="Blog Banner"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 text-center text-white">
                    <AnimatedHeading
                        text="EJ Blog"
                        className="text-5xl md:text-7xl mb-4"
                    />
                    <PhotoCredit
                        name="Jess Bailey"
                        imageUrl="http://unsplash.com/@jessbaileydesigns"
                    />
                </div>
            </section>

            <div className="px-6">
                <BlogPost post={post} />
            </div>
        </div>
    );
}
