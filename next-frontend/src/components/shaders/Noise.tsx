'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import {
    vec2, vec3, vec4, sin, cos, mul, add, mix, mod,
    abs, time, uv, uniform, Fn, fract, floor, dot,
    smoothstep, float, step, length, clamp, min, screenSize
} from 'three/tsl';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { perlinNoise3d } from './tsl/noise/perlin_noise_3d';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';

export function Noise(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Leva controls for noise parameters
    const {
        noiseType,
        scale,
        octaves,
        persistence,
        lacunarity,
        speed,
        colorMode,
        contrast
    } = useControls('Noise Parameters', {
        noiseType: {
            value: props.noiseType || 'Perlin',
            options: ['Perlin', 'FBM', 'Turbulence', 'Ridged', 'Voronoi-like', 'Curl Noise']
        },
        scale: { value: props.scale || 3.0, min: 0.1, max: 20, step: 0.1 },
        octaves: { value: props.octaves || 4, min: 1, max: 8, step: 1 },
        persistence: { value: props.persistence || 0.5, min: 0.1, max: 1.0, step: 0.05 },
        lacunarity: { value: props.lacunarity || 2.0, min: 1.0, max: 4.0, step: 0.1 },
        speed: { value: props.speed || 0.2, min: 0.0, max: 2.0, step: 0.05 },
        colorMode: {
            value: props.colorMode || 'Grayscale',
            options: ['Grayscale', 'Palette', 'RGB Noise', 'Heat Map']
        },
        contrast: { value: props.contrast || 1.0, min: 0.1, max: 3.0, step: 0.1 }
    });

    // Create uniforms
    const scaleUniform = useMemo(() => uniform(scale), []);
    const octavesUniform = useMemo(() => uniform(octaves), []);
    const persistenceUniform = useMemo(() => uniform(persistence), []);
    const lacunarityUniform = useMemo(() => uniform(lacunarity), []);
    const speedUniform = useMemo(() => uniform(speed), []);
    const contrastUniform = useMemo(() => uniform(contrast), []);

    // Update uniforms when controls change
    useFrame(() => {
        scaleUniform.value = scale;
        octavesUniform.value = octaves;
        persistenceUniform.value = persistence;
        lacunarityUniform.value = lacunarity;
        speedUniform.value = speed;
        contrastUniform.value = contrast;
    });

    const main = Fn(() => {
        const _uv = (screenAspectUV as any)(screenSize).toVar();
        const _time = time.mul(speedUniform).toVar();

        // Base noise value
        const noiseValue = float(0.0).toVar();

        // Simple Perlin noise
        if (noiseType === 'Perlin') {
            const p = vec3(_uv.mul(scaleUniform), _time);
            noiseValue.assign((perlinNoise3d as any)(p));
        }

        // Fractional Brownian Motion (FBM)
        else if (noiseType === 'FBM') {
            const fbm = float(0.0).toVar();
            const amplitude = float(1.0).toVar();
            const frequency = float(1.0).toVar();

            // Manual loop unrolling for octaves
            // Octave 1
            const p1 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            fbm.addAssign((perlinNoise3d as any)(p1).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 2
            const p2 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            fbm.addAssign((perlinNoise3d as any)(p2).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 3
            const p3 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            fbm.addAssign((perlinNoise3d as any)(p3).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 4
            const p4 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            fbm.addAssign((perlinNoise3d as any)(p4).mul(amplitude));

            noiseValue.assign(fbm);
        }

        // Turbulence (absolute value of FBM)
        else if (noiseType === 'Turbulence') {
            const turbulence = float(0.0).toVar();
            const amplitude = float(1.0).toVar();
            const frequency = float(1.0).toVar();

            // Octave 1
            const p1 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            turbulence.addAssign(abs((perlinNoise3d as any)(p1)).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 2
            const p2 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            turbulence.addAssign(abs((perlinNoise3d as any)(p2)).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 3
            const p3 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            turbulence.addAssign(abs((perlinNoise3d as any)(p3)).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 4
            const p4 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            turbulence.addAssign(abs((perlinNoise3d as any)(p4)).mul(amplitude));

            noiseValue.assign(turbulence);
        }

        // Ridged noise (inverted turbulence)
        else if (noiseType === 'Ridged') {
            const ridged = float(0.0).toVar();
            const amplitude = float(1.0).toVar();
            const frequency = float(1.0).toVar();

            // Octave 1
            const p1 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            const n1 = float(1.0).sub(abs((perlinNoise3d as any)(p1)));
            ridged.addAssign(n1.mul(n1).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 2
            const p2 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            const n2 = float(1.0).sub(abs((perlinNoise3d as any)(p2)));
            ridged.addAssign(n2.mul(n2).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 3
            const p3 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            const n3 = float(1.0).sub(abs((perlinNoise3d as any)(p3)));
            ridged.addAssign(n3.mul(n3).mul(amplitude));
            amplitude.mulAssign(persistenceUniform);
            frequency.mulAssign(lacunarityUniform);

            // Octave 4
            const p4 = vec3(_uv.mul(scaleUniform).mul(frequency), _time);
            const n4 = float(1.0).sub(abs((perlinNoise3d as any)(p4)));
            ridged.addAssign(n4.mul(n4).mul(amplitude));

            noiseValue.assign(ridged);
        }

        // Voronoi-like pattern using noise
        else if (noiseType === 'Voronoi-like') {
            const cellUV = floor(_uv.mul(scaleUniform)).toVar();
            const localUV = fract(_uv.mul(scaleUniform)).toVar();

            const minDist = float(1.0).toVar();

            // Check neighboring cells
            for (let y = -1; y <= 1; y++) {
                for (let x = -1; x <= 1; x++) {
                    const neighbor = cellUV.add(vec2(x, y));
                    const p = vec3(neighbor, _time);
                    const noise = (perlinNoise3d as any)(p);
                    const point = vec2(noise, fract(noise.mul(43.5453)));
                    const diff = neighbor.add(point).sub(_uv.mul(scaleUniform));
                    const dist = length(diff);
                    minDist.assign(min(minDist, dist));
                }
            }

            noiseValue.assign(minDist);
        }

        // Curl Noise - divergence-free vector field
        else if (noiseType === 'Curl Noise') {
            // Epsilon for numerical derivative approximation
            const eps = float(0.01);

            // Sample noise at the current position and offset positions
            // We need to compute the curl of a potential field
            // For 2D, we use: curl = (∂ψ/∂y, -∂ψ/∂x)

            const baseX = _uv.x.mul(scaleUniform);
            const baseY = _uv.y.mul(scaleUniform);

            // Sample noise at offset positions to compute derivatives
            const n_x0 = (perlinNoise3d as any)(vec3(baseX.add(eps), baseY, _time));
            const n_x1 = (perlinNoise3d as any)(vec3(baseX.sub(eps), baseY, _time));
            const n_y0 = (perlinNoise3d as any)(vec3(baseX, baseY.add(eps), _time));
            const n_y1 = (perlinNoise3d as any)(vec3(baseX, baseY.sub(eps), _time));

            // Compute derivatives (central difference)
            const dx = n_x0.sub(n_x1).div(eps.mul(2.0));
            const dy = n_y0.sub(n_y1).div(eps.mul(2.0));

            // Curl in 2D: rotate gradient by 90 degrees
            // This gives us a divergence-free vector field
            const curlX = dy;  // ∂ψ/∂y
            const curlY = dx.mul(-1.0);  // -∂ψ/∂x

            // Create a flowing pattern by advecting UV along the curl field
            const flowUV = vec2(_uv.x.add(curlX.mul(0.3)), _uv.y.add(curlY.mul(0.3)));

            // Sample noise again at the flowed position for visualization
            const flowedNoise = (perlinNoise3d as any)(vec3(flowUV.x.mul(scaleUniform), flowUV.y.mul(scaleUniform), _time));

            // Visualize the vector field magnitude
            const magnitude = length(vec2(curlX, curlY));

            // Combine flowed noise with magnitude for interesting patterns
            noiseValue.assign(flowedNoise.add(magnitude.mul(0.5)));
        }

        // Apply contrast
        const adjustedNoise = noiseValue.mul(contrastUniform).toVar();

        // Color mapping
        const finalColor = vec3(0.0).toVar();

        if (colorMode === 'Grayscale') {
            // Remap from [-1, 1] to [0, 1]
            const gray = adjustedNoise.mul(0.5).add(0.5);
            finalColor.assign(vec3(gray));
        }
        else if (colorMode === 'Palette') {
            // Use cosine palette
            const t = adjustedNoise.mul(0.5).add(0.5);
            const a = vec3(0.5, 0.5, 0.5);
            const b = vec3(0.5, 0.5, 0.5);
            const c = vec3(1.0, 1.0, 1.0);
            const d = vec3(0.0, 0.33, 0.67);
            finalColor.assign((cosinePalette as any)(t, a, b, c, d));
        }
        else if (colorMode === 'RGB Noise') {
            // Different noise for each channel
            const rNoise = (perlinNoise3d as any)(vec3(_uv.mul(scaleUniform), _time));
            const gNoise = (perlinNoise3d as any)(vec3(_uv.mul(scaleUniform), _time.add(100.0)));
            const bNoise = (perlinNoise3d as any)(vec3(_uv.mul(scaleUniform), _time.add(200.0)));

            finalColor.assign(vec3(
                rNoise.mul(0.5).add(0.5),
                gNoise.mul(0.5).add(0.5),
                bNoise.mul(0.5).add(0.5)
            ));
        }
        else if (colorMode === 'Heat Map') {
            // Heat map gradient
            const t = clamp(adjustedNoise.mul(0.5).add(0.5), 0.0, 1.0);

            // Create heat map colors
            const cold = vec3(0.0, 0.0, 0.5);
            const medium = vec3(1.0, 0.0, 0.0);
            const hot = vec3(1.0, 1.0, 0.0);

            const color1 = mix(cold, medium, smoothstep(0.0, 0.5, t));
            const color2 = mix(color1, hot, smoothstep(0.5, 1.0, t));

            finalColor.assign(color2);
        }

        return finalColor;
    });

    const material = new MeshBasicNodeMaterial();
    material.colorNode = main();

    /**
     * Calculate the width and height of the plane based on the camera's FOV 
     * and the plane's distance from the camera.
     */
    const { camera, viewport } = useThree();
    const { width, height } = useMemo(() => {
        const z = (props.position?.[2] ?? (Array.isArray(props.position) ? props.position[2] : 0)) || 0;
        const cam = camera as THREE.PerspectiveCamera;

        if (!cam.isPerspectiveCamera) return viewport;

        const distance = Math.abs(cam.position.z - z);
        const fov = (cam.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * distance;
        const w = h * (viewport.width / viewport.height);

        return { width: w, height: h };
    }, [camera, props.position, viewport]);

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[width, height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
