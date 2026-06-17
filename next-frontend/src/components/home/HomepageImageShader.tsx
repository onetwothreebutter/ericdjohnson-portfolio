"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, Suspense } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */`
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */`
uniform sampler2D uTexture;
uniform float uScaleX;
uniform float uScaleY;
uniform vec2 uTexelSize;
uniform float uTime;
varying vec2 vUv;

float lum(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

void main() {
    vec2 coverUv = (vUv - 0.5) * vec2(uScaleX, uScaleY) + 0.5;

    float tl = lum(texture2D(uTexture, coverUv + uTexelSize * vec2(-1.0, -1.0)).rgb);
    float tc = lum(texture2D(uTexture, coverUv + uTexelSize * vec2( 0.0, -1.0)).rgb);
    float tr = lum(texture2D(uTexture, coverUv + uTexelSize * vec2( 1.0, -1.0)).rgb);
    float ml = lum(texture2D(uTexture, coverUv + uTexelSize * vec2(-1.0,  0.0)).rgb);
    float mr = lum(texture2D(uTexture, coverUv + uTexelSize * vec2( 1.0,  0.0)).rgb);
    float bl = lum(texture2D(uTexture, coverUv + uTexelSize * vec2(-1.0,  1.0)).rgb);
    float bc = lum(texture2D(uTexture, coverUv + uTexelSize * vec2( 0.0,  1.0)).rgb);
    float br = lum(texture2D(uTexture, coverUv + uTexelSize * vec2( 1.0,  1.0)).rgb);

    float gx = tr - tl + 2.0 * mr - 2.0 * ml + br - bl;
    float gy = bl - tl + 2.0 * bc - 2.0 * tc + br - tr;
    float edge = clamp(sqrt(gx * gx + gy * gy), 0.0, 1.0);

    // Wave sweeps left to right, repeating
    float waveX = mod(uTime * 0.3, 1.4) - 0.2;
    float reveal = smoothstep(0.15, 0.0, abs(vUv.x - waveX));

    vec3 original = texture2D(uTexture, coverUv).rgb;
    vec3 edgeView = vec3(edge);

    gl_FragColor = vec4(mix(edgeView, original, reveal), 1.0);
    #include <colorspace_fragment>
}
`;

function ImagePlane() {
    const map = useTexture("/images/homepage/eric-and-elwood-2.jpg", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
    });
    const { viewport, size } = useThree();

    const uniforms = useMemo(() => ({
        uTexture: { value: map },
        uScaleX: { value: 1.0 },
        uScaleY: { value: 1.0 },
        uTexelSize: { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
        uTime: { value: 0.0 },
    }), [map]);

    useFrame((_, delta) => {
        uniforms.uTime.value += delta;
    });

    useEffect(() => {
        const img = map.image as HTMLImageElement | undefined;
        if (!img?.width) return;
        const imageAspect = img.width / img.height;
        const screenAspect = size.width / size.height;
        if (screenAspect > imageAspect) {
            uniforms.uScaleX.value = 1;
            uniforms.uScaleY.value = imageAspect / screenAspect;
        } else {
            uniforms.uScaleX.value = screenAspect / imageAspect;
            uniforms.uScaleY.value = 1;
        }
    }, [map, size.width, size.height, uniforms]);

    useEffect(() => {
        uniforms.uTexelSize.value.set(1 / size.width, 1 / size.height);
    }, [size.width, size.height, uniforms]);

    return (
        <mesh scale={[viewport.width, viewport.height, 1]}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}

export default function HomepageImageShader() {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
                <Suspense fallback={null}>
                    <ImagePlane />
                </Suspense>
            </Canvas>
        </div>
    );
}
