"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, Suspense } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import { scrollState } from "@/lib/scrollState";

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
uniform float uReveal;
uniform float uEdgeThreshold;
uniform float uNoiseSteps;
uniform float uNoiseAmplitude;
uniform float uNoiseFrequency;
varying vec2 vUv;

float lum(vec3 c) {
    return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
}

float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
        u.y
    );
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
        v += a * valueNoise(p);
        p = p * 2.1 + vec2(3.7, 1.3);
        a *= 0.5;
    }
    return v;
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
    float edgeStrength = clamp(sqrt(gx * gx + gy * gy), 0.0, 1.0);

    float edgeMask = smoothstep(uEdgeThreshold, uEdgeThreshold + 0.05, edgeStrength);
    vec3 edgeImage = vec3(edgeMask);

    vec3 original = texture2D(uTexture, coverUv).rgb;

    // Radial wipe with posterized value noise — quantized steps give pixelated organic edge
    float dist = length(vUv - 0.5);
    float noise = fbm(vUv * uNoiseFrequency + uTime * 0.08);
    noise = floor(noise * uNoiseSteps) / uNoiseSteps * uNoiseAmplitude;
    float revealRadius = uReveal * 0.95 - 0.05;
    float wipe = step(0.0, revealRadius - dist + noise);

    gl_FragColor = vec4(mix(edgeImage, original, wipe), 1.0);
    #include <colorspace_fragment>
}
`;

function ImagePlane() {
    const map = useTexture("/images/homepage/eric-and-elwood-2.jpg", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
    });
    const { viewport, size } = useThree();

    const { edgeThreshold } = useControls("Edge Highlight", {
        edgeThreshold: { value: 0.2, min: 0.0, max: 1.0, step: 0.01, label: "Threshold" },
    });

    const { noiseSteps, noiseAmplitude, noiseFrequency } = useControls("Wipe Noise", {
        noiseSteps:     { value: 11,   min: 1,   max: 20,  step: 1,    label: "Steps" },
        noiseAmplitude: { value: 0.13, min: 0.0, max: 0.5, step: 0.01, label: "Amplitude" },
        noiseFrequency: { value: 49,   min: 0.5, max: 64,  step: 0.5,  label: "Frequency" },
    });

    const uniforms = useMemo(() => ({
        uTexture: { value: map },
        uScaleX: { value: 1.0 },
        uScaleY: { value: 1.0 },
        uTexelSize: { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
        uTime: { value: 0.0 },
        uReveal: { value: 0.0 },
        uEdgeThreshold: { value: 0.2 },
        uNoiseSteps:     { value: 6 },
        uNoiseAmplitude: { value: 0.25 },
        uNoiseFrequency: { value: 4.0 },
    }), [map]);

    useFrame((_, delta) => {
        uniforms.uTime.value += delta;
        uniforms.uReveal.value = scrollState.progress;
        uniforms.uEdgeThreshold.value = edgeThreshold;
        uniforms.uNoiseSteps.value     = noiseSteps;
        uniforms.uNoiseAmplitude.value = noiseAmplitude;
        uniforms.uNoiseFrequency.value = noiseFrequency;
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
