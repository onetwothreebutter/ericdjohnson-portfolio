import clsx from "clsx";
import Image from "next/image";
import ArtCanvas from "./ArtCanvas";
import s from "./brightfield.module.css";

/**
 * Static recreations of the redesigned Brightfield homepage sections.
 * Each one is presented as a single image to assistive tech (role="img" + inert).
 */

function Wordmark() {
    return (
        <div className={s.wordmark}>
            <b>bright</b>
            <b>field</b>
        </div>
    );
}

export function HeroMockup() {
    return (
        <div
            className={s.frame}
            role="img"
            aria-label="Hero section: a full-bleed orange shader render with the headline Art for your body, the line Sculpted with code by a human, and Shop and Create buttons."
        >
            <div className={clsx(s.stage, s.hero)} inert>
                <Image src="/images/work-ive-done/brightfield-redesign/hero.jpg" alt="" fill sizes="(min-width: 1024px) 1024px, 100vw" className={s.heroArt} />
                <div className={s.heroNav}>
                    <Wordmark />
                    <div className={s.heroLinks}>
                        <span>APPAREL</span>
                        <span>ABOUT</span>
                        <span>CONTACT</span>
                        <span className={s.heroIcons}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10" cy="10" r="7" />
                                <path d="M15.5 15.5 22 22" />
                            </svg>
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4 8h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
                                <path d="M8 9V6a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </span>
                    </div>
                </div>
                <div className={s.heroCopy}>
                    <div className={s.heroBig}>ART</div>
                    <div className={s.heroMid}>FOR YOUR BODY</div>
                    <div className={s.heroLead}>Sculpted with code by a human</div>
                    <div className={s.heroButtons}>
                        <span className={clsx(s.btn, s.btnSolid)}>Shop</span>
                        <span className={s.btn}>Create</span>
                    </div>
                </div>
            </div>
        </div>
    );
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
    "Line Test",
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
                <div className={s.sectionHeading}>
                    <h3>
                        The designs<span className={s.dot}>.</span>
                    </h3>
                    <p>Original designs crafted and discovered through playing with creative code.</p>
                </div>
                <div className={s.grid}>
                    {DESIGNS.map((name) => (
                        <div key={name} className={s.card}>
                            <ArtCanvas kind="square-dance" lift={0.07} />
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
            <div className={clsx(s.stage, s.ending)} inert>
                <div className={s.notify}>
                    <h3>
                        Get notified about new designs<span className={s.dot}>.</span>
                    </h3>
                    <p>I release new art each month. Sign up, and I&rsquo;ll let you know when something new arrives.</p>
                    <div className={s.form}>
                        <span className={s.field}>Email address</span>
                        <span className={s.btn}>Sign up</span>
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
