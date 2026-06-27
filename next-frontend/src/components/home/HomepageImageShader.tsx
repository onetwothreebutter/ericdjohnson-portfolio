"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useEffect, useMemo, useRef, Suspense } from "react";
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
uniform float uGlowWidth;
uniform float uPulseSpeed;
uniform float uPulseAmp;
uniform float uBloomRadius1;
uniform float uBloomRadius2;
uniform float uBloomThreshold;
uniform float uBloomThresholdStart;
uniform float uBloomIntensity;
uniform float uBloomIntensityStart;
uniform float uBloomStart;
uniform float uBloomEnd;
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
    float revealRadius = uReveal * 0.95 - 0.05 + sin(uTime * uPulseSpeed) * uPulseAmp;
    float boundary = revealRadius - dist + noise;
    float wipe = step(0.0, boundary);
    float glow = smoothstep(uGlowWidth, 0.0, abs(boundary));

    vec3 color = mix(edgeImage, original, wipe);
    color = mix(color, vec3(1.0), glow);

    // Bloom: single-pass additive glow. All parameters animate over the same scroll span.
    float bloomT = smoothstep(uBloomStart, uBloomEnd, uReveal);
    float r1 = uBloomRadius1 * bloomT;
    float r2 = uBloomRadius2 * bloomT;
    float bloomStr = uReveal * wipe;
    if (bloomStr > 0.0) {
        vec3 b = vec3(0.0);
        b += texture2D(uTexture, coverUv + vec2( r1,  0.0) * uTexelSize).rgb;
        b += texture2D(uTexture, coverUv + vec2(-r1,  0.0) * uTexelSize).rgb;
        b += texture2D(uTexture, coverUv + vec2( 0.0,  r1) * uTexelSize).rgb;
        b += texture2D(uTexture, coverUv + vec2( 0.0, -r1) * uTexelSize).rgb;
        b += texture2D(uTexture, coverUv + vec2( r2,  0.0) * uTexelSize).rgb * 0.5;
        b += texture2D(uTexture, coverUv + vec2(-r2,  0.0) * uTexelSize).rgb * 0.5;
        b += texture2D(uTexture, coverUv + vec2( 0.0,  r2) * uTexelSize).rgb * 0.5;
        b += texture2D(uTexture, coverUv + vec2( 0.0, -r2) * uTexelSize).rgb * 0.5;
        b /= 6.0;
        float threshold = mix(uBloomThresholdStart, uBloomThreshold, bloomT);
        float intensity = mix(uBloomIntensityStart, uBloomIntensity, bloomT);
        float bright = max(0.0, lum(b) - threshold);
        color += b * bright * bloomStr * intensity;
    }

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
}
`;

function ImagePlane({ onReady }: { onReady?: () => void }) {
    const map = useTexture("/images/homepage/eric-and-elwood-2.jpg", (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
    });
    const { viewport, size } = useThree();
    const readyFired = useRef(false);

    const { bloomRadius1, bloomRadius2, bloomThresholdStart, bloomThreshold, bloomIntensityStart, bloomIntensity, bloomStart, bloomEnd } = useControls("Bloom", {
        bloomRadius1:        { value: 1.5,  min: 1,   max: 40,  step: 0.5,  label: "Radius 1 (tight)" },
        bloomRadius2:        { value: 1.0,  min: 1,   max: 80,  step: 0.5,  label: "Radius 2 (wide)" },
        bloomThresholdStart: { value: 0.0,  min: 0.0, max: 1.0, step: 0.01, label: "Threshold start" },
        bloomThreshold:      { value: 0.0,  min: 0.0, max: 1.0, step: 0.01, label: "Threshold end" },
        bloomIntensityStart: { value: 40.0, min: 0.0, max: 40,  step: 0.1,  label: "Intensity start" },
        bloomIntensity:      { value: 3.8,  min: 0.0, max: 10,  step: 0.1,  label: "Intensity end" },
        bloomStart:          { value: 0.35, min: 0.0, max: 1.0, step: 0.01, label: "Reveal start" },
        bloomEnd:            { value: 0.72, min: 0.0, max: 1.0, step: 0.01, label: "Reveal end" },
    });

    const uniforms = useMemo(() => ({
        uTexture: { value: map },
        uScaleX: { value: 1.0 },
        uScaleY: { value: 1.0 },
        uTexelSize: { value: new THREE.Vector2(1 / 1920, 1 / 1080) },
        uTime: { value: 0.0 },
        uReveal: { value: 0.0 },
        uEdgeThreshold: { value: 0.2 },
        uNoiseSteps:     { value: 11 },
        uNoiseAmplitude: { value: 0.13 },
        uNoiseFrequency: { value: 49 },
        uGlowWidth:      { value: 0.01 },
        uPulseSpeed:     { value: 0.4 },
        uPulseAmp:       { value: 0.02 },
        uBloomRadius1:   { value: 1.5 },
        uBloomRadius2:   { value: 1.0 },
        uBloomThresholdStart: { value: 0.0 },
        uBloomThreshold:      { value: 0.0 },
        uBloomIntensityStart: { value: 40.0 },
        uBloomIntensity:      { value: 3.8 },
        uBloomStart:      { value: 0.35 },
        uBloomEnd:        { value: 0.72 },
    }), [map]);

    useFrame((_, delta) => {
        if (!readyFired.current) {
            readyFired.current = true;
            onReady?.();
        }
        uniforms.uTime.value += delta;
        uniforms.uReveal.value = scrollState.progress;
        uniforms.uBloomRadius1.value   = bloomRadius1;
        uniforms.uBloomRadius2.value   = bloomRadius2;
        uniforms.uBloomThresholdStart.value = bloomThresholdStart;
        uniforms.uBloomThreshold.value      = bloomThreshold;
        uniforms.uBloomIntensityStart.value = bloomIntensityStart;
        uniforms.uBloomIntensity.value      = bloomIntensity;
        uniforms.uBloomStart.value = bloomStart;
        uniforms.uBloomEnd.value   = bloomEnd;
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

export default function HomepageImageShader({ onReady }: { onReady?: () => void }) {
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Canvas camera={{ position: [0, 0, 1], fov: 75 }}>
                <Suspense fallback={null}>
                    <ImagePlane onReady={onReady} />
                </Suspense>
            </Canvas>
        </div>
    );
}
