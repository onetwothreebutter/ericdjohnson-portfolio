'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import {
    rotate, vec2, sin, cos, mul, pow, div, add, mix, mod,
    round, abs, color, time, positionLocal, vec3, Fn, uv,
    uniform, screenSize, Loop, float, fract, step, atan2,
    length, PI, floor, min, mat2, vec4
} from 'three/tsl';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { sdSphere, sdBox2d } from './tsl/utils/sdf/shapes';
import { bloomEdgePattern } from './tsl/utils/function/bloom_edge_pattern';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { smax, smin } from './tsl/utils/sdf/operations';

import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';

export function KaleidoscopeFractal2(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Leva controls for various parameters
    const {
        warpFrequency,
        warpAmplitude,
        iterations,
        timeSpeed,
        colorA,
        colorB,
        colorC,
        colorD
    } = useControls('Kaleidoscope 2', {
        warpFrequency: { value: 8.2, min: 0, max: 20, step: 0.1, label: 'Warp Frequency' },
        warpAmplitude: { value: 0.13, min: 0, max: 1, step: 0.01, label: 'Warp Amplitude' },
        iterations: { value: 5, min: 1, max: 10, step: 1, label: 'Iterations' },
        timeSpeed: { value: 0.025, min: 0, max: 0.1, step: 0.001, label: 'Time Speed' },
        colorA: { value: [0.5, 0.5, 0.5], label: 'Color A' },
        colorB: { value: [0.5, 0.5, 0.5], label: 'Color B' },
        colorC: { value: [1.0, 1.0, 1.0], label: 'Color C' },
        colorD: { value: [0.0, 0.33, 0.67], label: 'Color D' }
    });

    // Create uniforms for the parameters
    const warpFreqUniform = useMemo(() => uniform(warpFrequency), []);
    const warpAmpUniform = useMemo(() => uniform(warpAmplitude), []);
    const iterationsUniform = useMemo(() => uniform(iterations), []);
    const timeSpeedUniform = useMemo(() => uniform(timeSpeed), []);
    const colorAUniform = useMemo(() => uniform(vec3(...colorA)), []);
    const colorBUniform = useMemo(() => uniform(vec3(...colorB)), []);
    const colorCUniform = useMemo(() => uniform(vec3(...colorC)), []);
    const colorDUniform = useMemo(() => uniform(vec3(...colorD)), []);

    // Update uniforms when controls change
    useFrame(() => {
        warpFreqUniform.value = warpFrequency;
        warpAmpUniform.value = warpAmplitude;
        iterationsUniform.value = iterations;
        timeSpeedUniform.value = timeSpeed;
        colorAUniform.value.set(...colorA);
        colorBUniform.value.set(...colorB);
        colorCUniform.value.set(...colorC);
        colorDUniform.value.set(...colorD);
    });

    const main = Fn(() => {

        const _uv = screenAspectUV(screenSize).toVar();
        const finalColor = vec3(0.0, 0.0, 0.0).toVar();

        Loop({ start: 0, end: iterationsUniform, type: 'float' }, ({ i: _i }) => {

            // prime number harmonics
            // Use the time node scaled by the number of iterations to get more interesting motion
            const _t = time.mul(timeSpeedUniform).mul(pow(_i, 2))

            // Use a technique called: Prime number harmonics to create unique rotations based on the iteration number
            const _m = mat2(
                cos(_t.add(mul(0.8, 1))),
                cos(_t.add(mul(0.8, 7))),
                cos(_t.add(mul(0.8, 5))),
                cos(_t.add(mul(0.8, 1))),
            )

            _uv.assign(abs(fract(_uv)
                // remap to 0->1
                .mul(2).sub(1))
                // apply the harmonic matrix
                .mul(_m))

            // pattern is too regular/rectangular, so warp the domain
            _uv.addAssign(sin(_uv.mul(warpFreqUniform)).mul(warpAmpUniform))

            // Use cosine palette for coloring based on iteration
            const t = _i.div(iterationsUniform);
            const col = cosinePalette(
                t,
                colorAUniform,
                colorBUniform,
                colorCUniform,
                colorDUniform
            );

            // Mix UV pattern with cosine palette colors
            finalColor.addAssign(col.mul(vec3(_uv.x, _uv.y, length(_uv))))
        });

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
