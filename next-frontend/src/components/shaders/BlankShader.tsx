'use client';

import {
    Space_Mono,
    Roboto_Mono,
    Source_Code_Pro,
    JetBrains_Mono,
    IBM_Plex_Mono,
} from 'next/font/google';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import {
    screenSize, vec3, vec2, vec4, uv, float, Fn, smoothstep, uniform,
    fract, floor, mix, sin, abs, max, texture,
} from 'three/tsl';
import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import { sdSphere } from './tsl/utils/sdf/shapes';
import { cosinePalette } from './tsl/utils/color/cosine_palette';

const spaceMono    = Space_Mono({ weight: '700', subsets: ['latin'] });
const robotoMono   = Roboto_Mono({ weight: '700', subsets: ['latin'] });
const sourceCodePro = Source_Code_Pro({ weight: '900', subsets: ['latin'] });
const jetBrainsMono = JetBrains_Mono({ weight: '800', subsets: ['latin'] });
const ibmPlexMono  = IBM_Plex_Mono({ weight: '700', subsets: ['latin'] });

const fontMap = {
    'Space Mono':     spaceMono,
    'Roboto Mono':    robotoMono,
    'Source Code Pro': sourceCodePro,
    'JetBrains Mono': jetBrainsMono,
    'IBM Plex Mono':  ibmPlexMono,
};

const palettes = {
    'Cool Blue': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
    'Rainbow':   { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
    'Neon Heat': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
    'Cyberpunk': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
    'Golden':    { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

export function BlankShader(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    const timeUniform      = useMemo(() => uniform(0), []);
    const uRowBandHeight   = useMemo(() => uniform(0.8), []);
    const uRowBandOffset   = useMemo(() => uniform(0.0), []);
    const uLightDir        = useMemo(() => uniform(new THREE.Vector2(Math.cos(Math.PI / 4), Math.sin(Math.PI / 4))), []);
    const uShadowLength    = useMemo(() => uniform(0.3), []);
    const uShadowSoftness  = useMemo(() => uniform(0.05), []);
    const uShadowIntensity = useMemo(() => uniform(0.5), []);

    // Stable canvas texture — content updated via useEffect, GPU re-upload via needsUpdate
    const [textTexture] = useState(() => new THREE.CanvasTexture(document.createElement('canvas')));

    const uniforms = useMemo(() => ({
        gridParams:  { value: new THREE.Vector3(10, 10, 0.35) },  // cols, rows, radius
        animParams:  { value: new THREE.Vector2(1.0, 0.1) },       // speed, pulseAmount
        dotColor:    { value: new THREE.Vector3(1, 1, 1) },
        bgColor:     { value: new THREE.Vector3(0, 0, 0) },
        rowBgColor:  { value: new THREE.Vector3(0.15, 0.15, 0.15) },
        a: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        b: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        c: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        d: { value: new THREE.Vector3(0.263, 0.416, 0.557) },
    }), []);

    const [controls, set] = useControls('SDF Dot Grid', () => ({
        mode:      { value: 'Solid', options: ['Solid', 'Glow', 'Ring'] },
        colorMode: { value: 'Flat',  options: ['Flat', 'Palette', 'Position'] },
        cols:   { value: 10,   min: 1,    max: 50,   step: 1,     onChange: (v: number) => uniforms.gridParams.value.setX(v) },
        rows:   { value: 10,   min: 1,    max: 50,   step: 1,     onChange: (v: number) => uniforms.gridParams.value.setY(v) },
        radius: { value: 0.35, min: 0.01, max: 0.49, step: 0.001, onChange: (v: number) => uniforms.gridParams.value.setZ(v) },
        animate:     { value: false },
        animSpeed:   { value: 1.0, min: 0.0, max: 5.0,  step: 0.01,  onChange: (v: number) => uniforms.animParams.value.setX(v) },
        pulseAmount: { value: 0.1, min: 0.0, max: 0.45, step: 0.001, onChange: (v: number) => uniforms.animParams.value.setY(v) },
        dotColor:    { value: '#ffffff', onChange: (v: string) => { const c = new THREE.Color(v); uniforms.dotColor.value.set(c.r, c.g, c.b); } },
        bgColor:     { value: '#000000', onChange: (v: string) => { const c = new THREE.Color(v); uniforms.bgColor.value.set(c.r, c.g, c.b); } },
        rowBgColor:  { value: '#262626', label: 'Row BG Color', onChange: (v: string) => { const c = new THREE.Color(v); uniforms.rowBgColor.value.set(c.r, c.g, c.b); } },
        rowBandHeight: { value: 0.8, min: 0.0, max: 1.0, step: 0.01, label: 'Row Band Height', onChange: (v: number) => { uRowBandHeight.value = v; } },
        rowBandOffset: { value: 0.0, min: -0.5, max: 0.5, step: 0.01, label: 'Row Band Y Offset', onChange: (v: number) => { uRowBandOffset.value = v; } },
        lightAngle:      { value: 45, min: 0, max: 360, step: 1, label: 'Light Angle', onChange: (v: number) => { const r = v * Math.PI / 180; uLightDir.value.set(Math.cos(r), Math.sin(r)); } },
        shadowLength:    { value: 0.3, min: 0.0, max: 5.0, step: 0.01, label: 'Shadow Length', onChange: (v: number) => { uShadowLength.value = v; } },
        shadowSoftness:  { value: 0.05, min: 0.0, max: 0.3, step: 0.005, label: 'Shadow Softness', onChange: (v: number) => { uShadowSoftness.value = v; } },
        shadowIntensity: { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: 'Shadow Intensity', onChange: (v: number) => { uShadowIntensity.value = v; } },
        palette: {
            value: 'Cool Blue',
            options: Object.keys(palettes),
            onChange: (v: string) => {
                const p = palettes[v as keyof typeof palettes];
                if (!p) return;
                set({ a: p.a, b: p.b, c: p.c, d: p.d });
                uniforms.a.value.set(...(p.a as [number, number, number]));
                uniforms.b.value.set(...(p.b as [number, number, number]));
                uniforms.c.value.set(...(p.c as [number, number, number]));
                uniforms.d.value.set(...(p.d as [number, number, number]));
            },
        },
        a: { value: [0.5, 0.5, 0.5],       onChange: (v: [number, number, number]) => uniforms.a.value.set(...v) },
        b: { value: [0.5, 0.5, 0.5],       onChange: (v: [number, number, number]) => uniforms.b.value.set(...v) },
        c: { value: [1.0, 1.0, 1.0],       onChange: (v: [number, number, number]) => uniforms.c.value.set(...v) },
        d: { value: [0.263, 0.416, 0.557], onChange: (v: [number, number, number]) => uniforms.d.value.set(...v) },
        // --- Text number controls ---
        value1:          { value: 1, min: 0, max: 9, step: 1, label: 'Number 1' },
        value2:          { value: 2, min: 0, max: 9, step: 1, label: 'Number 2' },
        fontFamily:      { value: 'Space Mono', options: Object.keys(fontMap), label: 'Font' },
        fontSize:        { value: 300, min: 50, max: 900, step: 10, label: 'Font Size' },
        textMaskEnabled: { value: true, label: 'Text Mask' },
    }));

    const { mode, colorMode, animate, value1, value2, fontFamily, fontSize, textMaskEnabled } = controls as any;

    // Render two numbers onto the canvas texture — left half: value1, right half: value2
    useEffect(() => {
        const canvas = textTexture.image as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 1024;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size, size);

        const selectedFont = fontMap[fontFamily as keyof typeof fontMap];
        ctx.fillStyle = 'white';
        ctx.font = `${fontSize}px ${selectedFont.style.fontFamily}, monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Each number is centered in its own half of the canvas
        ctx.fillText(String(value1 ?? ''), size * 0.25, size * 0.5);
        ctx.fillText(String(value2 ?? ''), size * 0.75, size * 0.5);

        textTexture.needsUpdate = true;
    }, [value1, value2, fontFamily, fontSize, textTexture]);

    useFrame(({ clock }) => {
        timeUniform.value = clock.getElapsedTime();
    });

    const material = useMemo(() => {
        const gridParamsNode = uniform(uniforms.gridParams.value);
        const animParamsNode = uniform(uniforms.animParams.value);
        const dotColorNode   = uniform(uniforms.dotColor.value);
        const bgColorNode    = uniform(uniforms.bgColor.value);
        const rowBgColorNode = uniform(uniforms.rowBgColor.value);
        const aNode = uniform(uniforms.a.value);
        const bNode = uniform(uniforms.b.value);
        const cNode = uniform(uniforms.c.value);
        const dNode = uniform(uniforms.d.value);

        const colsNode   = gridParamsNode.x;
        const rowsNode   = gridParamsNode.y;
        const baseRadius = gridParamsNode.z;

        const main = Fn(() => {
            const uvCoord = uv();
            const gridDims = vec2(colsNode, rowsNode);

            // Scale UV to grid, get cell ID and local UV
            const scaledUV = vec2(uvCoord.x.mul(colsNode), uvCoord.y.mul(rowsNode));
            const cellID   = floor(scaledUV);
            const cellUV   = fract(scaledUV);

            // Center cell UV: -0.5 to 0.5
            const centeredUV = cellUV.sub(0.5);

            // Correct aspect so dots are circular regardless of cols/rows or screen shape
            // cellAspect = (screenW / cols) / (screenH / rows) = screenW*rows / screenH*cols
            const cellAspect = screenSize.x.div(screenSize.y).mul(rowsNode).div(colsNode);
            const correctedUV = vec2(centeredUV.x.mul(cellAspect), centeredUV.y);

            // Optionally pulse the radius over time
            const radius = animate
                ? baseRadius.add(sin(timeUniform.mul(animParamsNode.x)).mul(animParamsNode.y))
                : baseRadius;

            // SDF circle: negative inside, positive outside
            const d = sdSphere(correctedUV, radius);

            // --- Dot color ---
            const dotCol = vec3(0).toVar();

            if (colorMode === 'Flat') {
                dotCol.assign(dotColorNode);
            } else if (colorMode === 'Palette') {
                // Color field scrolls diagonally over time
                const palT = uvCoord.x.add(uvCoord.y).add(timeUniform.mul(0.1));
                dotCol.assign((cosinePalette as any)(palT, aNode, bNode, cNode, dNode));
            } else if (colorMode === 'Position') {
                // Each cell gets a unique color based on its grid position
                const palT = cellID.x.div(colsNode).add(cellID.y.div(rowsNode)).mul(0.5);
                dotCol.assign((cosinePalette as any)(palT, aNode, bNode, cNode, dNode));
            }

            // --- Font mask: sample texture at cell center ---
            // Each dot cell samples its center point in the text texture.
            // White pixels (inside a glyph) let the dot through; black pixels suppress it.
            const cellCenterUv = cellID.add(0.5).div(gridDims);
            const textSample = texture(textTexture, cellCenterUv).r;

            // --- Row background band ---
            // Horizontal stripe spanning rowBandHeight of each row, composited between canvas bg and dots.
            const rowBandHalf = uRowBandHeight.mul(0.5);
            const aa = float(0.008);
            const bandMask = smoothstep(rowBandHalf.add(aa), rowBandHalf, abs(centeredUV.y.sub(uRowBandOffset)));

            // --- Dot shadow onto band ---
            // For each band pixel, shift toward the light and test if that position lands inside a dot.
            // If it does, this pixel is in shadow (the dot occludes the light above it).
            //
            // The shift is converted to global UV space so we can also look up which cell the
            // shadow-caster lives in and confirm an actual dot exists there (font mask check).
            // Without this, the SDF would report shadow even in cells where no dot is rendered.
            const shadowGlobalUV = uvCoord.add(
                vec2(uLightDir.x.div(colsNode), uLightDir.y.div(rowsNode)).mul(uShadowLength)
            );
            const shadowCasterCellID = floor(shadowGlobalUV.mul(gridDims));
            const shadowCasterCenterUV = shadowCasterCellID.add(0.5).div(gridDims);
            const shadowCasterSample = textMaskEnabled
                ? texture(textTexture, shadowCasterCenterUV).r
                : float(1);

            // Evaluate SDF in the shadow-caster cell's own local space so the shadow
            // correctly spans across cell boundaries.
            const shadowCasterLocalUV = fract(shadowGlobalUV.mul(gridDims)).sub(0.5);
            const shadowCasterCorrectedUV = vec2(shadowCasterLocalUV.x.mul(cellAspect), shadowCasterLocalUV.y);
            const shadowSdf = sdSphere(shadowCasterCorrectedUV, radius);
            const litValue = smoothstep(uShadowSoftness.negate(), uShadowSoftness, shadowSdf); // 0=in shadow, 1=lit

            // Suppress shadow where no real dot exists at the caster position
            const effectiveLitValue = max(litValue, float(1).sub(shadowCasterSample));
            const shadowFactor = mix(float(1).sub(uShadowIntensity), float(1), effectiveLitValue);
            const rowBgShadowed = rowBgColorNode.mul(shadowFactor);

            const bandedBg = mix(bgColorNode, rowBgShadowed, bandMask);

            // --- Render mode ---
            const finalColor = vec3(0).toVar();

            if (mode === 'Solid') {
                const inside = float(1).sub(smoothstep(aa.negate(), aa, d));
                const dotMask = textMaskEnabled ? inside.mul(textSample) : inside;
                finalColor.assign(mix(bandedBg, dotCol, dotMask));
            } else if (mode === 'Glow') {
                // Soft glow emanating from the circle surface outward
                const glowWidth = baseRadius.mul(0.8);
                const glow = float(1).sub(smoothstep(float(0), glowWidth, max(d, float(0))));
                const dotMask = textMaskEnabled ? glow.mul(textSample) : glow;
                finalColor.assign(mix(bandedBg, dotCol, dotMask));
            } else if (mode === 'Ring') {
                // Outline ring at the circle surface
                const ringThickness = baseRadius.mul(0.15);
                const ring = float(1).sub(smoothstep(ringThickness, ringThickness.add(aa), abs(d)));
                const dotMask = textMaskEnabled ? ring.mul(textSample) : ring;
                finalColor.assign(mix(bandedBg, dotCol, dotMask));
            }

            return vec4(finalColor, 1.0);
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        mat.transparent = true;
        return mat;
    }, [uniforms, mode, colorMode, animate, timeUniform, textTexture, textMaskEnabled]);

    return (
        <mesh ref={meshRef} {...props}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
