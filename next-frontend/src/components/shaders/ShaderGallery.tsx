'use client';

import { ShaderCanvas } from './ShaderCanvas';
import { ExampleShader } from './ExampleShader';
import { PowerfulTriangle } from './PowerfulTriangle';
import { SDFLine } from './SDFLine';


export function ShaderGallery() {
    return (
        <ShaderCanvas>
            {/* <group position={[-3, 0, 0]}>
                <ExampleShader />
            </group> */}
            <group position={[0, 0, 0]}>
                <PowerfulTriangle />
            </group>
            {/* <group position={[3, 0, 0]}>
                <SDFLine />
            </group> */}
        </ShaderCanvas>
    );
}
