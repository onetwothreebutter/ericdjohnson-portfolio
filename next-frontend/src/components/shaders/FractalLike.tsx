'use client';


import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import { abs, color, time, positionLocal, sin, vec3, Fn, uv, uniform, screenSize, Loop, float, fract } from 'three/tsl';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { sdSphere } from './tsl/utils/sdf/shapes';
import { bloomEdgePattern } from './tsl/utils/function/bloom_edge_pattern';
import { cosinePalette } from './tsl/utils/color/cosine_palette';

import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

// Extend so we can use meshBasicNodeMaterial as a JSX tag if needed, 
// though we usually pass the material instance or use the primitive.
// For now, let's create the material declaratively if possible, or imperatively.

export function FractalLike(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    const main = Fn(() => {
        const MAX_ITERAIONS = 3;

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

        // iterate MAX_ITERAIONS times
        Loop({ start: 0, end: MAX_ITERAIONS }, ({ i: _i }) => {
            const i = float(_i);

            // simple fractal formula - warpinug the uv coords
            _uv.assign(fract(_uv.mul(1.5)).sub(0.5));
            // _uv.assign(sdSphere(_uv.mul(1.4), 0.5));

            const pFinal = _uv.assign(sdSphere(_uv.mul(1.4).mul(i), 0.5));
            pFinal.assign(bloomEdgePattern(pFinal, freq, edge, exponent, _time))

            // const color = cosinePalette(abs(uv0.x).add(abs(uv0.y)).add(i).mul(_time), a, b, c, d);
            const color = cosinePalette(sdSphere(uv0.mul(1.4), 0.5).add(i).mul(_time), a, b, c, d);

            finalColor.assign(color.mul(pFinal));

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
