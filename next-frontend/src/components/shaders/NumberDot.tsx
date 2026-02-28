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
        lightX:      { value: 0.5,  min: -0.5, max: 1.5,  step: 0.01,  label: 'Light X',     onChange: (v: number) => uniforms.light.value.setX(v) },
        lightY:      { value: 1.5,  min: -0.5, max: 2.5,  step: 0.01,  label: 'Light Y',     onChange: (v: number) => uniforms.light.value.setY(v) },
        lightZ:      { value: 3.0,  min: 0.1,  max: 20.0, step: 0.1,   label: 'Light Z',     onChange: (v: number) => uniforms.light.value.setZ(v) },
        softness:    { value: 8.0,  min: 1.0,  max: 32.0, step: 0.5,   label: 'Softness',    onChange: (v: number) => uniforms.light.value.setW(v) },
        darkness:    { value: 1.0,  min: 0.0,  max: 1.0,  step: 0.01,  label: 'Shadow Dark', onChange: (v: number) => uniforms.params.value.setZ(v) },
        dotZ:        { value: 0.35, min: -1.0, max: 2.0,  step: 0.01,  label: 'Dot Z',       onChange: (v: number) => uniforms.params.value.setW(v) },
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

            // Dot (2D top-down view of each sphere)
            const d      = length(centeredUV).sub(gridNode.z);
            const inside = float(1).sub(smoothstep(aa.negate(), aa, d));

            // Text mask
            const cellCenterUV = cellID.add(0.5).div(vec2(gridNode.x, gridNode.y));
            const textSample   = step(float(0.5), texture(textTexture, cellCenterUV).r);
            const dotMask      = mix(inside, inside.mul(textSample), paramsNode.x);

            // --- 3D ray-marched soft shadow (IQ formula: k*h/t) ---
            //
            // Each dot is a sphere sitting on the z=0 floor plane:
            //   center  = (cell_center_x, cell_center_y, dot_radius)
            //   radius  = gridNode.z  (same as 2D dot radius, in grid units)
            //
            // The ray originates from the surface point (x, y, 0) and travels
            // toward the 3D light position. We sphere-trace the 3D scene, checking
            // the 3×3 neighborhood of cells at each step (JS loop = compile-time
            // unroll → 9 texture samples + 9 sphere SDFs per step).

            const lightPos = vec3(lightNode.x.mul(gridNode.x), lightNode.y.mul(gridNode.y), lightNode.z);
            const ro3D     = vec3(scaledUV.x, scaledUV.y, float(0.001));
            const toLight  = lightPos.sub(ro3D);
            const tMax     = length(toLight).max(float(0.001));
            const rd3D     = toLight.div(tMax);

            const shadow = float(1.0).toVar();
            const t      = float(0.5).toVar(); // start past own sphere to avoid self-intersection

            Loop(64, () => {
                If(t.greaterThanEqual(tMax), () => { Break(); });

                const p3D   = ro3D.add(rd3D.mul(t));
                const pCell = floor(vec2(p3D.x, p3D.y));

                // Minimum SDF across 3×3 neighborhood — JS unroll at compile time
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
                        // Skip the origin cell only when the current pixel is ON a dot.
                        // Floor pixels in the origin cell should still see the shadow cast
                        // by the origin dot (shadow pool at its base and extending outward).
                        const isOrigin  = abs(nCell.x.sub(cellID.x)).lessThan(float(0.5))
                            .and(abs(nCell.y.sub(cellID.y)).lessThan(float(0.5)));
                        const skipSelf  = isOrigin.and(dotMask.greaterThan(float(0.5)));
                        const nHasDot = select(skipSelf, float(0.0),
                            select(inB, mix(float(1.0), nSample, paramsNode.x), float(0.0)));
                        // Sphere center: cell center XY, z controlled by dotZ param
                        const nCtr    = vec3(nCell.x.add(0.5), nCell.y.add(0.5), paramsNode.w);
                        const nSDF    = length(p3D.sub(nCtr)).sub(gridNode.z);
                        // Cells without dots contribute +inf (no occlusion)
                        minSDF.assign(min(minSDF, select(nHasDot.greaterThan(float(0.5)), nSDF, float(999.0))));
                    }
                }

                // Hard shadow: ray passed through the interior of a sphere
                If(minSDF.lessThan(float(0.0)), () => {
                    shadow.assign(float(0.0));
                    Break();
                });

                // Soft shadow: IQ formula — penumbra from near-misses
                // small k*h/t when ray nearly grazes a sphere → dark penumbra
                shadow.assign(min(shadow, lightNode.w.mul(minSDF).div(t)));

                // Sphere-trace: step by true minimum SDF, capped to 1 grid unit
                // so we never skip over a cell that might contain a sphere
                t.addAssign(minSDF.clamp(float(0.02), float(1.0)));
            });

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
