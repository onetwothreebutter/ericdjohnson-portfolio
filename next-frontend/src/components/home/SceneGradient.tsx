import { MeshBasicNodeMaterial } from 'three/webgpu';
import { uv, vec3, Fn } from 'three/tsl';
import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';

export interface SceneGradientProps {
    position?: [number, number, number];
}

export function SceneGradient({ position = [0, 0, -0.9] }: SceneGradientProps) {
    const { viewport, camera } = useThree();

    // Calculate width/height to fill screen at 'z' depth
    const { width, height } = useMemo(() => {
        const z = position[2];
        const cam = camera as THREE.PerspectiveCamera;
        if (!cam.isPerspectiveCamera) return viewport;

        const distance = Math.abs(cam.position.z - z);
        const fov = (cam.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * distance;
        const w = h * (viewport.width / viewport.height);

        return { width: w, height: h };
    }, [camera, position, viewport]);

    const material = useMemo(() => {
        // Simple black color
        const colorNode = vec3(0.0, 0.0, 0.0);

        // Opacity gradient: 1.0 at top (uv.y=1), 0.0 at bottom (uv.y=0)
        // Matches linear-gradient(180deg, black 0%, transparent 100%)
        const opacityNode = uv().y;

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = colorNode;
        mat.opacityNode = opacityNode;
        mat.transparent = true;
        mat.depthWrite = false; // Don't write depth so we don't occlude things behind us if we were opaque (though we are transparent)

        return mat;
    }, []);



    return (
        <mesh position={position}>
            <planeGeometry args={[width, height]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}
