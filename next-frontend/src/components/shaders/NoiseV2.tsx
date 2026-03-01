'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import {
    vec2, vec3, vec4, sin, cos, mul, add, mix, mod,
    abs, time, uv, uniform, Fn, fract, floor, dot,
    smoothstep, float, step, length, clamp, min, screenSize, pow, mat2
} from 'three/tsl';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { perlinNoise3d } from './tsl/noise/perlin_noise_3d';
import { simplexNoise3d } from './tsl/noise/simplex_noise_3d';
import { sdBox2d } from './tsl/utils/sdf/shapes';

import { useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';

export function NoiseV2(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);


    const main = Fn(() => {

        // const _uv = screenAspectUV(screenSize);
        // const _time = time.mul(0.1);

        // const baseRotation = _time.mul(0.8);

        // //add noise to the rotation
        // const noise = simplexNoise3d(_uv.x, _uv.y, baseRotation);
        // const noisyRotation = baseRotation.add(noise);

        // // Rotate UV using a 2D matrix
        // const rotate = Fn(([a]) => {
        //     const c = cos(a);
        //     const s = sin(a);
        //     return mat2(c, s.negate(), s, c);
        // });

        // const rotationMatrix = rotate(noisyRotation);
        // const rotatedUV = rotationMatrix.mul(_uv);

        // // make a square
        // // const square = sdBox2d(rotatedUV, 0.2)
        // const square = abs(rotatedUV.x).add(abs(rotatedUV.y)).sub(0.2)

        // const finalColor = vec4(square, 0.0, 0.0, 1.0);

        const PI = 3.14;
        const _uv = screenAspectUV(screenSize)
        const uv0 = screenAspectUV(screenSize);
        const uv1 = uv();
        const _time = time.mul(0.1)

        const numColumns = 10;
        const repeatingPattern = fract(_uv.mul(numColumns)).div(numColumns)
        const columnIndex = (floor(uv1.x.mul(numColumns)))

        // const sinOffset = (sin(uv0.y.add(columnIndex).mul(0.75)))
        // Get a sine wave that fits our screen (uv0 goes from 0.5 to 0.5)
        const sinOffset = sin(uv0.x.mul(PI)).toVar()

        // const offsetUV = vec2(_uv.x, _uv.y.add(repeatingPattern).add(sin(mul(sinOffset, 0.1))))
        const offsetUV = vec2(_uv.x, _uv.y.add(repeatingPattern).add(sin(sinOffset.mul(0.2))))

        const color = _uv.x.mul(sinOffset)


        const result = vec3(uv0.x.mul(0.5), 0, 0);
        return result;
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
