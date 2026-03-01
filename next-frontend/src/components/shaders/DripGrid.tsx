'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree, extend, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import {
    vec2, sin, cos, mul, add, mix, mod,
    abs, color, time, positionLocal, vec3, Fn, uv,
    uniform, screenSize, float, fract, step,
    length, PI, floor, smoothstep, max, min
} from 'three/tsl';
import { sdSphere } from './tsl/utils/sdf/shapes';

import { useControls } from 'leva';

export function DripGrid(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    const { gridColumns, gridRows, sphereSize } = useControls({
        gridColumns: { value: 5, min: 1, max: 20, step: 1, label: 'Columns' },
        gridRows: { value: 4, min: 1, max: 20, step: 1, label: 'Rows' },
        sphereSize: { value: 0.45, min: 0.01, max: 0.5, step: 0.01, label: 'Sphere Size' }
    });

    const uGridColumns = useMemo(() => uniform(gridColumns), []);
    const uGridRows = useMemo(() => uniform(gridRows), []);
    const uSphereSize = useMemo(() => uniform(sphereSize), []);

    useFrame(() => {
        uGridColumns.value = gridColumns;
        uGridRows.value = gridRows;
        uSphereSize.value = sphereSize;
    });

    const main = Fn(() => {
        // Use standard 0-1 UVs
        const _uv = uv();

        // Define grid dimensions from uniforms
        const gridX = float(uGridColumns);
        const gridY = float(uGridRows);
        const gridDims = vec2(gridX, gridY);

        // Create grid coordinates
        const gridUV = _uv.mul(gridDims);
        const id = floor(gridUV);
        const gv = fract(gridUV).sub(0.5); // Local UVs (-0.5 to 0.5)

        // Correct aspect ratio for circular spheres
        const aspect = screenSize.x.div(screenSize.y);
        const cellAspect = aspect.mul(gridY.div(gridX));

        // Scale gv.x by cell aspect to maintain circularity
        const gvCorrected = vec2(gv.x.mul(cellAspect), gv.y);

        // Calculate dynamic radius to ensure sphere fits in the cell regardless of aspect ratio
        // Cell width in corrected space is 1.0 * cellAspect
        // Cell height in corrected space is 1.0
        // We need radius < 0.5 * cellAspect AND radius < 0.5
        // uSphereSize should be the base size relative to the cell (max 0.5)
        const radius = float(uSphereSize).mul(min(float(1.0), cellAspect).mul(2.0));

        // Calculate SDF for sphere in each cell
        const sphereDist = sdSphere(gvCorrected, radius);

        // Visualizing the SDF
        // smooth edge
        const col = smoothstep(0.01, -0.01, sphereDist);

        return vec3(col);
    });

    const material = new MeshBasicNodeMaterial();
    material.colorNode = main();

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
