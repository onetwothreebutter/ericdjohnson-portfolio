"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, useVideoTexture, RoundedBox, Html } from "@react-three/drei";
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
            <Html
                transform
                position={[0, 0, 2.01]}
                rotation={[0, 0, 0]}
                occlude={true}
                scale={0.19}
            >
                <div className="flex flex-col items-center justify-center text-center select-none w-[800px] h-[800px] bg-white text-black p-10">
                    <h1 className="text-[140px] font-black mb-8 leading-none tracking-tighter font-brandon">
                        Eric<br />Johnson
                    </h1>
                    <p className="text-5xl font-bold opacity-80 max-w-2xl leading-tight font-brandon">
                        Senior Frontend Developer & Vanquisher of Boring Websites
                    </p>
                </div>
            </Html>
        </mesh >
    );
}

interface VideoMaterialProps {
    url: string;
    attach: string;
    rotation?: number;
    isActive?: boolean;
}

import { extend } from "@react-three/fiber";

// --- Custom Shader Material ---
// This shader handles:
// 1. "Containing" the video within the UV space (preserving aspect ratio)
// 2. Fading the edges (SDF) to avoid hard cuts or streaks 
// --- Custom TSL Material ---
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { texture, uv, uniform, vec2, float, If, Fn } from 'three/tsl';

function VideoMaterial({ url, attach, rotation = 0, isActive = false }: VideoMaterialProps) {
    const textureMap = useVideoTexture(url);

    // Ensure texture settings
    useEffect(() => {
        if (textureMap) {
            textureMap.center.set(0.5, 0.5);
            textureMap.rotation = rotation;
        }
    }, [textureMap, rotation]);

    // Handle playback
    useEffect(() => {
        if (isActive && textureMap && textureMap.image) {
            const video = textureMap.image as HTMLVideoElement;
            video.currentTime = 0;
            video.play().catch(() => { });
        }
    }, [isActive, textureMap]);

    const material = useMemo(() => {
        // const uTexture = uniform(textureMap); // Not needed for texture()
        const uAspect = uniform(1.0); // Default aspect
        const uUVScale = uniform(1.0); // Default scale

        const main = Fn(() => {
            // TSL Implementation of the previous GLSL logic
            const vUv = uv();

            // Normalize UVs
            const normalizedUv = vUv.div(uUVScale);
            const centeredUv = normalizedUv.sub(0.5);

            // Aspect Ratio Correction
            const scale = vec2(1.0).toVar();

            If(uAspect.greaterThan(1.0), () => {
                scale.y.assign(uAspect);
            }).Else(() => {
                scale.x.assign(float(1.0).div(uAspect));
            });

            const finalUv = centeredUv.mul(scale).add(0.5);

            return texture(textureMap, finalUv);
        });

        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        mat.transparent = true; // Ensure transparency logic if needed, though video is usually opaque.
        return mat;
    }, [textureMap]);

    return (
        <primitive
            object={material}
            attach={attach}
        />
    );
}
