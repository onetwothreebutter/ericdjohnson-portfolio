'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { screenSize, color, time, positionLocal, sin, vec3, vec2, uv, float, abs, Fn, smoothstep, uniform, dot, clamp, length, mix, If } from 'three/tsl';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { useControls } from 'leva';

export function SDFLine() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // In useMemo
    const uniforms = useMemo(() => ({
        a: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        b: { value: new THREE.Vector3(0.24, 0.21, 0.5) },
        c: { value: new THREE.Vector3(1.0, 0.7, 0.4) },
        d: { value: new THREE.Vector3(0.0, 0.15, 0.2) },
        params: { value: new THREE.Vector3(0.1, 0, 0) }, // x = thickness
    }), []);

    const { mode } = useControls({
        mode: { value: 'Glow', options: ['Glow', 'Solid', 'Dashed', 'Field'] },
        thickness: { value: 0.1, min: 0.0, max: 1.0, step: 0.001, onChange: (v: number) => uniforms.params.value.setX(v) },
        a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uniforms.a.value.set(...v) },
        b: { value: [0.24, 0.21, 0.5], onChange: (v: [number, number, number]) => uniforms.b.value.set(...v) },
        c: { value: [1.0, 0.7, 0.4], onChange: (v: [number, number, number]) => uniforms.c.value.set(...v) },
        d: { value: [0.0, 0.15, 0.2], onChange: (v: [number, number, number]) => uniforms.d.value.set(...v) },
    });

    const material = useMemo(() => {
        const aNode = uniform(uniforms.a.value);
        const bNode = uniform(uniforms.b.value);
        const cNode = uniform(uniforms.c.value);
        const dNode = uniform(uniforms.d.value);
        const paramsNode = uniform(uniforms.params.value);
        const thickness = paramsNode.x;

        // Type casting for TSL functions since strict types are interfering
        const sdSegmentWithH = Fn(([p, a, b]) => {
            const pa = p.sub(a);
            const ba = b.sub(a);
            const h = clamp(dot(pa, ba).div(dot(ba, ba)), 0.0, 1.0);
            return vec2(length(pa.sub(ba.mul(h))), h);
        });

        const closestPointOnSegment = Fn(([p, a, b]) => {
            const ba = b.sub(a);
            const h = clamp(dot(p.sub(a), ba).div(dot(ba, ba)), 0.0, 1.0);
            return a.add(ba.mul(h));
        });

        const sdSegment = Fn(([p, a, b]) => {
            return length(p.sub(closestPointOnSegment(p, a, b)));
        });

        const main = Fn(() => {
            const uvNode = uv().mul(2).sub(1); // -1 to 1
            const uv2Node = screenAspectUV(screenSize);

            // Draw a segment from (-0.5, 0) to (0.5, 0)
            const segmentData = (sdSegment as any)(uv2Node, vec2(-0.25, 0), vec2(0.25, 0)).toVar();

            const d = segmentData.x;
            const h = segmentData.y;

            // Visuals: glowing line
            const aa = float(0.002);

            const finalColor = vec3(0).toVar();

            if (mode === 'Glow') {
                const intensity = smoothstep(thickness, 0.0, d); // Inverted glow logic for intuitive "thickness"? Or smoothstep(0.0, thickness, d)?
                // Original: smoothstep(thickness, 0.5, d) where thickness ~ 0.
                // If we want thickness to control width:
                // smoothstep(0.0, thickness, d) -> 0 at center, 1 at edge.
                // palette(intensity).
                // If palette(0) is bright, then center is bright.
                // solid lines usually want center to be "pure" color.
                // Let's use smoothstep(thickness, 0.0, d) -> 1 at center (if thickness > 0), 0 at edge.
                // Wait, smoothstep(edge0, edge1, x). If edge0 > edge1, it inverts?
                // Standard TSL/GLSL behavior for edge0 > edge1 is undefined or implementation dependent?
                // Better to use 1.0 - smoothstep(0.0, thickness, d).

                const glow = float(1.0).sub(smoothstep(0.0, thickness, d));
                finalColor.assign((cosinePalette as any)(glow.oneMinus(), aNode, bNode, cNode, dNode));
                // Wait, cosinePalette takes 't'.
                // Original: t = smoothstep(~0, 0.5, d). d=0 -> t=0. d=0.5 -> t=1.
                // So t=0 is center color.
                // If I use smoothstep(0.0, thickness, d), then d=0->0, d=thickness->1.
                // So t=0 at center.
                // So `finalColor.assign(cosinePalette( t, ... ))` works.
                const t = smoothstep(0.0, thickness, d);
                finalColor.assign((cosinePalette as any)(t, aNode, bNode, cNode, dNode));

            } else if (mode === 'Solid') {
                const solid = smoothstep(thickness.add(aa), thickness, d);
                finalColor.assign((cosinePalette as any)(h, aNode, bNode, cNode, dNode).mul(solid));
            } else if (mode === 'Dashed') {
                const dashPattern = sin(h.mul(50.0).add(time.mul(5))).greaterThan(0);
                const solid = smoothstep(thickness.add(aa), thickness, d);
                finalColor.assign(mix(vec3(0), (cosinePalette as any)(h, aNode, bNode, cNode, dNode), solid.mul(dashPattern)));
            } else if (mode === 'Field') {
                const field = sin(d.mul(50.0).sub(time.mul(2.0)));
                const intensity = smoothstep(0.0, 1.0, field);
                finalColor.assign((cosinePalette as any)(d.mul(2.0), aNode, bNode, cNode, dNode).mul(intensity));
            }

            return finalColor;
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        mat.transparent = true;
        return mat;
    }, [uniforms, mode]);

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
