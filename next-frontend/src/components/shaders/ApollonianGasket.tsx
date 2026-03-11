"use client";

import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  vec2,
  vec4,
  uv,
  float,
  Fn,
  uniform,
  fract,
  length,
  min,
  max,
  dot,
  Loop,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useControls, folder } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";

const palettes = {
  Rainbow: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
  "Cool Blue": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
  "Neon Heat": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
  Cyberpunk: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
  Golden: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

export function ApollonianGasket(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, viewport } = useThree();
  const setRef = useRef<any>(null);

  const uTime = useMemo(() => uniform(0.0), []);
  const uAspect = useMemo(() => uniform(1.0), []);
  // Inversion scale: controls density/branching of the gasket
  const uScale = useMemo(() => uniform(1.5), []);
  const uZoom = useMemo(() => uniform(1.0), []);
  const uColorSpeed = useMemo(() => uniform(0.05), []);
  const uColorScale = useMemo(() => uniform(5.0), []);
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);

  const [controls, set] = useControls("Apollonian Gasket", () => ({
    // Baked at shader compile time — changing rebuilds the material
    iterations: { value: 20, min: 1, max: 40, step: 1, label: "Iterations" },
    scale: {
      value: 1.5,
      min: 0.1,
      max: 3.0,
      step: 0.01,
      label: "Scale",
      onChange: (v: number) => { uScale.value = v; },
    },
    zoom: {
      value: 1.0,
      min: 0.1,
      max: 10.0,
      step: 0.05,
      label: "Zoom",
      onChange: (v: number) => { uZoom.value = v; },
    },
    animate: { value: true, label: "Animate" },
    colorSpeed: {
      value: 0.05,
      min: 0.0,
      max: 0.5,
      step: 0.005,
      label: "Color Speed",
      onChange: (v: number) => { uColorSpeed.value = v; },
    },
    colorScale: {
      value: 5.0,
      min: 0.1,
      max: 20.0,
      step: 0.1,
      label: "Color Scale",
      onChange: (v: number) => { uColorScale.value = v; },
    },
    Palette: folder({
      palette: {
        value: "Rainbow",
        options: Object.keys(palettes),
        onChange: (v: string) => {
          const p = palettes[v as keyof typeof palettes];
          if (!p) return;
          setRef.current?.({ a: p.a, b: p.b, c: p.c, d: p.d });
          uA.value.set(...(p.a as [number, number, number]));
          uB.value.set(...(p.b as [number, number, number]));
          uC.value.set(...(p.c as [number, number, number]));
          uD.value.set(...(p.d as [number, number, number]));
        },
      },
      a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uA.value.set(...v) },
      b: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uB.value.set(...v) },
      c: { value: [1.0, 1.0, 1.0], onChange: (v: [number, number, number]) => uC.value.set(...v) },
      d: { value: [0.0, 0.33, 0.67], onChange: (v: [number, number, number]) => uD.value.set(...v) },
    }),
  }));
  setRef.current = set;

  const { iterations, animate } = controls as any;

  useFrame(({ clock }) => {
    if (animate) uTime.value = clock.getElapsedTime();
    uAspect.value = viewport.width / viewport.height;
  });

  const { width, height } = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return { width: viewport.width, height: viewport.height };
    const distance = Math.abs(cam.position.z);
    const fov = (cam.fov * Math.PI) / 180;
    const h = 2 * Math.tan(fov / 2) * distance;
    const w = h * (viewport.width / viewport.height);
    return { width: w, height: h };
  }, [camera, viewport]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();

      // Center and apply aspect ratio correction, then zoom
      const p = vec2(
        uvCoord.x.sub(0.5).mul(2.0).mul(uAspect),
        uvCoord.y.sub(0.5).mul(-2.0)
      ).div(uZoom).toVar();

      // Accumulated inversion scale — used to normalise the orbit distance
      const scale = float(1.0).toVar();
      // Minimum distance seen across the orbit (orbit trap)
      const minD = float(1000.0).toVar();

      // Apollonian iteration: repeated lattice folding + sphere inversion.
      // The lattice fold wraps p into the [-1, 1] square (torus topology),
      // and the sphere inversion p → s·p/|p|² creates the self-similar
      // circle-packing structure characteristic of the Apollonian gasket.
      Loop(iterations, () => {
        // Fold into [-1, 1] torus: fract(p/2 + 0.5) * 2 - 1
        p.assign(fract(p.mul(0.5).add(0.5)).mul(2.0).sub(1.0));

        // Sphere inversion: scale = s / |p|²
        const r2 = max(dot(p, p), float(1e-6));
        const k = uScale.div(r2);
        p.mulAssign(k);
        scale.mulAssign(k);

        // Track the smallest normalised distance seen (orbit trap)
        minD.assign(min(minD, length(p).div(scale)));
      });

      // Map orbit trap distance through cosine palette + time shift
      const t = minD.mul(uColorScale).add(uTime.mul(uColorSpeed));
      const col = (cosinePalette as any)(t, uA, uB, uC, uD);

      return vec4(col, 1.0);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    return mat;
  }, [iterations, uTime, uAspect, uZoom, uScale, uColorScale, uColorSpeed, uA, uB, uC, uD]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
