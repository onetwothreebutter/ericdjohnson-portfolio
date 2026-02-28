'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { vec4, vec3, vec2, uv, float, Fn, uniform, fract, smoothstep, mix, length, abs, floor, texture } from 'three/tsl';
import { useMemo, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useControls } from 'leva';

export function NumberDot(props: any) {
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        grid:        { value: new THREE.Vector4(10, 6, 0.35, 0.5) }, // cols, rows, radius, bandHeight
        colBgColor:  { value: new THREE.Vector3(0.10, 0.10, 0.12) },
        rowBandColor:{ value: new THREE.Vector3(0.22, 0.22, 0.28) },
        dotColor:    { value: new THREE.Vector3(1.0,  1.0,  1.0)  },
        params:      { value: new THREE.Vector2(1.0, 0.0) },        // x = maskEnabled
    }), []);

    // Stable canvas texture — object identity never changes, only content
    const textTexture = useState(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        return new THREE.CanvasTexture(canvas);
    })[0];

    const [textConfig, setTextConfig] = useState({ text: '7', fontFamily: 'monospace' });

    // Redraw glyph whenever text config changes
    useEffect(() => {
        const canvas = textTexture.image as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = `bold ${Math.floor(canvas.height * 0.85)}px ${textConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textConfig.text, canvas.width / 2, canvas.height / 2);
        textTexture.needsUpdate = true;
    }, [textTexture, textConfig]);

    useControls('Number Dot', () => ({
        cols:        { value: 10,   min: 1,    max: 80,   step: 1,     onChange: (v: number) => uniforms.grid.value.setX(v) },
        radius:      { value: 0.35, min: 0.01, max: 0.49, step: 0.005, onChange: (v: number) => uniforms.grid.value.setZ(v) },
        bandHeight:  { value: 0.5,  min: 0.0,  max: 1.0,  step: 0.01,  label: 'Row Band Height', onChange: (v: number) => uniforms.grid.value.setW(v) },
        colBgColor:  { value: '#1a1a1f', label: 'Col BG',      onChange: (v: string) => { const c = new THREE.Color(v); uniforms.colBgColor.value.set(c.r, c.g, c.b); } },
        rowBandColor:{ value: '#383840', label: 'Row Band',     onChange: (v: string) => { const c = new THREE.Color(v); uniforms.rowBandColor.value.set(c.r, c.g, c.b); } },
        dotColor:    { value: '#ffffff', label: 'Dot Color',    onChange: (v: string) => { const c = new THREE.Color(v); uniforms.dotColor.value.set(c.r, c.g, c.b); } },
        text:        { value: '7',    label: 'Text',       onChange: (v: string)  => setTextConfig(prev => ({ ...prev, text: v })) },
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

        const main = Fn(() => {
            const uvCoord    = uv();
            const scaledUV   = vec2(uvCoord.x.mul(gridNode.x), uvCoord.y.mul(gridNode.y));
            const cellID     = floor(scaledUV);
            const cellUV     = fract(scaledUV);
            const centeredUV = cellUV.sub(0.5);

            const aa = float(0.005);

            // Row band — horizontal stripe, height controlled by gridNode.w
            const bandHalf = gridNode.w.mul(0.5);
            const bandMask = smoothstep(bandHalf.add(aa), bandHalf.sub(aa), abs(centeredUV.y));

            // Circular SDF dot — cells are square so no aspect correction needed
            const dist   = length(centeredUV);
            const d      = dist.sub(gridNode.z);
            const inside = float(1).sub(smoothstep(aa.negate(), aa, d));

            // Text mask — sample canvas texture at cell CENTER so all pixels in a cell
            // get the same texel value (inside or outside the glyph)
            const cellCenterUV = cellID.add(0.5).div(vec2(gridNode.x, gridNode.y));
            const textSample   = texture(textTexture, cellCenterUV).r;
            const dotMask      = mix(inside, inside.mul(textSample), paramsNode.x);

            // Compose: col bg → row band → dot
            const color        = mix(colBgColorNode, rowBandColorNode, bandMask);
            const colorWithDot = mix(color, dotColorNode, dotMask);

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
