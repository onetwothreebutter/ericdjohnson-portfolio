import clsx from "clsx";
import Image from "next/image";
import s from "./brightfield.module.css";

/**
 * Static recreations of the redesigned Brightfield homepage sections.
 * Each one is presented as a single image to assistive tech (role="img" + inert).
 */

function Wordmark() {
    return <Image src="/images/work-ive-done/brightfield-redesign/wordmark.svg" alt="" width={176} height={76} className={s.wordmark} />;
}

export function HumanMockup() {
    return (
        <div
            className={s.frame}
            role="img"
            aria-label="About section: the heading The human behind the designs, a two-paragraph bio in a serif face, and Eric Johnson's name and title beside a portrait."
        >
            <div className={clsx(s.stage, s.human)} inert>
                <div className={s.humanPhoto}>
                    <Image src="/images/work-ive-done/brightfield-redesign/human.jpg" alt="" fill sizes="(min-width: 1024px) 1024px, 100vw" />
                </div>
                <div className={s.humanCopy}>
                    <h3>The human behind the designs</h3>
                    <p>I&rsquo;m Eric, an Iowa-based artist and creative coder.</p>
                    <p>
                        After two decades of making things for the web, I created Brightfield as a place to explore code as an artistic medium&mdash;turning math into original designs you can wear.
                    </p>
                    <div className={s.who}>
                        <Image src="/images/work-ive-done/brightfield-redesign/lettermark.svg" alt="" width={58} height={63} className={s.lettermark} />
                        <div>
                            <strong>Eric Johnson</strong>
                            Brightfield creator/designer
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const DESIGNS = [
    "Square Dance",
    "Contour Pareidolia",
    "Line Circle",
    "Four Circles",
    "Stacked",
    "Echo",
    "Line Text",
    "Geometric Grid",
    "Chladni",
];

export function DesignsMockup() {
    return (
        <div
            className={s.frame}
            role="img"
            aria-label="Product grid: nine cards in three columns, each showing a generative line design with its name and a price of 32 dollars."
        >
            <div className={clsx(s.stage, s.designs)} inert>
                <div className={s.designsBg}>
                    <Image src="/images/work-ive-done/brightfield-redesign/designs-bg.webp" alt="" fill sizes="(min-width: 1024px) 1024px, 100vw" />
                </div>
                <div className={s.sectionHeading}>
                    <h3>
                        The designs<span className={s.dot}>.</span>
                    </h3>
                    <p>Original designs crafted and discovered through playing with creative code.</p>
                </div>
                <div className={s.grid}>
                    {DESIGNS.map((name) => (
                        <div key={name} className={s.card}>
                            <div className={s.cardArt}>
                                <Image src="/images/work-ive-done/brightfield-redesign/square-dance.webp" alt="" fill sizes="(min-width: 1024px) 340px, 33vw" />
                            </div>
                            <div className={s.cardBar}>
                                <span>{name}</span>
                                <span>$32</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function EndingMockup() {
    return (
        <div
            className={s.frame}
            role="img"
            aria-label="Closing sections: a glowing panel headed Get notified about new designs with an email field and Sign up button, above a footer with the Brightfield wordmark and links."
        >
            <div className={s.stage} inert>
                <div className={s.notifyGlow}>
                    <Image src="/images/work-ive-done/brightfield-redesign/notify-glow.webp" alt="" fill sizes="(min-width: 1024px) 1024px, 100vw" />
                    <div className={s.notify}>
                        <h3>
                            Get notified about
                            <br />
                            new designs<span className={s.dot}>.</span>
                        </h3>
                        <p>I release new art each month. Sign up, and I&rsquo;ll let you know when something new arrives.</p>
                        <div className={s.form}>
                            <span className={s.field}>Email address</span>
                            <span className={s.signUp}>Sign up</span>
                        </div>
                    </div>
                </div>
                <div className={s.footer}>
                    <div className={s.footerBrand}>
                        <Wordmark />
                        <small>
                            Brightfield Studio
                            <br />
                            Iowa, USA
                        </small>
                    </div>
                    <div className={s.footerLinks}>
                        <div>
                            <span>About</span>
                            <span>Contact</span>
                            <span>FAQ</span>
                            <span>Returns</span>
                        </div>
                        <div>
                            <span>Privacy</span>
                            <span>Terms of Service</span>
                            <span>&copy; 2026 Brightfield Studio</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
