'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { vec4, vec2, vec3, uv, float, Fn, uniform, fract, smoothstep, step, mix, length, abs, floor, texture, Loop, Break, If, select, min } from 'three/tsl';
import { useMemo, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';

const FONTS: Record<string, string> = {
    'Monospace':      'monospace',
    'Roboto Mono':    'Roboto Mono',
    'Space Mono':     'Space Mono',
    'Courier Prime':  'Courier Prime',
    'Share Tech Mono':'Share Tech Mono',
    'Oswald':         'Oswald',
    'Anton':          'Anton',
    'Black Han Sans': 'Black Han Sans',
    'Bebas Neue':     'Bebas Neue',
    'Ultra':          'Ultra',
};

const GOOGLE_FONTS = Object.keys(FONTS).filter(k => k !== 'Monospace');

export function NumberDot(props: any) {
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        grid:        { value: new THREE.Vector4(10, 6, 0.35, 0.5) },    // cols, rows, radius, bandHeight
        colBgColor:  { value: new THREE.Vector3(0.10, 0.10, 0.12) },
        rowBandColor:{ value: new THREE.Vector3(1.0,  1.0,  1.0)  },
        dotColor:    { value: new THREE.Vector3(1.0,  1.0,  1.0)  },
        params:      { value: new THREE.Vector4(1.0, 0.0, 1.0, 0.35) }, // maskEnabled, bandOffset, shadowDark, dotZ
        light:       { value: new THREE.Vector4(0.5, 1.5, 3.0, 8.0) }, // x_uv, y_uv, z_grid, softness_k
        lightExt:    { value: new THREE.Vector2(1.0, 0.0) },            // x = area light disc radius (grid units)
    }), []);

    const textTexture = useState(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        return new THREE.CanvasTexture(canvas);
    })[0];

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
        document.head.appendChild(link);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [digits, setDigits] = useState({ d1: 7, d2: 3, font: 'monospace' });

    useEffect(() => {
        const canvas = textTexture.image as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.floor(canvas.height * 0.85)}px ${digits.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${digits.d1}${digits.d2}`, canvas.width / 2, canvas.height / 2);
        textTexture.needsUpdate = true;
    }, [textTexture, digits]);

    useControls('Number Dot', () => ({
        cols:        { value: 10,   min: 1,    max: 80,   step: 1,     onChange: (v: number) => uniforms.grid.value.setX(v) },
        radius:      { value: 0.35, min: 0.01, max: 0.49, step: 0.005, onChange: (v: number) => uniforms.grid.value.setZ(v) },
        bandHeight:  { value: 0.5,  min: 0.0,  max: 1.0,  step: 0.01,  label: 'Row Band Height', onChange: (v: number) => uniforms.grid.value.setW(v) },
        bandOffset:  { value: 0.0,  min: -0.5, max: 0.5,  step: 0.005, label: 'Row Band Offset', onChange: (v: number) => uniforms.params.value.setY(v) },
        colBgColor:  { value: '#1a1a1f', label: 'Col BG',   onChange: (v: string) => { const c = new THREE.Color(v); uniforms.colBgColor.value.set(c.r, c.g, c.b); } },
        rowBandColor:{ value: '#ffffff', label: 'Row Band',  onChange: (v: string) => { const c = new THREE.Color(v); uniforms.rowBandColor.value.set(c.r, c.g, c.b); } },
        dotColor:    { value: '#ffffff', label: 'Dot Color', onChange: (v: string) => { const c = new THREE.Color(v); uniforms.dotColor.value.set(c.r, c.g, c.b); } },
        lightX:      { value: 0.5,  min: -0.5, max: 1.5,  step: 0.01,  label: 'Light X',       onChange: (v: number) => uniforms.light.value.setX(v) },
        lightY:      { value: 1.5,  min: -0.5, max: 2.5,  step: 0.01,  label: 'Light Y',       onChange: (v: number) => uniforms.light.value.setY(v) },
        lightZ:      { value: 3.0,  min: 0.1,  max: 20.0, step: 0.1,   label: 'Light Z',       onChange: (v: number) => uniforms.light.value.setZ(v) },
        lightRadius: { value: 1.0,  min: 0.0,  max: 5.0,  step: 0.05,  label: 'Light Radius',  onChange: (v: number) => uniforms.lightExt.value.setX(v) },
        softness:    { value: 8.0,  min: 1.0,  max: 32.0, step: 0.5,   label: 'Softness',      onChange: (v: number) => uniforms.light.value.setW(v) },
        darkness:    { value: 1.0,  min: 0.0,  max: 1.0,  step: 0.01,  label: 'Shadow Dark',   onChange: (v: number) => uniforms.params.value.setZ(v) },
        dotZ:        { value: 0.35, min: -1.0, max: 2.0,  step: 0.01,  label: 'Dot Z',         onChange: (v: number) => uniforms.params.value.setW(v) },
        digit1:      { value: 7, min: 0, max: 9, step: 1, label: 'Digit 1', onChange: (v: number) => setDigits(prev => ({ ...prev, d1: Math.round(v) })) },
        digit2:      { value: 3, min: 0, max: 9, step: 1, label: 'Digit 2', onChange: (v: number) => setDigits(prev => ({ ...prev, d2: Math.round(v) })) },
        font:        { value: 'Monospace', label: 'Font', options: Object.keys(FONTS), onChange: (v: string) => setDigits(prev => ({ ...prev, font: FONTS[v] })) },
        maskEnabled: { value: true, label: 'Text Mask', onChange: (v: boolean) => uniforms.params.value.setX(v ? 1.0 : 0.0) },
    }));

    useFrame(({ viewport: vp }) => {
        const cols = uniforms.grid.value.x;
        uniforms.grid.value.setY(Math.round(cols * vp.height / vp.width));
    });

    const material = useMemo(() => {
        const gridNode         = uniform(uniforms.grid.value);
        const colBgColorNode   = uniform(uniforms.colBgColor.value);
        const rowBandColorNode = uniform(uniforms.rowBandColor.value);
        const dotColorNode     = uniform(uniforms.dotColor.value);
        const paramsNode       = uniform(uniforms.params.value);
        const lightNode        = uniform(uniforms.light.value);
        const lightExtNode     = uniform(uniforms.lightExt.value);

        // Shadow ray march toward a single light sample position.
        // Defined as a helper so it can be called 4× (area light disc samples) from main.
        // Each dot is a sphere: center = (cellCenter.xy, paramsNode.w), radius = gridNode.z.
        const shadowRay = Fn(([ro, lightTarget, cellIDp, dotMaskp]: any[]) => {
            const toLight = lightTarget.sub(ro);
            const tMax    = length(toLight).max(float(0.001));
            const rd      = toLight.div(tMax);

            const shadow = float(1.0).toVar();
            const t      = float(0.5).toVar();

            Loop(32, () => {
                If(t.greaterThanEqual(tMax), () => { Break(); });

                const p3D   = ro.add(rd.mul(t));
                const pCell = floor(vec2(p3D.x, p3D.y));

                const minSDF = float(999.0).toVar();
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const nCell   = pCell.add(vec2(dx, dy));
                        const inB     = nCell.x.greaterThanEqual(float(0.0))
                            .and(nCell.x.lessThan(gridNode.x))
                            .and(nCell.y.greaterThanEqual(float(0.0)))
                            .and(nCell.y.lessThan(gridNode.y));
                        const nCellUV = nCell.add(0.5).div(vec2(gridNode.x, gridNode.y));
                        const nSample = step(float(0.5), texture(textTexture, nCellUV).r);
                        // Skip origin cell only for dot pixels to avoid self-shadowing;
                        // floor pixels in the origin cell still see the shadow at the dot's base.
                        const isOrigin = abs(nCell.x.sub(cellIDp.x)).lessThan(float(0.5))
                            .and(abs(nCell.y.sub(cellIDp.y)).lessThan(float(0.5)));
                        const skipSelf = isOrigin.and(dotMaskp.greaterThan(float(0.5)));
                        const nHasDot  = select(skipSelf, float(0.0),
                            select(inB, mix(float(1.0), nSample, paramsNode.x), float(0.0)));
                        const nCtr  = vec3(nCell.x.add(0.5), nCell.y.add(0.5), paramsNode.w);
                        const nSDF  = length(p3D.sub(nCtr)).sub(gridNode.z);
                        minSDF.assign(min(minSDF, select(nHasDot.greaterThan(float(0.5)), nSDF, float(999.0))));
                    }
                }

                If(minSDF.lessThan(float(0.0)), () => {
                    shadow.assign(float(0.0));
                    Break();
                });

                shadow.assign(min(shadow, lightNode.w.mul(minSDF).div(t)));
                t.addAssign(minSDF.clamp(float(0.02), float(1.0)));
            });

            return shadow;
        });

        const main = Fn(() => {
            const uvCoord    = uv();
            const scaledUV   = vec2(uvCoord.x.mul(gridNode.x), uvCoord.y.mul(gridNode.y));
            const cellID     = floor(scaledUV);
            const cellUV     = fract(scaledUV);
            const centeredUV = cellUV.sub(0.5);

            const aa = float(0.005);

            // Row band
            const bandHalf = gridNode.w.mul(0.5);
            const bandMask = smoothstep(bandHalf.add(aa), bandHalf.sub(aa), abs(centeredUV.y.sub(paramsNode.y)));

            // Dot
            const d      = length(centeredUV).sub(gridNode.z);
            const inside = float(1).sub(smoothstep(aa.negate(), aa, d));

            // Text mask
            const cellCenterUV = cellID.add(0.5).div(vec2(gridNode.x, gridNode.y));
            const textSample   = step(float(0.5), texture(textTexture, cellCenterUV).r);
            const dotMask      = mix(inside, inside.mul(textSample), paramsNode.x);

            // --- Area light: 4 samples on a disc in the XY plane ---
            //
            // Sample positions are at 45°/135°/225°/315° on a disc of radius lightRadius.
            // Diagonal offsets avoid aliasing with the grid axes.
            // When lightRadius=0 all 4 samples collapse to the center → point light behavior.
            //
            // Shadow for each sample is computed with a full 3D sphere-trace (32 steps,
            // 3×3 neighborhood). The 4 results are averaged: pixels in the umbra (all 4
            // blocked) are fully dark; pixels in the penumbra (partially blocked) fade
            // proportionally to how much of the disc is visible.

            const ro3D = vec3(scaledUV.x, scaledUV.y, float(0.001));
            const lx   = lightNode.x.mul(gridNode.x);
            const ly   = lightNode.y.mul(gridNode.y);
            const lz   = lightNode.z;
            const lr   = lightExtNode.x.mul(0.707); // 0.707 so magnitude = lightRadius

            const shadow = shadowRay(ro3D, vec3(lx.add(lr),  ly.add(lr),  lz), cellID, dotMask)
                    .add(shadowRay(ro3D, vec3(lx.sub(lr),  ly.add(lr),  lz), cellID, dotMask))
                    .add(shadowRay(ro3D, vec3(lx.sub(lr),  ly.sub(lr),  lz), cellID, dotMask))
                    .add(shadowRay(ro3D, vec3(lx.add(lr),  ly.sub(lr),  lz), cellID, dotMask))
                    .mul(float(0.25));

            const shadowStrength = float(1.0).sub(shadow.clamp(float(0.0), float(1.0))).mul(paramsNode.z);

            // Compose: col bg → row band → dot → shadow
            const color        = mix(colBgColorNode, rowBandColorNode, bandMask);
            const colorWithDot = mix(color, dotColorNode, dotMask);
            const colorFinal   = colorWithDot.mul(float(1.0).sub(shadowStrength));

            return vec4(colorFinal, 1.0);
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        mat.transparent = true;
        return mat;
    }, [uniforms, textTexture]);

    return (
        <mesh {...props}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
