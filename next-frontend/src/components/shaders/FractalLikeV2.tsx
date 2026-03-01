'use client';


import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import { mul, pow, div, add, mix, mod, round, abs, color, time, positionLocal, sin, vec3, Fn, uv, uniform, screenSize, Loop, float, fract, step } from 'three/tsl';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { sdSphere, sdBox2d } from './tsl/utils/sdf/shapes';
import { bloomEdgePattern } from './tsl/utils/function/bloom_edge_pattern';
import { cosinePalette } from './tsl/utils/color/cosine_palette';

import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Extend so we can use meshBasicNodeMaterial as a JSX tag if needed, 
// though we usually pass the material instance or use the primitive.
// For now, let's create the material declaratively if possible, or imperatively.

export function FractalLikeV2(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    const main = Fn(() => {

        // define bloom effect vars
        const freq = uniform(8.0);
        const edge = uniform(0.0005);
        const exponent = uniform(0.7);

        // define colors/params for cosine palette
        const a = vec3(0.5, 0.5, 0.5);
        const b = vec3(0.5, 0.5, 0.5);
        const c = vec3(1.0, 1.0, 1.0);
        const d = vec3(0.263, 0.416, 0.557);

        // Normalize uv coords between -.5 and .5, preserve aspect ratio
        const _uv = screenAspectUV(screenSize).toVar();
        const uv0 = screenAspectUV(screenSize);

        // slow down time
        const _time = time.mul(0.1);

        // final var to store the color
        const finalColor = vec3(0.0).toVar();

        // domain repetition
        const domainRepetitions = 1.5;

        // pattern repetition
        const patternRepetitions = 8;



        // const MAX_ITERAIONS = 2;

        // Loop({ start: 0, end: MAX_ITERAIONS }, ({ i: _i }) => {
        //     const i = float(_i);

        //     // warp the space by multiplying and using fract
        //     // subtract 0.5 to center the space
        //     _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5));

        //     // Create a simple box
        //     const pattern = sdBox2d(_uv).toVar();

        //     // This will give us a pattern that is essentially zoomed out, to rescale the space, divide it by the number of repetitions.
        //     pattern.assign(sin(pattern.mul(patternRepititions).add(time)).div(patternRepititions))

        //     // pattern.assign(bloomEdgePattern(pattern, freq, edge, exponent, _time))

        //     // const col = cosinePalette(sdSphere(uv0).add(time.mul(0.1)), a, b, c, d);
        //     const col = vec3(1.0, 0, 0);
        //     // Because we have very small value ranges for pattern, we need to additively blend the pattern with the final color so that each loop contributes to the final color.
        //     finalColor.addAssign(pattern.mul(col))
        // })


        const MAX_ITERATIONS = 2
        Loop({ start: 0, end: MAX_ITERATIONS }, ({ i }) => {
            // Warp the uv space to create a repeating pattern - we do this by first multiplying the coordinate space by a number of repetitions, then applying a sine function to it. We subtract 0.5 here to get back into our range of -0.5 to 0.5.
            _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5))

            // Create a simple box, this will be repeated across the screen
            const pattern = sdBox2d(_uv).toVar()

            // This will give us a pattern that is essentially zoomed out, to rescale the space, divide it by the number of repetitions.
            pattern.assign(sin(pattern.mul(patternRepetitions).add(time)).div(patternRepetitions))

            // Take the absolute value of the pattern, this gives us more defined edges rather than use step, or smoothstep
            pattern.assign(abs(pattern))

            // pow(edge / pattern, exponent) will give us an interesting bloomed edge to our pattern (thanks @kishimisu)
            // Here we play around with the edge to give us a little bit of variability over time.
            // You can play around with the edge and exponent to get differing amounts of bloom
            pattern.assign(pow(div(add(0.02, sin(time).mul(0.005)), pattern), 1.5))

            // The above 3 lines can be replaced with:
            // pattern.assign(bloomEdgePattern(pattern, freq, edge, exponent, time))

            // Here we apply a time offset to the sphere that gives us a nice animated gradient effect
            const col = cosinePalette(sdSphere(uv0).add(mul(time, 0.2)), a, b, c, d)

            // Because we have very small value ranges for pattern, we need to additively blend the pattern with the final color so that each loop contributes to the final color.
            finalColor.addAssign(pattern.mul(col))
        })

        return finalColor;

    });


    const material = new MeshBasicNodeMaterial();
    material.colorNode = main();



    /**
     * Calculate the width and height of the plane based on the camera's FOV and the plane's distance from the camera.
     
     */

    const { camera, viewport } = useThree();
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



    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[width, height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
