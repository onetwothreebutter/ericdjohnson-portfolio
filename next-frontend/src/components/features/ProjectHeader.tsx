import Link from "next/link";

export interface ProjectLink {
    href: string;
    label: string;
}

interface ProjectHeaderProps {
    id: string;
    title: string;
    subtitle?: string;
    role?: string;
    year?: string;
    stack?: string;
    tags?: string[];
    summary: string;
    links: ProjectLink[];
}

export default function ProjectHeader({ id, title, subtitle, role, year, stack, tags, summary, links }: ProjectHeaderProps) {
    return (
        <header className="mb-6">
            <h3 id={id} className="group text-2xl font-brandon">
                {title}
                <a href={`#${id}`} className="ml-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">#</a>
            </h3>
            {subtitle && <p className="text-gray-500">{subtitle}</p>}
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                {[role, year, stack].filter(Boolean).join(" · ")}
            </p>
            {tags && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                    {tags.join(" · ")}
                </p>
            )}
            <p className="mt-3 text-gray-800 leading-relaxed">{summary}</p>
            {links.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
                    {links.map((link) => (
                        <li key={link.href}>
                            {link.href.startsWith("http") ? (
                                <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-brand-red hover:underline">
                                    {link.label} &#8599;
                                </a>
                            ) : (
                                <Link href={link.href} className="text-brand-red hover:underline">
                                    {link.label} &rarr;
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </header>
    );
}
