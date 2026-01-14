'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { screenSize, color, time, positionLocal, sin, vec3, vec2, uv, float, abs, Fn, smoothstep, uniform, dot, clamp, length, mix, If, fract, floor } from 'three/tsl';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { useControls } from 'leva';

export function VerticalLines() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        a: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        b: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        c: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        d: { value: new THREE.Vector3(0.263, 0.416, 0.557) }, // Cool blue palette default
        params: { value: new THREE.Vector3(0.1, 100.0, 0) }, // x = thickness, y = count
    }), []);

    const controls = useControls({
        mode: { value: 'Glow', options: ['Glow', 'Solid', 'Dashed'] },
        count: { value: 100, min: 1, max: 500, step: 1, onChange: (v: number) => uniforms.params.value.setY(v) },
        thickness: { value: 0.1, min: 0.0, max: 1.0, step: 0.001, onChange: (v: number) => uniforms.params.value.setX(v) },
        a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uniforms.a.value.set(...v) },
        b: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uniforms.b.value.set(...v) },
        c: { value: [1.0, 1.0, 1.0], onChange: (v: [number, number, number]) => uniforms.c.value.set(...v) },
        d: { value: [0.263, 0.416, 0.557], onChange: (v: [number, number, number]) => uniforms.d.value.set(...v) },
    });

    const { mode, count, thickness } = controls as any;

    const material = useMemo(() => {
        const aNode = uniform(uniforms.a.value);
        const bNode = uniform(uniforms.b.value);
        const cNode = uniform(uniforms.c.value);
        const dNode = uniform(uniforms.d.value);
        const paramsNode = uniform(uniforms.params.value);
        const thicknessNode = paramsNode.x;
        const countNode = paramsNode.y;

        const main = Fn(() => {
            const uvNode = uv();

            // Domain repetition
            // x goes from 0 to count
            const x = uvNode.x.mul(countNode);
            const localX = fract(x);

            // Distance to center (0.5)
            // Range 0 to 0.5
            const d = abs(localX.sub(0.5));

            // Also get an ID for the line to vary colors if we want
            const id = floor(x);

            const finalColor = vec3(0).toVar();

            if (mode === 'Glow') {
                // d is 0 at center, 0.5 at edge
                // smoothstep(0, thickness, d) -> 0 at center, 1 at thickness
                // invert -> 1 at center, 0 at thickness
                const glow = float(1.0).sub(smoothstep(0.0, thicknessNode, d));

                // Use id to vary color slightly? Or just vertical gradient?
                // varying palette by uv.y makes it look nice
                const t = uvNode.y.add(time.mul(0.1));

                finalColor.assign((cosinePalette as any)(t, aNode, bNode, cNode, dNode).mul(glow));

            } else if (mode === 'Solid') {
                // Sharp edge
                // if d < thickness, 1, else 0
                const aa = float(0.01); // smooth edge
                // smoothstep(thickness+aa, thickness, d) -> 1 if d < thickness
                const solid = smoothstep(thicknessNode.add(aa), thicknessNode, d);

                const t = uvNode.y.add(time.mul(0.1));
                finalColor.assign((cosinePalette as any)(t, aNode, bNode, cNode, dNode).mul(solid));

            } else if (mode === 'Dashed') {
                const aa = float(0.01);
                const solid = smoothstep(thicknessNode.add(aa), thicknessNode, d);

                const dashPattern = sin(uvNode.y.mul(50.0).add(time.mul(5))).greaterThan(0);
                const t = uvNode.y.add(time.mul(0.1));
                finalColor.assign(mix(vec3(0), (cosinePalette as any)(t, aNode, bNode, cNode, dNode), solid.mul(dashPattern)));
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
