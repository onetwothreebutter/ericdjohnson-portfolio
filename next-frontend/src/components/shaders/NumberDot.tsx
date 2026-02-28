'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { vec4, vec2, uv, float, Fn, uniform, fract, smoothstep, mix, length, abs, floor, texture } from 'three/tsl';
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
        grid:        { value: new THREE.Vector4(10, 6, 0.35, 0.5) }, // cols, rows, radius, bandHeight
        colBgColor:  { value: new THREE.Vector3(0.10, 0.10, 0.12) },
        rowBandColor:{ value: new THREE.Vector3(1.0,  1.0,  1.0)  },
        dotColor:    { value: new THREE.Vector3(1.0,  1.0,  1.0)  },
        params:      { value: new THREE.Vector2(1.0, 0.0) },        // x = maskEnabled, y = bandOffset
        shadow:      { value: new THREE.Vector4(0.04, -0.05, 0.04, 0.6) }, // offsetX, offsetY, blur, opacity
    }), []);

    // Stable canvas texture — object identity never changes, only content
    const textTexture = useState(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        return new THREE.CanvasTexture(canvas);
    })[0];

    // Load Google Fonts once on mount
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
        document.head.appendChild(link);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const [digits, setDigits] = useState({ d1: 7, d2: 3, font: 'monospace' });

    // Redraw glyph whenever digits/font change
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
        colBgColor:  { value: '#1a1a1f', label: 'Col BG',      onChange: (v: string) => { const c = new THREE.Color(v); uniforms.colBgColor.value.set(c.r, c.g, c.b); } },
        rowBandColor:  { value: '#ffffff', label: 'Row Band',      onChange: (v: string) => { const c = new THREE.Color(v); uniforms.rowBandColor.value.set(c.r, c.g, c.b); } },
        dotColor:      { value: '#ffffff', label: 'Dot Color',     onChange: (v: string) => { const c = new THREE.Color(v); uniforms.dotColor.value.set(c.r, c.g, c.b); } },
        shadowOpacity: { value: 0.6,  min: 0.0, max: 1.0,  step: 0.01,  label: 'Shadow Opacity', onChange: (v: number) => uniforms.shadow.value.setW(v) },
        shadowBlur:    { value: 0.04, min: 0.0, max: 0.15, step: 0.005, label: 'Shadow Blur',    onChange: (v: number) => uniforms.shadow.value.setZ(v) },
        shadowX:       { value: 0.04, min: -0.3, max: 0.3, step: 0.005, label: 'Shadow X',       onChange: (v: number) => uniforms.shadow.value.setX(v) },
        shadowY:       { value: -0.05, min: -0.3, max: 0.3, step: 0.005, label: 'Shadow Y',      onChange: (v: number) => uniforms.shadow.value.setY(v) },
        digit1:      { value: 7, min: 0, max: 9, step: 1, label: 'Digit 1', onChange: (v: number) => setDigits(prev => ({ ...prev, d1: Math.round(v) })) },
        digit2:      { value: 3, min: 0, max: 9, step: 1, label: 'Digit 2', onChange: (v: number) => setDigits(prev => ({ ...prev, d2: Math.round(v) })) },
        font:        { value: 'Monospace', label: 'Font', options: Object.keys(FONTS), onChange: (v: string) => setDigits(prev => ({ ...prev, font: FONTS[v] })) },
        maskEnabled: { value: true,   label: 'Text Mask',  onChange: (v: boolean) => uniforms.params.value.setX(v ? 1.0 : 0.0) },
    }));

    // Derive rows from cols + viewport so cells stay square
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
        const shadowNode       = uniform(uniforms.shadow.value);

        const main = Fn(() => {
            const uvCoord    = uv();
            const scaledUV   = vec2(uvCoord.x.mul(gridNode.x), uvCoord.y.mul(gridNode.y));
            const cellID     = floor(scaledUV);
            const cellUV     = fract(scaledUV);
            const centeredUV = cellUV.sub(0.5);

            const aa = float(0.005);

            // Row band — horizontal stripe, height controlled by gridNode.w, offset by paramsNode.y
            const bandHalf = gridNode.w.mul(0.5);
            const bandMask = smoothstep(bandHalf.add(aa), bandHalf.sub(aa), abs(centeredUV.y.sub(paramsNode.y)));

            // Circular SDF dot — cells are square so no aspect correction needed
            const dist   = length(centeredUV);
            const d      = dist.sub(gridNode.z);
            const inside = float(1).sub(smoothstep(aa.negate(), aa, d));

            // Text mask — sample canvas texture at cell CENTER so all pixels in a cell
            // get the same texel value (inside or outside the glyph)
            const cellCenterUV = cellID.add(0.5).div(vec2(gridNode.x, gridNode.y));
            const textSample   = texture(textTexture, cellCenterUV).r;
            const dotMask      = mix(inside, inside.mul(textSample), paramsNode.x);

            // Shadow — shift scaledUV by -shadowOffset before fract so the shadow can
            // cross cell boundaries and we find whichever dot is casting on this pixel
            const shadowScaledUV   = scaledUV.sub(vec2(shadowNode.x, shadowNode.y));
            const shadowCellID     = floor(shadowScaledUV);
            const shadowCenteredUV = fract(shadowScaledUV).sub(0.5);
            const shadowDist       = length(shadowCenteredUV).sub(gridNode.z);
            const shadowShape      = float(1).sub(smoothstep(float(0), shadowNode.z, shadowDist));

            // Gate shadow by whether the casting cell has a visible dot
            const shadowCellUV   = shadowCellID.add(0.5).div(vec2(gridNode.x, gridNode.y));
            const shadowSample   = texture(textTexture, shadowCellUV).r;
            const shadowCellMask = mix(float(1), shadowSample, paramsNode.x);
            const shadowStrength = shadowShape.mul(shadowNode.w).mul(shadowCellMask);

            // Compose: col bg → row band → shadow → dot
            const color           = mix(colBgColorNode, rowBandColorNode, bandMask);
            const colorWithShadow = color.mul(float(1).sub(shadowStrength));
            const colorWithDot    = mix(colorWithShadow, dotColorNode, dotMask);

            return vec4(colorWithDot, 1.0);
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
