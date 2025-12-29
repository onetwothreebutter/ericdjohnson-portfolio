'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { color, time, positionLocal, sin, vec3, uv, float, abs, cos } from 'three/tsl';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { sdEquilateralTriangle } from './tsl/utils/sdf/shapes';

// Extend so we can use meshBasicNodeMaterial as a JSX tag if needed, 
// though we usually pass the material instance or use the primitive.
// For now, let's create the material declaratively if possible, or imperatively.

export function PowerfulTriangle() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // TSL: Create a triangle SDF
    const uvNode = uv().mul(2).sub(1); // Normalized UV from -1 to 1
    // Correct aspect ratio if needed, but for a square plane it's fine.

    // Use the sdEquilateralTriangle function we saw in shapes.js
    // We need to import it first. 
    // Wait, the user file `tsl/utils/sdf/shapes.js` exports `sdEquilateralTriangle`.
    // I need to make sure I import it correctly.

    const d = sdEquilateralTriangle(uvNode, 0.5);

    // Create a glowing effect
    // 0 outside, 1 inside, but let's make it an edge glow
    // abs(d) gives distance from edge.
    // 0.01 / abs(d) gives a glow that falls off.
    const glow = float(0.02).div(abs(d)).pow(1.2);

    // Dynamic color
    // const colorNode = vec3(
    //     sin(time.mul(2.0)).mul(0.5).add(0.5),
    //     cos(time.mul(1.5)).mul(0.5).add(0.5),
    //     sin(time.mul(1.0).add(2.0)).mul(0.5).add(0.5)
    // ).mul(glow);

    const colorNode = vec3(1, 0, 0);

    const material = new MeshBasicNodeMaterial();
    material.colorNode = colorNode;
    material.transparent = true;

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
