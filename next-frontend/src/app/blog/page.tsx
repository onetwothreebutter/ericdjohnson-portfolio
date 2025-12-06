import { client } from "@/sanity/client";
import BlogPost from "@/components/features/BlogPost";
import AnimatedHeading from "@/components/ui/AnimatedHeading";
import PhotoCredit from "@/components/features/PhotoCredit";
import Image from "next/image";

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function BlogPage() {
    const posts = await client.fetch(`*[_type == "post"] | order(publishedAt desc){
    title,
    publishedAt,
    "slug": slug,
    "mainImage": mainImage,
    "body": body,
    "author": author->name,
    "categories": categories[]->title
  }`);

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Banner */}
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

            {/* Posts */}
            <div className="px-6">
                {posts.map((post: any) => (
                    <BlogPost key={post.slug.current} post={post} />
                ))}
            </div>
        </div>
    );
}
