import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://www.ericdjohnson.net',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        {
            url: 'https://www.ericdjohnson.net/work-ive-done',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.ericdjohnson.net/work-ive-done/brightfield-redesign',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.6,
        },
        {
            url: 'https://www.ericdjohnson.net/skills-i-have',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: 'https://www.ericdjohnson.net/who-i-am',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://www.ericdjohnson.net/what-im-looking-for',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: 'https://www.ericdjohnson.net/contact-me',
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },

    ]
}
