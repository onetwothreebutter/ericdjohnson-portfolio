'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { screenSize, color, time, vec2, uv, float, abs, Fn, sin, cos, PI, add, length, select, mix, oneMinus, vec3 } from 'three/tsl';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { complexDiv, complexLog } from './tsl/utils/math/complex';
import { grainTexturePattern } from './tsl/patterns/grain_texture_pattern';
import { useControls } from 'leva';
import { uniform, smoothstep } from 'three/tsl';
import { cosinePalette } from './tsl/utils/color/cosine_palette';

export function ImaginaryShader() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    const params = useMemo(() => ({ value: new THREE.Vector4(0.25, 0.25, 2.0, 0.5) }), []); // sep, speed, freq, lineWidth
    // Additional params for sync: x=a, y=b, z=c, w=d (bools/floats)
    const syncParams = useMemo(() => ({ value: new THREE.Vector4(0, 0, 0, 0) }), []);

    // Palette uniforms using Vectors
    const palette = useMemo(() => ({
        a: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        b: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        c: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        d: { value: new THREE.Vector3(0.263, 0.416, 0.557) },
    }), []);

    const { mode } = useControls({
        separation: { value: 0.25, min: 0.0, max: 1.0, onChange: (v: number) => params.value.x = v },
        speed: { value: 0.25, min: 0.0, max: 2.0, onChange: (v: number) => params.value.y = v },
        frequency: { value: 2.0, min: 0.1, max: 20.0, onChange: (v: number) => params.value.z = v },
        mode: { value: 'Smooth', options: ['Smooth', 'Lines'] },
        lineWidth: { value: 0.5, min: 0.01, max: 1.0, render: (get) => get('mode') === 'Lines', onChange: (v: number) => params.value.w = v },

        syncA: { value: false, onChange: (v: boolean) => syncParams.value.x = v ? 1 : 0 },
        syncB: { value: false, onChange: (v: boolean) => syncParams.value.y = v ? 1 : 0 },
        syncC: { value: false, onChange: (v: boolean) => syncParams.value.z = v ? 1 : 0 },
        syncD: { value: false, onChange: (v: boolean) => syncParams.value.w = v ? 1 : 0 },

        // Palette Controls
        a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => palette.a.value.set(...v) },
        b: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => palette.b.value.set(...v) },
        c: { value: [1.0, 1.0, 1.0], onChange: (v: [number, number, number]) => palette.c.value.set(...v) },
        d: { value: [0.263, 0.416, 0.557], onChange: (v: [number, number, number]) => palette.d.value.set(...v) },
    });

    const material = useMemo(() => {
        const paramsNode = uniform(params.value);
        const uSeparation = paramsNode.x;
        const uSpeed = paramsNode.y;
        const uFrequency = paramsNode.z;
        const uLineWidth = paramsNode.w;

        const syncNode = uniform(syncParams.value);
        const uSyncA = syncNode.x;
        const uSyncB = syncNode.y;
        const uSyncC = syncNode.z;
        const uSyncD = syncNode.w;

        const aNode = uniform(palette.a.value);
        const bNode = uniform(palette.b.value);
        const cNode = uniform(palette.c.value);
        const dNode = uniform(palette.d.value);

        const main = Fn(() => {
            // TSL functions need casting to any due to strict type inference issues
            const z = (screenAspectUV as any)(screenSize).toVar();
            const uv0 = (screenAspectUV as any)(screenSize).toVar();

            const l = uSeparation;
            const angle = PI.mul(1.25).add(time.mul(uSpeed));
            const s = sin(angle).toVar();
            const c = cos(angle).toVar();

            const p = vec2(s.mul(l), c.mul(l)).toVar();
            const q = vec2(s.mul(l.negate()), c.mul(l.negate())).toVar();

            const division = (complexDiv as any)(z.sub(p), z.sub(q));
            const logPOverQ = (complexLog as any)(division);
            const imaginary = logPOverQ.y.toVar();

            imaginary.assign(add(imaginary.mul(0.5), 0.5));
            imaginary.mulAssign(
                oneMinus(
                    length(add(z, vec2(-0.75, -0.5)))
                        .mul(0.5)
                        .add(sin(time.mul(0.1)).mul(0.1)),
                ),
            );
            imaginary.divAssign(PI.mul(0.5));

            const finalColor = vec3(0).toVar();

            const phase = imaginary.mul(uFrequency);

            // Sync logic
            // A, B, C oscillate: val + sin(angle * 4.0) * 0.2
            // Multiplexed by sector (0-120, 120-240, 240-360)

            // Calculate sector 0, 1, 2
            // angle is cumulative, so we take modulus 2PI first.
            // But TSL mod might be tricky with negative numbers if angle goes negative? 
            // angle = PI * 1.25 + time * speed. usually positive.
            // let's assume positive.

            const twoPI = PI.mul(2.0);
            // fmod is usually 'mod' in TSL? 'mod(a, b)'
            // Let's use `angle.mod(twoPI)`
            // Wait, standard TSL `mod` might not be imported or available directly as function? 
            // usually it is available on nodes `.mod(v)`.

            const ang = angle.mod(twoPI);
            const sectorWidth = twoPI.div(3.0);
            const sector = ang.div(sectorWidth).floor(); // 0, 1, or 2 (rarely 3 if exactly 2PI)

            // Create masks
            // We use select for hard switching
            const maskX = select(sector.equal(0.0), 1.0, 0.0);
            const maskY = select(sector.equal(1.0), 1.0, 0.0);
            const maskZ = select(sector.greaterThan(1.5), 1.0, 0.0); // catch 2.0 and potential 3.0 edge case

            const componentMask = vec3(maskX, maskY, maskZ);

            const osc = sin(angle.mul(4.0)).mul(0.2);
            const modulation = componentMask.mul(osc);

            // D rotates: val + angle * (2.0 / PI)

            const aMod = aNode.add(mix(vec3(0), modulation, uSyncA));
            const bMod = bNode.add(mix(vec3(0), modulation, uSyncB));
            const cMod = cNode.add(mix(vec3(0), modulation, uSyncC));
            const dMod = dNode.add(mix(vec3(0), vec3(angle.mul(2.0).div(PI)), uSyncD));

            // Use cosinePalette
            const palColor = (cosinePalette as any)(phase, aMod, bMod, cMod, dMod);

            if (mode === 'Smooth') {
                // Smooth mode: Map phase directly to palette
                finalColor.assign(palColor);
            } else {
                // Lines mode
                const pattern = sin(imaginary.mul(50.0).mul(uFrequency.mul(0.2)));
                const thickness = uLineWidth;
                const lineMask = smoothstep(thickness, thickness.add(0.6), abs(pattern));

                finalColor.assign(palColor.mul(lineMask));
            }

            const g = (grainTexturePattern as any)(uv0).mul(0.2);
            finalColor.addAssign(g);

            return finalColor;
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        return mat;
    }, [params, mode, palette, syncParams]);

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
