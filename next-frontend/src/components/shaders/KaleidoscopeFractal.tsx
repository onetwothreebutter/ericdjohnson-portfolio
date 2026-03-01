'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import {
    rotate, vec2, sin, cos, mul, pow, div, add, mix, mod,
    round, abs, color, time, positionLocal, vec3, Fn, uv,
    uniform, screenSize, Loop, float, fract, step, atan2,
    length, PI, floor, min, mat2, exp, negate, vec4
} from 'three/tsl';
import { tanh } from './tsl/utils/color/tonemapping';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { sdSphere, sdBox2d } from './tsl/utils/sdf/shapes';
import { bloomEdgePattern } from './tsl/utils/function/bloom_edge_pattern';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { smax, smin } from './tsl/utils/sdf/operations';

import { extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';

export function KaleidoscopeFractal(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    // Leva controls for domain warp parameters
    const { warpFrequency, warpAmplitude } = useControls('Domain Warp', {
        warpFrequency: { value: 8.2, min: 0, max: 10, step: 0.1, label: 'Frequency' },
        warpAmplitude: { value: 0.13, min: 0, max: 1, step: 0.01, label: 'Amplitude' }
    });

    // Create uniforms for the domain warp parameters
    const warpFreqUniform = useMemo(() => uniform(warpFrequency), []);
    const warpAmpUniform = useMemo(() => uniform(warpAmplitude), []);

    // Update uniforms when controls change
    useFrame(() => {
        warpFreqUniform.value = warpFrequency;
        warpAmpUniform.value = warpAmplitude;
    });

    const main = Fn(() => {

        const _uv = screenAspectUV(screenSize).toVar();
        const uv0 = screenAspectUV(screenSize).toVar();
        const finalColor = vec3(0.0, 0.0, 0.0).toVar();

        Loop({ start: 0, end: 4, type: 'float' }, ({ i: _i }) => {


            // prime number harmonics
            // Use the time node scaled by the number of iterations to get more interesting motion
            const _t = time.mul(0.025).mul(pow(_i, 2))

            // Use a technique called: Prime number harmonics to create unique rotations based on the iteration number
            const _m = mat2(
                cos(_t.add(mul(0.8, 1))),
                cos(_t.add(mul(0.8, 7))),
                cos(_t.add(mul(0.8, 5))),
                cos(_t.add(mul(0.8, 1))),
            )


            // _uv.assign(abs(fract(_uv.mul(2.0).sub(0.5))));
            // _uv.assign((fract(_uv.mul(2.0).sub(0.5)))); // TODO why `abs`
            // _uv.assign(abs(fract(_uv.mul(2.0).sub(1))).mul(_m));
            _uv.assign(abs(fract(_uv)
                // rempap to 0->1
                .mul(2).sub(1))
                // apply the harmonic matrix
                .mul(_m))

            // pattern is too regular/rectangular, so warp the domain
            _uv.addAssign(sin(_uv.mul(warpFreqUniform)).mul(warpAmpUniform))

            finalColor.addAssign(vec3(_uv.x, _uv.y, 0.0))
            // finalColor.addAssign(_uv.y)
            // finalColor.addAssign(exp(negate(abs(_uv.y)).mul(6)).mul(vec3(1.0, 0.0, 0.0)))

            // finalColor.addAssign(
            //     exp(negate(abs(_uv.y)).mul(8)).mul(
            //         cos(vec4(4, 2, 1, 3).mul(_i))
            //             .mul(0.5)
            //             .add(0.5),
            //     ),
            // )
        });

        // The overall result is a little too bright, so use some tonemapping to knock it down
        // finalColor.assign(tanh(finalColor.mul(0.9)))

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
