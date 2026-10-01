"use client";

import { useState, type CSSProperties } from "react";
import clsx from "clsx";
import Image from "next/image";
import ArtCanvas from "./ArtCanvas";
import s from "./brightfield.module.css";

// Icon measurements from the Figma controls: bar widths for Line Width, gap between the two bars for Line Spacing.
const LINE_WIDTHS = [1, 3, 5, 7, 11, 13, 16, 20];
const LINE_GAPS = [3, 4, 5, 6, 8, 9, 12];
const SWATCHES = ["#e8491d", "#c9a030", "#2d8a5e", "#1a2744", "#d9d9d9"];
const ICONS = "/images/work-ive-done/brightfield-redesign";

function StepControl({
    id,
    label,
    kind,
    value,
    onChange,
}: {
    id: string;
    label: string;
    kind: "width" | "spacing";
    value: number;
    onChange: (next: number) => void;
}) {
    const icons = kind === "width" ? LINE_WIDTHS : LINE_GAPS;
    return (
        <div className={s.row}>
            <span id={id}>{label}</span>
            <span className={clsx(s.steps, kind === "spacing" && s.stepsSpacing)} role="group" aria-labelledby={id}>
                {icons.map((n, i) => (
                    <button
                        key={i}
                        type="button"
                        className={s.step}
                        aria-label={`${label} ${i + 1} of ${icons.length}`}
                        aria-pressed={value === i}
                        onClick={() => onChange(i)}
                        style={{ "--n": n } as CSSProperties}
                    >
                        <i />
                        {kind === "spacing" && <i />}
                    </button>
                ))}
            </span>
        </div>
    );
}

/** Working version of the redesign's "Now, craft your own" section. */
export default function CraftYourOwn() {
    const [width, setWidth] = useState(0);
    const [gap, setGap] = useState(0);
    const [distress, setDistress] = useState(false);
    const [crosshatch, setCrosshatch] = useState(false);
    const [halftone, setHalftone] = useState(false);
    const [onShirt, setOnShirt] = useState(false);

    return (
        <div className={s.frame}>
            <div className={clsx(s.stage, s.craft)}>
                <div className={s.sectionHeading}>
                    <h3>
                        Now, craft your own<span className={s.dot}>.</span>
                    </h3>
                    <p>Create and discover your own design by playing with creative code.</p>
                </div>
                <div className={s.craftBody}>
                    <div className={clsx(s.canvasBox, onShirt && s.onShirt)}>
                        {onShirt && (
                            <svg className={s.tee} viewBox="0 0 200 220" aria-hidden="true">
                                <path
                                    d="M62 8c8 12 24 18 38 18s30-6 38-18l48 22 12 44-30 12-10-18v144H42V68L32 86 2 74 14 30z"
                                    fill="#1e1b1b"
                                    stroke="#372e2e"
                                    strokeWidth="1.5"
                                />
                            </svg>
                        )}
                        <ArtCanvas
                            kind="square-dance"
                            width={width}
                            gap={gap}
                            distress={distress}
                            crosshatch={crosshatch}
                            halftone={halftone}
                            label="Preview of the design with the current settings"
                        />
                    </div>
                    <div className={s.controls}>
                        <p className={s.overline}>Colors</p>
                        <div className={clsx(s.panel, s.panelColors)}>
                            <div className={s.row}>
                                <span className={s.swatches} aria-hidden="true">
                                    {SWATCHES.map((color) => (
                                        <i key={color} style={{ background: color }} />
                                    ))}
                                </span>
                                <span className={s.palette}>
                                    Coastal
                                    <svg viewBox="0 0 13 11" aria-hidden="true">
                                        <path d="M0 0h13L6.5 11z" fill="currentColor" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <p className={s.overline}>Code settings</p>
                        <div className={clsx(s.panel, s.panelSettings)}>
                            <StepControl id="bf-line-width" label="Line Width" kind="width" value={width} onChange={setWidth} />
                            <StepControl id="bf-line-spacing" label="Line Spacing" kind="spacing" value={gap} onChange={setGap} />
                        </div>

                        <p className={s.overline}>Effects</p>
                        <div className={clsx(s.panel, s.panelEffects)}>
                            <button type="button" className={s.effect} aria-pressed={distress} onClick={() => setDistress((v) => !v)}>
                                <Image src={`${ICONS}/effect-distress.svg`} alt="" width={43} height={39} />
                                Distress
                            </button>
                            <button type="button" className={s.effect} aria-pressed={crosshatch} onClick={() => setCrosshatch((v) => !v)}>
                                <Image src={`${ICONS}/effect-crosshatch.svg`} alt="" width={43} height={39} />
                                Crosshatch
                            </button>
                            <button type="button" className={s.effect} aria-pressed={halftone} onClick={() => setHalftone((v) => !v)}>
                                <Image src={`${ICONS}/effect-halftone.svg`} alt="" width={43} height={43} />
                                Halftone dots
                            </button>
                        </div>

                        <button type="button" className={s.previewButton} aria-pressed={onShirt} onClick={() => setOnShirt((v) => !v)}>
                            {onShirt ? "Back to canvas" : "Preview on shirt"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
