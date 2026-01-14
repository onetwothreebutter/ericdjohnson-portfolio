"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useVideoTexture, RoundedBox } from "@react-three/drei";
import * as THREE from "three";


export default function ContentCube() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    // Rotation Target
    const targetQuaternion = useRef(new THREE.Quaternion());

    // Video URLs - using public domain/sample videos
    const videos = [
        "/EditionsWinter2025-1-1-aspect-1200px.mp4",
        "/All-Editions-1200px.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",

        "/Editions-Winter2024-1200px.mp4",
    ];

    // Navigation State
    const [faceRotations, setFaceRotations] = useState([0, 0, 0, 0, 0, 0]);
    // Track roughly where we are to update specific faces
    const [currentFace, setCurrentFace] = useState(4); // Front

    // Adjacency for tracking which face comes next
    // 0:Right, 1:Left, 2:Top, 3:Bot, 4:Front, 5:Back
    const adjacency = [
        [4, 5, 2, 3], // Right
        [5, 4, 2, 3], // Left
        [1, 0, 5, 4], // Top
        [1, 0, 4, 5], // Bottom
        [1, 0, 2, 3], // Front
        [0, 1, 2, 3]  // Back
    ];

    // Face Local Ups (normalized)
    const faceReferenceVectors = [
        { up: new THREE.Vector3(0, 1, 0), forward: new THREE.Vector3(1, 0, 0) }, // Right (+x)
        { up: new THREE.Vector3(0, 1, 0), forward: new THREE.Vector3(-1, 0, 0) }, // Left (-x)
        { up: new THREE.Vector3(0, 0, -1), forward: new THREE.Vector3(0, 1, 0) }, // Top (+y) -> UV V aligns with -Z
        { up: new THREE.Vector3(0, 0, 1), forward: new THREE.Vector3(0, -1, 0) }, // Bottom (-y) 
        { up: new THREE.Vector3(0, 1, 0), forward: new THREE.Vector3(0, 0, 1) }, // Front (+z)
        { up: new THREE.Vector3(0, 1, 0), forward: new THREE.Vector3(0, 0, -1) } // Back (-z)
    ];

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (isAutoRotating) {
                // Auto-rotate the MESH directly
                meshRef.current.rotation.y += delta * 0.1;
                meshRef.current.rotation.x += delta * 0.05;

            } else {
                // Slerp to target
                meshRef.current.quaternion.slerp(targetQuaternion.current, 0.1);
            }
        }
    });

    // Keep track of auto-rotation state for event listener
    const isAutoRotatingRef = useRef(isAutoRotating);
    useEffect(() => {
        isAutoRotatingRef.current = isAutoRotating;
    }, [isAutoRotating]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!meshRef.current) return;

            // Stop auto-rotation immediately on interaction
            if (isAutoRotatingRef.current) {
                setIsAutoRotating(false);
                // Update target to current so it doesn't jump.
                targetQuaternion.current.copy(meshRef.current.quaternion);
            }

            const currentQ = targetQuaternion.current.clone(); // Current rotation state

            const q = new THREE.Quaternion();
            const axis = new THREE.Vector3();
            let angle = 0;
            let dir = -1;

            if (e.key === "ArrowLeft") {
                axis.set(0, 1, 0);
                angle = -Math.PI / 2;
                dir = 0;
            } else if (e.key === "ArrowRight") {
                axis.set(0, 1, 0);
                angle = Math.PI / 2;
                dir = 1;
            } else if (e.key === "ArrowUp") {
                axis.set(1, 0, 0);
                angle = Math.PI / 2;
                dir = 2;
            } else if (e.key === "ArrowDown") {
                axis.set(1, 0, 0);
                angle = -Math.PI / 2;
                dir = 3;
            }

            if (dir !== -1) {
                // Apply rotation in WORLD SPACE
                // We want to rotate around World Axis 'axis'
                // WorldRot = Axis * Angle
                // NewQ = WorldRot * CurrentQ
                // Determine next face
                const nextFace = adjacency[currentFace][dir];
                setCurrentFace(nextFace);

                // Calculate target rotation to snap to world axis
                // We want the new face's UP to be World Y (0,1,0)
                // and the new face's FORWARD to be World Z (0,0,1) (facing camera)
                const targetRef = faceReferenceVectors[nextFace];
                const vU = targetRef.up.clone();
                const vF = targetRef.forward.clone();
                const vR = new THREE.Vector3().crossVectors(vU, vF);

                const mLocal = new THREE.Matrix4().makeBasis(vR, vU, vF);
                // The target rotation is the inverse (transpose) of the local basis matrix
                const nextQ = new THREE.Quaternion().setFromRotationMatrix(mLocal.transpose());

                targetQuaternion.current.copy(nextQ);

                // Calculate Texture Rotation
                // TotalQ is just nextQ now
                const ref = faceReferenceVectors[nextFace];
                const worldUp = ref.up.clone().applyQuaternion(nextQ);

                const x = worldUp.x;
                const y = worldUp.y;

                // Handle precision issues close to 0
                const fixZero = (n: number) => Math.abs(n) < 0.001 ? 0 : n;
                const angleToUp = Math.atan2(fixZero(x), fixZero(y));

                setFaceRotations(prev => {
                    const next = [...prev];
                    next[nextFace] = angleToUp;
                    return next;
                });
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentFace]);

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[4, 4, 4]} />
            {/* Right (+x) */}
            <VideoMaterial url={videos[0]} attach="material-0" rotation={faceRotations[0]} isActive={currentFace === 0} />
            {/* Left (-x) */}
            <VideoMaterial url={videos[1]} attach="material-1" rotation={faceRotations[1]} isActive={currentFace === 1} />
            {/* Top (+y) */}
            <VideoMaterial url={videos[2]} attach="material-2" rotation={faceRotations[2]} isActive={currentFace === 2} />
            {/* Bottom (-y) */}
            <VideoMaterial url={videos[3]} attach="material-3" rotation={faceRotations[3]} isActive={currentFace === 3} />
            {/* Front (+z) */}
            <meshStandardMaterial attach="material-4" color="white">
            </meshStandardMaterial>
            {/* Back (-z) */}
            <VideoMaterial url={videos[4]} attach="material-5" rotation={faceRotations[5]} isActive={currentFace === 5} />

            {/* Front Face Content */}
            <group position={[0, 0, 2.01]}>
                <Text
                    font="/fonts/brandonprinted-one-webfont.woff"
                    fontSize={0.7}
                    color="black"
                    anchorX="center"
                    anchorY="bottom"
                    position={[0, -0.15, 0]}
                >
                    Eric{"\n"}Johnson
                </Text>
                <Text
                    font="/fonts/brandonprinted-one-webfont.woff"
                    fontSize={0.2}
                    color="#1f2937"
                    anchorX="center"
                    anchorY="top"
                    position={[0, -0.5, 0]}
                    textAlign="right"
                    maxWidth={3.5}
                    lineHeight={1.5}
                >
                    Senior Frontend Developer & Vanquisher of Boring Websites
                </Text>
            </group>
        </mesh>
    );
}

interface VideoMaterialProps {
    url: string;
    attach: string;
    rotation?: number;
    isActive?: boolean;
}

import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";

// --- Custom Shader Material ---
// This shader handles:
// 1. "Containing" the video within the UV space (preserving aspect ratio)
// 2. Fading the edges (SDF) to avoid hard cuts or streaks 
const VideoFadeMaterial = shaderMaterial(
    {
        uTexture: new THREE.Texture(),
        uAspect: 1.0, // Video Aspect Ratio (Width / Height)
        uUVScale: 1.0, // Scale factor for UVs (e.g. 4.0 for a 4x4 box)
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    // Fragment Shader
    `
    uniform sampler2D uTexture;
    uniform float uAspect;
    uniform float uUVScale;
    varying vec2 vUv;

    void main() {
        // Normalize UVs if they are scaled (e.g. world units)
        vec2 normalizedUv = vUv / uUVScale;
        vec2 uv = normalizedUv - 0.5;
        
        // --- Aspect Ratio Correction (Contain) ---
        // If uAspect > 1 (Wide): Scale Y up (so texture repeats/clamps sooner).
        // If uAspect < 1 (Tall): Scale X up.
        vec2 scale = vec2(1.0);
        if (uAspect > 1.0) {
            scale.y = uAspect;
        } else {
            scale.x = 1.0 / uAspect;
        }
        
        uv = uv * scale + 0.5;

        // --- Sampling ---
        // REMOVED manual bounds check to allow smearing on rounded edges (if any)
        // Standard box will just map 0-1 perfectly.
        vec4 texColor = texture2D(uTexture, uv);
        gl_FragColor = vec4(texColor.rgb, 1.0);
    }
    `
);

extend({ VideoFadeMaterial });

// Add type definition for the custom material
declare global {
    namespace JSX {
        interface IntrinsicElements {
            videoFadeMaterial: any;
        }
    }
}

function VideoMaterial({ url, attach, rotation = 0, isActive = false }: VideoMaterialProps) {
    const texture = useVideoTexture(url);

    useEffect(() => {
        if (texture) {
            texture.center.set(0.5, 0.5);
            texture.rotation = rotation;
            // No manual repeat/offset needed - Shader handles it via uAspect
        }
    }, [texture, rotation]);

    useEffect(() => {
        if (isActive && texture && texture.image) {
            const video = texture.image as HTMLVideoElement;
            video.currentTime = 0;
            // video.play() is usually handled by useVideoTexture but safe to ensure
            video.play().catch(() => { });
        }
    }, [isActive, texture]);

    return (
        // @ts-ignore
        <videoFadeMaterial
            attach={attach}
            uTexture={texture}
            uAspect={1.0} // Force 1.0 to stretch/fill the square face
            uUVScale={1.0} // BoxGeometry UVs are 0..1 per face
            toneMapped={false}
        />
    );
}
