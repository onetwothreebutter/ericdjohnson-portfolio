'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { color, time, positionLocal, sin, vec3 } from 'three/tsl';
import { extend, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

// Extend so we can use meshBasicNodeMaterial as a JSX tag if needed, 
// though we usually pass the material instance or use the primitive.
// For now, let's create the material declaratively if possible, or imperatively.

export function ExampleShader() {
    const meshRef = useRef<THREE.Mesh>(null);

    // TSL: Create a dynamic color based on time and position
    // oscillating color: sin(time + position.x) * 0.5 + 0.5
    const colorNode = vec3(
        sin(time.add(positionLocal.x)).mul(0.5).add(0.5),
        sin(time.add(positionLocal.y).add(2.0)).mul(0.5).add(0.5),
        sin(time.add(positionLocal.z).add(4.0)).mul(0.5).add(0.5)
    );

    const material = new MeshBasicNodeMaterial();
    material.colorNode = colorNode;

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[2, 2, 2]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
