import { OrbitControls, Splat, Text } from '@react-three/drei';
import { Suspense } from 'react';

export function GaussianSplat() {
    // using a popular sample splat file for demonstration
    // This is the "garden" scene often used in splat demos
    const url = 'https://antimatter15.com/splat/garden.splat';

    return (
        <>
            <OrbitControls makeDefault />
            <ambientLight intensity={0.5} />
            <Suspense fallback={<Text position={[0, 0, 0]} color="white">Loading Splat...</Text>}>
                <Splat src={url} position={[0, -1, 0]} rotation={[0, 0, 0]} scale={1} />
            </Suspense>
            <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <gridHelper args={[10, 10]} />
            </mesh>
            <Text
                position={[0, 2, 0]}
                fontSize={0.5}
                color="white"
                anchorX="center"
                anchorY="middle"
            >
                Gaussian Splat Demo
            </Text>
        </>
    );
}
