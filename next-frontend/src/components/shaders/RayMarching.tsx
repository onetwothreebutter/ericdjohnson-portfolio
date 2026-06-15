'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree } from '@react-three/fiber';
import {
    vec3, vec4, Fn, float, Loop, Break,
    If, mix, sin, normalize,
    screenSize, max, dot, abs, length,
    uv, vec2, min, rotate, time, reflect, clamp
} from 'three/tsl';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { sdSphere } from './tsl/utils/sdf/shapes';
import { screenAspectUV } from './tsl/utils/function/screen_aspect_uv';
import { smax, smin } from './tsl/utils/sdf/operations';


export function RayMarching(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    const calcNormal = Fn(([p]: any[]) => {
        const eps = float(0.0001)
        const h = vec2(eps, 0)
        return normalize(
            vec3(
                mySdf(p.add(h.xyy)).sub(mySdf(p.sub(h.xyy))),
                mySdf(p.add(h.yxy)).sub(mySdf(p.sub(h.yxy))),
                mySdf(p.add(h.yyx)).sub(mySdf(p.sub(h.yyx))),
            ),
        )
    })

    const lighting = Fn(([rayOrigin, ray]: any[]) => {
        const light = vec3(0).toVar();
        const viewDir = normalize(rayOrigin.sub(ray))

        light.addAssign(vec3(0.01))

        // Diffuse lightiing 
        const normal = calcNormal(ray);
        const lightDir = vec3(1, 1, 1);
        const lightColor = vec3(1, 1, 0.9)
        // use the dot product to find the reflection
        const dotProduct = max(0, dot(lightDir, normal))

        const diffuse = dotProduct.mul(lightColor);

        // Hemisphere light - a mix between a sky and ground color based on normals. Here we're using a teal-blue for our `skyColor` and more of an orange-brown for the `groundColor`
        const skyColor = vec3(0, 0.3, 0.6)
        const groundColor = vec3(0.6, 0.3, 0.1)
        const hemiMix = normal.y.mul(0.5).add(0.5) // convert to 0 to 1
        const hemisphereColor = mix(skyColor, groundColor, hemiMix)

        /** 
         * Phong specular - Reflective light and highlights 
         */

        // Get the reflection vector
        const ph = normalize(reflect(lightDir.negate(), normal))

        // How much reflection is bouncing into the camera
        const phongValue = max(0, dot(viewDir, ph)).pow(32)

        const specular = vec3(phongValue).toVar()

        /**
         * Fresnel 
         */
        const fresnel = float(1)
            .sub(max(0, dot(viewDir, normal)))
            .pow(2)
        specular.mulAssign(fresnel);

        // Final lighting
        const finalLighting = light.mul(0.05).toVar()

        // Add diffuse lighting
        finalLighting.addAssign(diffuse.mul(0.05))
        finalLighting.addAssign(hemisphereColor.mul(0.02));
        finalLighting.addAssign(specular);


        return finalLighting;
    })

    const mySdf = Fn(([pos]: any[]) => {

        // rotation position around the z axis
        const rotatedPos = rotate(pos, vec3(0, 0, time))

        // create a displacement factor for each sphere
        const displace = sin(time).mul(0.3).toVar();

        const p1 = rotatedPos.add(vec2(displace), 0).toVar()
        const p2 = rotatedPos.sub(0, vec2(displace)).toVar()

        // Now rotate each of the positions independently
        p1.assign(rotate(p1, vec3(0, time.mul(1.5), 0)))
        p2.assign(rotate(p2, vec3(time.mul(0.75), 0, 0)))

        const s1 = sdSphere(p1, 0.5)
        const s2 = sdSphere(p2, 0.3)

        const s3 = sdSphere(p1.add(0, 0, 0.25), 0.2)
        const s4 = sdSphere(p2.add(0, 0, 0.25), 0.2)

        const firstShape = max(s1, s3.negate()).toVar()
        const secondShape = max(s2, s4.negate()).toVar()

        const finalShape = smin(firstShape, secondShape, 0.6)


        return finalShape
    })

    const main = Fn(() => {



        // Raymarching parameters
        const MAX_STEPS = 100;
        const MAX_DIST = 100.0;
        const SURF_DIST = 0.001;

        const _uv = screenAspectUV(screenSize);

        //set up
        const rayOrigin = vec3(0, 0, -3);
        const uvDirectionalRay = vec3(_uv, 1).normalize();
        const totalDist = float(0).toVar();


        const stepRay = rayOrigin.add(uvDirectionalRay.mul(totalDist)).toVar();
        const i = float(0).toVar();
        Loop({ start: 0, end: MAX_STEPS }, ({ i: _i }) => {
            i.assign(_i);

            // move the ray along
            stepRay.assign(rayOrigin.add(uvDirectionalRay.mul(totalDist)))

            // get the distance to the SDF
            const stepDist = mySdf(stepRay);

            //save it to total dist
            totalDist.addAssign(stepDist);


            If(stepDist.lessThan(SURF_DIST), () => {
                Break()
            })

            If(stepRay.length().greaterThan(MAX_DIST), () => {
                Break()
            })


        });

        // const col = vec3(totalDist, 0, 0);
        // const col = vec3(1, 0, 0);
        // return vec3(col);
        return lighting(rayOrigin, stepRay);
    });

    const material = useMemo(() => new MeshBasicNodeMaterial(), []);
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
