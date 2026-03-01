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

export function FractalLikeV3(props: any) {
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
        const domainRepetitions = 3.5;

        // pattern repetition
        const patternRepetitions = 8;

        const MAX_ITERATIONS = 10;

        let pattern = vec3(0.0).toVar();
        // Loop({ start: 0, end: MAX_ITERATIONS }, ({ i: _i }) => {
        //     const i = float(_i);
        //     const shape1 = sdBox2d(fract(_uv.mul(domainRepetitions)).sub(0.5)).toVar();
        //     shape1.assign(shape1.oneMinus());
        //     shape1.assign(bloomEdgePattern(shape1, freq, edge, exponent));
        //     const shape2 = sdSphere(uv0.mul(0.6).mul(_time), 0.1).toVar();
        //     shape2.assign(shape2.oneMinus());
        //     shape2.assign(bloomEdgePattern(shape2, freq, edge, exponent));

        //     pattern.assign(smax(shape1, shape2, 0.9));
        //     // pattern.assign(smin(shape1, shape2, 0.5));
        //     // pattern.assign(shape2);
        // });

        _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5));

        Loop({ start: 0, end: MAX_ITERATIONS }, ({ i: _i }) => {
            const i = float(_i);
            const shape1 = sdBox2d((_uv.mul(2))).toVar();
            shape1.assign(shape1.oneMinus());
            shape1.assign(bloomEdgePattern(shape1, freq, 0.05, exponent));
            const shape2 = sdSphere(uv0.mul(0.6).mul(sin(_time)), 0.1).toVar();
            shape2.assign(shape2.oneMinus());
            shape2.assign(bloomEdgePattern(shape2, freq, edge, exponent));

            // pattern.assign(smax(shape1, shape2, 0.2));
            pattern.assign(smin(shape1, shape2, 0.9));
            // pattern.assign(shape1);
        });

        finalColor.assign(vec3(1.0, 0, 0))
        return finalColor.mul(pattern);

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
