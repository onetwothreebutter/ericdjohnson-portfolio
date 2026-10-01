"use client";

import { useState, type CSSProperties } from "react";
import clsx from "clsx";
import ArtCanvas from "./ArtCanvas";
import { STEP_COUNT } from "./art";
import s from "./brightfield.module.css";

const STEPS = Array.from({ length: STEP_COUNT }, (_, i) => i);

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
    return (
        <div className={s.row}>
            <span id={id}>{label}</span>
            <span className={s.steps} role="group" aria-labelledby={id}>
                {STEPS.map((i) => (
                    <button
                        key={i}
                        type="button"
                        className={s.step}
                        aria-label={`${label} ${i + 1} of ${STEP_COUNT}`}
                        aria-pressed={value === i}
                        onClick={() => onChange(i)}
                        style={
                            {
                                "--bar-width": `${kind === "width" ? 1 + i * 1.1 : 1.5}px`,
                                "--bar-gap": `${kind === "width" ? 2 : 1.5 + i * 1.2}px`,
                            } as CSSProperties
                        }
                    >
                        <span />
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
                        <div className={s.panel}>
                            <div className={s.row}>
                                <span className={s.swatches} aria-hidden="true">
                                    <i style={{ background: "#d8432b" }} />
                                    <i style={{ background: "#e07a3a" }} />
                                    <i style={{ background: "#3f9a8c" }} />
                                    <i style={{ background: "#cfc4c4" }} />
                                </span>
                                <span>Coastal</span>
                            </div>
                        </div>

                        <p className={s.overline}>Code settings</p>
                        <div className={s.panel}>
                            <StepControl id="bf-line-width" label="Line Width" kind="width" value={width} onChange={setWidth} />
                            <StepControl id="bf-line-spacing" label="Line Spacing" kind="spacing" value={gap} onChange={setGap} />
                        </div>

                        <p className={s.overline}>Effects</p>
                        <div className={s.panel}>
                            <button type="button" className={s.effect} aria-pressed={distress} onClick={() => setDistress((v) => !v)}>
                                <i className={s.iconDistress} />
                                Distress
                            </button>
                            <button type="button" className={s.effect} aria-pressed={crosshatch} onClick={() => setCrosshatch((v) => !v)}>
                                <i className={s.iconCrosshatch} />
                                Crosshatch
                            </button>
                            <button type="button" className={s.effect} aria-pressed={halftone} onClick={() => setHalftone((v) => !v)}>
                                <i className={s.iconHalftone} />
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
