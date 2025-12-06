interface PhotoCreditProps {
    name: string;
    imageUrl: string;
    className?: string;
}

export default function PhotoCredit({ name, imageUrl, className }: PhotoCreditProps) {
    return (
        <div className={`absolute bottom-2 right-2 text-[10px] text-white/70 ${className}`}>
            Photo by{" "}
            <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white transition-colors"
            >
                {name}
            </a>
        </div>
    );
}
