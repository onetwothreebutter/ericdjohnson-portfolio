'use client';


import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import { mul, pow, div, add, mix, mod, round, abs, color, time, positionLocal, sin, vec3, Fn, uv, uniform, screenSize, Loop, float, fract, step } from 'three/tsl';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { sdSphere, sdBox2d } from './tsl/utils/sdf/shapes';
import { bloomEdgePattern } from './tsl/utils/function/bloom_edge_pattern';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { smax, smin } from './tsl/utils/sdf/operations';

import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Extend so we can use meshBasicNodeMaterial as a JSX tag if needed, 
// though we usually pass the material instance or use the primitive.
// For now, let's create the material declaratively if possible, or imperatively.

export function FractalLikeV5(props: any) {
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
        const domainRepetitions = 2.5;

        // pattern repetition
        const patternRepetitions = float(8).toVar();

        const MAX_ITERATIONS = 3;

        let pattern = vec3(0.0).toVar();

        // _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5));

        let shape1 = float(0.0).toVar();
        Loop({ start: 0, end: MAX_ITERATIONS }, ({ i: _i }) => {
            _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5))
            // _uv.subAssign(fract(_uv.mul(domainRepetitions)).sub(0.5))
            // _uv.subAssign(fract(_uv.mul(domainRepetitions)).sub(0.5))

            // create the pattern we want to repeat
            const pattern = sdBox2d(_uv).toVar();

            // scale the pattern to the number of repetitions
            pattern.assign(pattern.mul(patternRepetitions).add(_time).div(patternRepetitions))

            // take the absolute value of the pattern
            pattern.assign(abs(pattern))

            // apply the bloom effect
            pattern.assign(bloomEdgePattern(pattern, freq, edge, exponent))

            finalColor.addAssign(pattern)
        });



        // finalColor.assign(cosinePalette(pattern.oneMinus(), a, b, c, d));

        // const shape2Color = cosinePalette(shape2.oneMinus(), a, b, c, d);
        // const shape2Color = vec3(shape2.oneMinus(), 0.0, 0.0);
        // finalColor.mulAssign(shape2Color);
        // finalColor.assign(vec3(1.0, 0.0, 0.0));
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
