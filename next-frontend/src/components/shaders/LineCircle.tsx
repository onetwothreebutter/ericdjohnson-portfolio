'use client';

import {
    Space_Mono,
    Roboto_Mono,
    Source_Code_Pro,
    JetBrains_Mono,
    IBM_Plex_Mono,
    Fira_Code,
    Inconsolata,
    Courier_Prime,
    Share_Tech_Mono,
    Cutive_Mono,
} from 'next/font/google';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import {
    vec3, vec2, vec4, uv, float, Fn, smoothstep, uniform,
    fract, mix, length, clamp, pow, texture,
} from 'three/tsl';
import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls, folder } from 'leva';
import { cosinePalette } from './tsl/utils/color/cosine_palette';

const spaceMono     = Space_Mono({ weight: '700',        subsets: ['latin'] });
const robotoMono    = Roboto_Mono({ weight: '700',        subsets: ['latin'] });
const sourceCodePro = Source_Code_Pro({ weight: '900',   subsets: ['latin'] });
const jetBrainsMono = JetBrains_Mono({ weight: '800',    subsets: ['latin'] });
const ibmPlexMono   = IBM_Plex_Mono({ weight: '700',     subsets: ['latin'] });
const firaCode      = Fira_Code({ weight: '700',          subsets: ['latin'] });
const inconsolata   = Inconsolata({ weight: '900',        subsets: ['latin'] });
const courierPrime  = Courier_Prime({ weight: '700',      subsets: ['latin'] });
const shareTechMono = Share_Tech_Mono({ weight: '400',   subsets: ['latin'] });
const cutiveMono    = Cutive_Mono({ weight: '400',        subsets: ['latin'] });

const fontMap = {
    'Space Mono':      spaceMono,
    'Roboto Mono':     robotoMono,
    'Source Code Pro': sourceCodePro,
    'JetBrains Mono':  jetBrainsMono,
    'IBM Plex Mono':   ibmPlexMono,
    'Fira Code':       firaCode,
    'Inconsolata':     inconsolata,
    'Courier Prime':   courierPrime,
    'Share Tech Mono': shareTechMono,
    'Cutive Mono':     cutiveMono,
};

const palettes = {
    'Cool Blue': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
    'Rainbow':   { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
    'Neon Heat': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
    'Cyberpunk': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
    'Golden':    { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

const CANVAS_SIZE = 2048;

export function LineCircle(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport, camera } = useThree();

    const uAspect     = useMemo(() => uniform(1.0), []);
    const uRadius     = useMemo(() => uniform(0.4), []);
    const uLineCount  = useMemo(() => uniform(20.0), []);
    const uPower      = useMemo(() => uniform(2.5), []);
    const uWidthTop   = useMemo(() => uniform(0.05), []);
    const uWidthBot   = useMemo(() => uniform(0.75), []);
    const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
    const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
    const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
    const uD = useMemo(() => uniform(new THREE.Vector3(0.263, 0.416, 0.557)), []);
    const uTextColor    = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
    const uOutlineColor = useMemo(() => uniform(new THREE.Vector3(0.0, 0.0, 0.0)), []);
    const uTextX        = useMemo(() => uniform(0.5), []);
    const uTextY        = useMemo(() => uniform(0.5), []);

    const [textTexture] = useState(() => new THREE.CanvasTexture(document.createElement('canvas')));

    const [controls, set] = useControls('Line Circle', () => ({
        'Shape Settings': folder({
            radius:    { value: 0.4,  min: 0.05, max: 0.5,  step: 0.01, onChange: (v: number) => { uRadius.value = v; } },
            lineCount: { value: 20,   min: 2,    max: 80,   step: 1,    onChange: (v: number) => { uLineCount.value = v; } },
            power:     { value: 2.5,  min: 0.5,  max: 6.0,  step: 0.1,  onChange: (v: number) => { uPower.value = v; } },
            widthTop:  { value: 0.05, min: 0.0,  max: 1.0,  step: 0.01, label: 'Line Width Top',    onChange: (v: number) => { uWidthTop.value = v; } },
            widthBot:  { value: 0.75, min: 0.0,  max: 1.0,  step: 0.01, label: 'Line Width Bottom', onChange: (v: number) => { uWidthBot.value = v; } },
            palette: {
                value: 'Cool Blue',
                options: Object.keys(palettes),
                onChange: (v: string) => {
                    const p = palettes[v as keyof typeof palettes];
                    if (!p) return;
                    set({ a: p.a, b: p.b, c: p.c, d: p.d });
                    uA.value.set(...(p.a as [number, number, number]));
                    uB.value.set(...(p.b as [number, number, number]));
                    uC.value.set(...(p.c as [number, number, number]));
                    uD.value.set(...(p.d as [number, number, number]));
                },
            },
            a: { value: [0.5, 0.5, 0.5],       onChange: (v: [number, number, number]) => uA.value.set(...v) },
            b: { value: [0.5, 0.5, 0.5],       onChange: (v: [number, number, number]) => uB.value.set(...v) },
            c: { value: [1.0, 1.0, 1.0],       onChange: (v: [number, number, number]) => uC.value.set(...v) },
            d: { value: [0.263, 0.416, 0.557], onChange: (v: [number, number, number]) => uD.value.set(...v) },
        }),
        'Text Settings': folder({
            text:           { value: 'HELLO',      label: 'Text' },
            fontFamily:     { value: 'Space Mono', options: Object.keys(fontMap), label: 'Font' },
            fontSize:       { value: 120, min: 8,   max: 300, step: 1,    label: 'Font Size' },
            textX:          { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: 'Text X' },
            textY:          { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: 'Text Y' },
            textColor:      { value: '#ffffff', label: 'Text Color', onChange: (v: string) => {
                const c = new THREE.Color(v); uTextColor.value.set(c.r, c.g, c.b);
            }},
            outlineEnabled: { value: false, label: 'Outline' },
            outlineWidth:   { value: 8, min: 1, max: 60, step: 1, label: 'Outline Width' },
            outlineColor:   { value: '#000000', label: 'Outline Color', onChange: (v: string) => {
                const c = new THREE.Color(v); uOutlineColor.value.set(c.r, c.g, c.b);
            }},
        }),
    }));

    const { text, fontFamily, fontSize, textX, textY, outlineEnabled, outlineWidth } = controls as any;

    // Draw text to canvas immediately — no setTimeout (see memory note)
    useEffect(() => {
        const canvas = textTexture.image as HTMLCanvasElement;
        canvas.width  = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        if (text) {
            const selectedFont = fontMap[fontFamily as keyof typeof fontMap];
            const cx = textX * CANVAS_SIZE;
            const cy = textY * CANVAS_SIZE;
            ctx.font = `${fontSize}px ${selectedFont.style.fontFamily}, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Outline pass — pure green channel so shader can color it independently.
            // Draw stroke before fill; fill covers the inner half of the stroke.
            if (outlineEnabled && outlineWidth > 0) {
                ctx.strokeStyle = 'rgb(0,255,0)';
                ctx.lineWidth = outlineWidth * 2; // double so visible outer half = outlineWidth
                ctx.lineJoin = 'round';
                ctx.strokeText(text, cx, cy);
            }

            // Fill pass — pure red channel.
            ctx.fillStyle = 'rgb(255,0,0)';
            ctx.fillText(text, cx, cy);
        }

        // Sync position uniforms here since textX/textY are plain state (not onChange)
        uTextX.value = textX;
        uTextY.value = textY;
        textTexture.needsUpdate = true;
    }, [text, fontFamily, fontSize, textX, textY, outlineEnabled, outlineWidth, textTexture]);

    const { width, height } = useMemo(() => {
        const cam = camera as THREE.PerspectiveCamera;
        if (!cam.isPerspectiveCamera) return { width: viewport.width, height: viewport.height };
        const distance = Math.abs(cam.position.z);
        const fov = (cam.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * distance;
        const w = h * (viewport.width / viewport.height);
        return { width: w, height: h };
    }, [camera, viewport]);

    useFrame(() => {
        uAspect.value = width / height;
    });

    const material = useMemo(() => {
        const main = Fn(() => {
            const uvCoord = uv();
            const centeredUV = uvCoord.sub(0.5);

            // Aspect-corrected circle SDF
            const correctedUV = vec2(centeredUV.x.mul(uAspect), centeredUV.y);
            const circleSDF = length(correctedUV).sub(uRadius);
            const aaEdge = float(0.002);
            const circleMask = float(1).sub(smoothstep(aaEdge.negate(), aaEdge, circleSDF));

            // t: 0 at top of circle, 1 at bottom
            const circleTop = float(0.5).add(uRadius);
            const t = clamp(
                circleTop.sub(uvCoord.y).div(uRadius.mul(float(2))),
                float(0),
                float(1),
            );

            // Power-warp t so line spacing compresses toward the bottom
            const warped = pow(t, uPower);

            // Repeating phase [0, 1) within each line cell
            const phase = fract(warped.mul(uLineCount));

            // Line fill fraction: thin at top, thick at bottom
            const lineWidth = mix(uWidthTop, uWidthBot, t);

            // 1 inside the filled stripe, 0 in the gap
            const aaLine = float(0.008);
            const lineMask = float(1).sub(smoothstep(lineWidth.sub(aaLine), lineWidth.add(aaLine), phase));

            // Cosine palette driven by vertical position
            const palColor = (cosinePalette as any)(t, uA, uB, uC, uD);

            // Circle + lines base output
            const base = palColor.mul(circleMask.mul(lineMask));

            // Text overlay: sample with aspect-corrected UV so glyphs appear
            // undistorted on non-square viewports. Scale the x delta from the
            // text anchor by uAspect to compress it back to square canvas space.
            const textAnchor = vec2(uTextX, uTextY);
            const textDelta  = uvCoord.sub(textAnchor);
            const textUV     = vec2(textDelta.x.mul(uAspect), textDelta.y).add(textAnchor);
            const texSample     = texture(textTexture, textUV);
            // R channel = fill, G channel = outline (drawn with pure color per channel)
            const fillSample    = smoothstep(float(0.05), float(0.6), texSample.r);
            const outlineSample = smoothstep(float(0.05), float(0.6), texSample.g);
            // Composite: outline first, fill on top
            const withOutline   = mix(base, uOutlineColor, outlineSample);
            const finalColor    = mix(withOutline, uTextColor, fillSample);

            return vec4(finalColor, float(1));
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        return mat;
    }, [uAspect, uRadius, uLineCount, uPower, uWidthTop, uWidthBot, uA, uB, uC, uD, uTextColor, uOutlineColor, uTextX, uTextY, textTexture]);

    return (
        <mesh ref={meshRef} {...props}>
            <planeGeometry args={[width, height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
