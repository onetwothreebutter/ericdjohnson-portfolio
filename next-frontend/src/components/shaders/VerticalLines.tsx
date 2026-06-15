'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { screenSize, color, time, positionLocal, sin, vec3, vec2, uv, float, abs, Fn, smoothstep, uniform, dot, clamp, length, mix, If, fract, floor } from 'three/tsl';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { perlinNoise3d } from './tsl/noise/perlin_noise_3d';
import { useControls } from 'leva';

type PaletteVec = [number, number, number];
type Palette = { a: PaletteVec; b: PaletteVec; c: PaletteVec; d: PaletteVec };
const palettes: Record<string, Palette> = {
    'Cool Blue': {
        a: [0.5, 0.5, 0.5],
        b: [0.5, 0.5, 0.5],
        c: [1.0, 1.0, 1.0],
        d: [0.263, 0.416, 0.557]
    },
    'Rainbow': {
        a: [0.5, 0.5, 0.5],
        b: [0.5, 0.5, 0.5],
        c: [1.0, 1.0, 1.0],
        d: [0.0, 0.33, 0.67]
    },
    'Neon Heat': {
        a: [0.5, 0.5, 0.5],
        b: [0.5, 0.5, 0.5],
        c: [1.0, 1.0, 1.0],
        d: [0.3, 0.2, 0.2]
    },
    'Cyberpunk': {
        a: [0.5, 0.5, 0.5],
        b: [0.5, 0.5, 0.5],
        c: [2.0, 1.0, 0.0],
        d: [0.5, 0.2, 0.25]
    },
    'Black & White': {
        a: [0.5, 0.5, 0.5],
        b: [0.5, 0.5, 0.5],
        c: [1.0, 1.0, 1.0],
        d: [0.0, 0.1, 0.2] // slight tint to avoid pure gray for visual interest, standard B&W is often a=0.5,b=0.5,c=1,d=0 for full cycle gray
    },
    'Golden': {
        a: [0.5, 0.5, 0.5],
        b: [0.5, 0.5, 0.5],
        c: [1.0, 1.0, 0.5],
        d: [0.8, 0.9, 0.3]
    }
};

export function VerticalLines(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // Time tracking for smooth speed transitions
    const accumulatedTime = useRef(0);
    const currentSpeed = useRef(0.1);

    const uniforms = useMemo(() => ({
        a: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        b: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
        c: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        d: { value: new THREE.Vector3(0.263, 0.416, 0.557) }, // Cool blue palette default
        params: { value: new THREE.Vector3(0.1, 100.0, 0) }, // x = thickness, y = count
        noisePositionParams: { value: new THREE.Vector3(1.0, 0.1, 0.0) }, // x = scale, y = strength
        noiseColorParams: { value: new THREE.Vector3(1.0, 0.1, 0.0) }, // x = scale, y = strength
        bloomParams: { value: new THREE.Vector3(0.5, 3.0, 0) }, // x = strength, y = radius
    }), []);

    const [controls, set] = useControls(() => ({
        mode: { value: 'Glow', options: ['Glow', 'Solid', 'Dashed'] },
        count: { value: 65, min: 1, max: 500, step: 1, onChange: (v: number) => uniforms.params.value.setY(v) },
        thickness: { value: 0.2, min: 0.0, max: 1.0, step: 0.001, onChange: (v: number) => uniforms.params.value.setX(v) },

        spacingNoiseScale: { value: 1.0, min: 0.1, max: 10.0, step: 0.1, onChange: (v: number) => uniforms.noisePositionParams.value.setX(v) },
        spacingNoiseStrength: { value: 0.1, min: 0.0, max: 1.0, step: 0.001, onChange: (v: number) => uniforms.noisePositionParams.value.setY(v) },

        colorNoiseScale: { value: 1.0, min: 0.1, max: 10.0, step: 0.1, onChange: (v: number) => uniforms.noiseColorParams.value.setX(v) },
        colorNoiseStrength: { value: 0.5, min: 0.0, max: 2.0, step: 0.01, onChange: (v: number) => uniforms.noiseColorParams.value.setY(v) },

        bloomStrength: { value: 0.5, min: 0.0, max: 2.0, step: 0.01, onChange: (v: number) => uniforms.bloomParams.value.setX(v) },
        bloomRadius: { value: 3.0, min: 1.0, max: 10.0, step: 0.1, onChange: (v: number) => uniforms.bloomParams.value.setY(v) },
        palette: {
            value: 'Cool Blue',
            options: Object.keys(palettes),
            onChange: (v: string) => {
                const p = palettes[v as keyof typeof palettes];
                if (p) {
                    set({ a: p.a, b: p.b, c: p.c, d: p.d } as any);
                    uniforms.a.value.set(...p.a);
                    uniforms.b.value.set(...p.b);
                    uniforms.c.value.set(...p.c);
                    uniforms.d.value.set(...p.d);
                }
            }
        },
        a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uniforms.a.value.set(...v) },
        b: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uniforms.b.value.set(...v) },
        c: { value: [1.0, 1.0, 1.0], onChange: (v: [number, number, number]) => uniforms.c.value.set(...v) },
        d: { value: [0.263, 0.416, 0.557], onChange: (v: [number, number, number]) => uniforms.d.value.set(...v) },
    }));

    const { mode, count, thickness, spacingNoiseScale, spacingNoiseStrength, colorNoiseScale, colorNoiseStrength, bloomStrength, bloomRadius } = controls as any;

    const { camera } = useThree();
    const { width, height } = useMemo(() => {
        const z = (props.position?.[2] ?? (Array.isArray(props.position) ? props.position[2] : 0)) || 0;
        const cam = camera as THREE.PerspectiveCamera;
        // Basic safe-guard, though normally we use PerspectiveCamera
        if (!cam.isPerspectiveCamera) return viewport;

        // Vector pointing from camera to the plane
        // Assuming plane is at world (0,0,z) and camera at (0,0,camZ)
        // Correct distance calculation simply:
        const distance = Math.abs(cam.position.z - z);
        const fov = (cam.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * distance;

        // Use aspect ratio from viewport to determine width
        // viewport.width / viewport.height is the aspect ratio
        const w = h * (viewport.width / viewport.height);

        return { width: w, height: h };
    }, [camera, props.position, viewport]);

    // We need a stable UniformNode for time to update it
    const timeUniform = useMemo(() => uniform(0), []);
    // Stable uniform for color noise strength to allow lerping without fighting Leva controls
    const strengthUniform = useMemo(() => uniform(0), []);

    const materialNode = useMemo(() => {
        const aNode = uniform(uniforms.a.value);
        const bNode = uniform(uniforms.b.value);
        const cNode = uniform(uniforms.c.value);
        const dNode = uniform(uniforms.d.value);
        const paramsNode = uniform(uniforms.params.value);
        const noisePositionParamsNode = uniform(uniforms.noisePositionParams.value);
        const noiseColorParamsNode = uniform(uniforms.noiseColorParams.value);
        const bloomParamsNode = uniform(uniforms.bloomParams.value);

        const thicknessNode = paramsNode.x;
        const countNode = paramsNode.y;

        const noiseScaleNode = noisePositionParamsNode.x;
        const noisePosStrengthNode = noisePositionParamsNode.y;

        const colorNoiseScaleNode = noiseColorParamsNode.x;
        // Use our dynamic strength uniform instead of the raw uniform value
        const colorNoiseStrengthNode = strengthUniform;

        const bloomStrengthNode = bloomParamsNode.x;
        const bloomRadiusNode = bloomParamsNode.y;

        const main = Fn(() => {
            const uvNode = uv();

            // Use the STABLE time uniform
            const timeNode = timeUniform;

            // Spacing from noise (spacingNoiseScale)
            const noiseVal = (perlinNoise3d as any)(vec3(uvNode.x.mul(noiseScaleNode), 0.0, 0.0));
            // Distort the UV x coordinate.
            // We want to effectively stretch/compress space.
            const distortedX = uvNode.x.add(noiseVal.mul(noisePosStrengthNode));

            // Domain repetition
            // x goes from 0 to count
            const x = distortedX.mul(countNode);
            const localX = fract(x);

            // Distance to center (0.5)
            // Range 0 to 0.5
            const d = abs(localX.sub(0.5));

            // Also get an ID for the line to vary colors if we want
            // const id = floor(x); // Commented out as it's not used

            // Color Noise (colorNoiseScale)
            // We can calculate a separate noise specifically for color variation
            // Using uv.x is good, but maybe also use the 'id' of the line to make it consistent per line?
            // Actually using distortedX or just plain uv.x is fine. Plain uv.x keeps the color field independent of the physical distortion, which might be what is requested.
            // Let's use uv.x for the color noise field foundation.
            const colorNoiseVal = (perlinNoise3d as any)(vec3(uvNode.x.mul(colorNoiseScaleNode), 0.0, 0.0));

            const finalColor = vec3(0).toVar();

            if (mode === 'Glow') {
                // d is 0 at center, 0.5 at edge
                // smoothstep(0, thickness, d) -> 0 at center, 1 at thickness
                // invert -> 1 at center, 0 at thickness
                const core = float(1.0).sub(smoothstep(0.0, thicknessNode, d));

                // Bloom layer: wider and controlled by bloom strength/radius
                const bloomRadius = thicknessNode.mul(bloomRadiusNode);
                const bloom = float(1.0).sub(smoothstep(0.0, bloomRadius, d)).mul(bloomStrengthNode);

                // Use id to vary color slightly? Or just vertical gradient?
                // varying palette by uv.y makes it look nice
                // Offset palette by INDEPENDENT color noise
                const t = uvNode.y.add(timeNode).add(colorNoiseVal.mul(colorNoiseStrengthNode));

                // Add core and bloom
                finalColor.assign((cosinePalette as any)(t, aNode, bNode, cNode, dNode).mul(core.add(bloom)));

            } else if (mode === 'Solid') {
                // Sharp edge
                // if d < thickness, 1, else 0
                const aa = float(0.01); // smooth edge
                // smoothstep(thickness+aa, thickness, d) -> 1 if d < thickness
                const solid = smoothstep(thicknessNode.add(aa), thicknessNode, d);

                const t = uvNode.y.add(timeNode).add(noiseVal.mul(colorNoiseStrengthNode));
                finalColor.assign((cosinePalette as any)(t, aNode, bNode, cNode, dNode).mul(solid));

            } else if (mode === 'Dashed') {
                const aa = float(0.01);
                const solid = smoothstep(thicknessNode.add(aa), thicknessNode, d);

                const dashPattern = sin(uvNode.y.mul(50.0).add(timeNode.mul(50.0))).greaterThan(0);
                const t = uvNode.y.add(timeNode).add(noiseVal.mul(colorNoiseStrengthNode));
                finalColor.assign(mix(vec3(0), (cosinePalette as any)(t, aNode, bNode, cNode, dNode), solid.mul(dashPattern)));
            }

            return finalColor;
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        mat.transparent = true;
        return mat;
    }, [uniforms, mode, timeUniform, strengthUniform]); // Added strengthUniform dependency

    // Update the uniform value in the frame loop
    useFrame((state, delta) => {
        // Smoothly interpolate speed
        const targetSpeed = props.speedBoost ? 2.0 : 0.1;
        currentSpeed.current = THREE.MathUtils.lerp(currentSpeed.current, targetSpeed, 0.05);

        // Smoothly interpolate color noise strength
        const baseStrength = uniforms.noiseColorParams.value.y;
        const targetStrength = props.speedBoost ? 1.6 : baseStrength;
        strengthUniform.value = THREE.MathUtils.lerp(strengthUniform.value as number, targetStrength, 0.05);

        // Accumulate time based on current speed
        accumulatedTime.current += delta * currentSpeed.current;

        // Update the TSL Uniform Node
        timeUniform.value = accumulatedTime.current;
    });

    return (
        <mesh ref={meshRef} {...props}>
            <planeGeometry args={[width, height]} />
            <primitive object={materialNode} attach="material" />
        </mesh>
    );
}
