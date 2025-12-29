'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { screenSize, color, time, positionLocal, sin, vec3, uv, float, abs } from 'three/tsl';
import { extend, useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { sdLine, sdBox2d } from './tsl/utils/sdf/shapes';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';

// Extend so we can use meshBasicNodeMaterial as a JSX tag if needed, 
// though we usually pass the material instance or use the primitive.
// For now, let's create the material declaratively if possible, or imperatively.

export function SDFLine() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    // TSL: Create a line SDF
    // We want a line that passes through the center.
    // sdLine in shapes.js is `abs(p)`. If p is a float, it's 1D distance.
    // If we want a 2D line, we usually want distance to a segment or just abs(y) for horizontal line.

    const uvNode = uv().mul(2).sub(1); // -1 to 1
    const uv2Node = screenAspectUV(screenSize);

    // Let's make a diagonal line or just use sdLine on one component.
    // shape.js sdLine takes `p` and returns `abs(p)`.
    // so sdLine([uvNode.y]) gives us a horizontal line at y=0.

    const d = sdLine(uvNode.y);
    const d2 = sdBox2d(uv2Node);

    // Visuals: glowing line
    const thickness = 0.05;
    const glow = float(0.01).div(abs(d.sub(thickness).negate())).pow(1.5);
    // Wait, simple glow is 1.0 / (abs(d) + epsilon)

    const intensity = float(0.05).div(abs(d));

    // const colorNode = vec3(0.2, 0.8, 1.0).mul(intensity);

    // Add some variation along the line
    // const variation = sin(uvNode.x.mul(10.0).add(time.mul(5.0))).mul(0.5).add(0.5);
    // const finalColor = colorNode.mul(variation);
    const finalColor = vec3(d2, 0, 0);


    const material = new MeshBasicNodeMaterial();
    material.colorNode = finalColor;
    material.transparent = true;

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[viewport.width, viewport.height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
