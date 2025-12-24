"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useVideoTexture } from "@react-three/drei";
import * as THREE from "three";


export default function ContentCube() {
    const meshRef = useRef<THREE.Mesh>(null!);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    // Rotation Target
    const targetQuaternion = useRef(new THREE.Quaternion());

    // Video URLs - using public domain/sample videos
    const videos = [
        "/EditionsWinter2025_1000px.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
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
            <VideoMaterial url={videos[0]} attach="material-0" rotation={faceRotations[0]} />
            {/* Left (-x) */}
            <VideoMaterial url={videos[1]} attach="material-1" rotation={faceRotations[1]} />
            {/* Top (+y) */}
            <VideoMaterial url={videos[2]} attach="material-2" rotation={faceRotations[2]} />
            {/* Bottom (-y) */}
            <VideoMaterial url={videos[3]} attach="material-3" rotation={faceRotations[3]} />
            {/* Front (+z) */}
            <meshStandardMaterial attach="material-4" color="white" transparent opacity={0.9}>
            </meshStandardMaterial>
            {/* Back (-z) */}
            <VideoMaterial url={videos[4]} attach="material-5" rotation={faceRotations[5]} />

            {/* Front Face Content */}
            <group position={[0, 0, 2.01]}>
                <Text
                    font="/fonts/brandonprinted-one-webfont.woff"
                    fontSize={0.5}
                    color="black"
                    anchorX="center"
                    anchorY="bottom"
                    position={[0, 0.2, 0]}
                >
                    Eric Johnson
                </Text>
                <Text
                    font="/fonts/brandonprinted-one-webfont.woff"
                    fontSize={0.25}
                    color="#1f2937"
                    anchorX="center"
                    anchorY="top"
                    position={[0, 0, 0]}
                    textAlign="center"
                    maxWidth={3.5}
                    lineHeight={1.5}
                >
                    Senior Frontend Developer & Vanquisher{"\n"}of Boring Websites
                </Text>
            </group>
        </mesh>
    );
}

interface VideoMaterialProps {
    url: string;
    attach: string;
    rotation?: number;
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
    varying vec2 vUv;

    // Rounded Box SDF for 2D (visualize box 0..1)
    float sdBox( in vec2 p, in vec2 b ) {
        vec2 d = abs(p)-b;
        return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
    }

    void main() {
        vec2 uv = vUv - 0.5;

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

        // --- Sampling & Masking ---
        // Check bounds 0..1
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
            // Outside video area -> Black
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        } else {
            vec4 texColor = texture2D(uTexture, uv);
            
            // --- SDF Fade ---
            // Distance from center of VIDEO UVs (0.5, 0.5)
            // Box size is 0.5 (half extend of 0..1)
            // We want to fade the last 5-10% of the video edges.
            
            // Re-center for SDF
            vec2 p = uv - 0.5;
            // Box half-size
            vec2 b = vec2(0.48); // Start fading slightly before edge (0.5)
            
            // SDF Calculation
            // d < 0 inside, d > 0 outside.
            // closer to 0 means closer to edge.
            // We want 1.0 at center, 0.0 at edge.
            
            // Let's us smoothstep on simple edge distance
            vec2 dist = abs(uv - 0.5);
            // 0.5 is edge. 
            // We want to start fading at 0.4 (internal) -> 1.0 opacity
            // End fading at 0.5 (edge) -> 0.0 opacity
            
            float feather = 0.1; // 10% fade
            float maskX = smoothstep(0.5, 0.5 - feather, dist.x);
            float maskY = smoothstep(0.5, 0.5 - feather, dist.y);
            
            float mask = maskX * maskY;

            gl_FragColor = vec4(texColor.rgb * mask, 1.0);
        }
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

function VideoMaterial({ url, attach, rotation = 0 }: VideoMaterialProps) {
    const texture = useVideoTexture(url);
    const [aspect, setAspect] = useState(1);

    useEffect(() => {
        if (texture?.image) {
            const { videoWidth, videoHeight } = texture.image;
            if (videoWidth && videoHeight) {
                setAspect(videoWidth / videoHeight);
            }
        }
    }, [texture, url]);

    useEffect(() => {
        if (texture) {
            texture.center.set(0.5, 0.5);
            texture.rotation = rotation;
            // No manual repeat/offset needed - Shader handles it via uAspect
        }
    }, [texture, rotation]);

    return (
        // @ts-ignore
        <videoFadeMaterial
            attach={attach}
            uTexture={texture}
            uAspect={aspect}
            toneMapped={false}
        />
    );
}
