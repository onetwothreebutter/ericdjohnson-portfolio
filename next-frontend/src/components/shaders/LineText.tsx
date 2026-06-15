"use client";

import {
  Montserrat,
  Unbounded,
  Syne,
  Space_Mono,
  Geist_Mono,
  Bricolage_Grotesque,
  Oswald,
  DM_Sans,
} from "next/font/google";
import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  vec2,
  vec4,
  vec3,
  uv,
  float,
  Fn,
  uniform,
  fract,
  abs,
  smoothstep,
  texture,
  fwidth,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useControls, LevaInputs, button, folder } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";

const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });
const unbounded = Unbounded({ weight: "800", subsets: ["latin"] });
const syne = Syne({ weight: "800", subsets: ["latin"] });
const spaceMono = Space_Mono({ weight: "700", subsets: ["latin"] });
const geistMono = Geist_Mono({ weight: "800", subsets: ["latin"] });
const bricolageGrotesque = Bricolage_Grotesque({ weight: "800", subsets: ["latin"] });
const oswald = Oswald({ weight: "700", subsets: ["latin"] });
const dmSans = DM_Sans({ weight: "800", subsets: ["latin"] });

const fontMap = {
  Montserrat: montserrat,
  Unbounded: unbounded,
  Syne: syne,
  "Space Mono": spaceMono,
  "Geist Mono": geistMono,
  "Bricolage Grotesque": bricolageGrotesque,
  Oswald: oswald,
  "DM Sans": dmSans,
};

type PaletteVec = [number, number, number];
type Palette = { a: PaletteVec; b: PaletteVec; c: PaletteVec; d: PaletteVec };
const palettes: Record<string, Palette> = {
  Rainbow: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
  "Cool Blue": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
  "Neon Heat": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
  Cyberpunk: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
  Golden: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

const CANVAS_SIZE = 1024;

function drawText(tex: THREE.CanvasTexture, text: string, font: string, size: number, capRadius: number) {
  const canvas = tex.image as HTMLCanvasElement;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (text) {
    // Draw text onto a transparent offscreen canvas so compositing doesn't
    // overwrite the blurred halo with the black background.
    const off = document.createElement("canvas");
    off.width = CANVAS_SIZE;
    off.height = CANVAS_SIZE;
    const octx = off.getContext("2d")!;
    octx.font = `bold ${size}px ${font}, sans-serif`;
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "white";
    octx.fillText(text, CANVAS_SIZE / 2, CANVAS_SIZE / 2);

    // Blurred pass — creates smooth falloff at text edges for rounded ends.
    if (capRadius > 0) {
      ctx.filter = `blur(${capRadius}px)`;
      ctx.drawImage(off, 0, 0);
      ctx.filter = "none";
    }
    // Hard pass on top — keeps the text interior solid white (full thickness).
    ctx.drawImage(off, 0, 0);
  }
  tex.needsUpdate = true;
}

export function LineText(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, camera, viewport } = useThree();
  const setRef = useRef<any>(null);

  const uRows          = useMemo(() => uniform(80.0), []);
  const uAspect        = useMemo(() => uniform(1.0), []);
  const uBaseThickness = useMemo(() => uniform(0.02), []);
  const uTextThickness = useMemo(() => uniform(0.4), []);
  const uA             = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB             = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC             = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD             = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);

  const [textTex] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));

  const [controls, set] = useControls("Line Text", () => ({
    text: { value: "HELLO", label: "Text", type: LevaInputs.STRING },
    fontFamily: { value: "Montserrat", label: "Font", options: Object.keys(fontMap) },
    fontSize: { value: 600, min: 50, max: 950, step: 1, label: "Font Size" },
    capRadius: { value: 20, min: 0, max: 100, step: 1, label: "Cap Radius" },
    rows: {
      value: 80,
      min: 5,
      max: 500,
      step: 1,
      label: "Rows",
      onChange: (v: number) => { uRows.value = v; },
    },
    baseThickness: {
      value: 0.02,
      min: 0.001,
      max: 0.5,
      step: 0.001,
      label: "Base Thickness",
      onChange: (v: number) => { uBaseThickness.value = v; },
    },
    textThickness: {
      value: 0.4,
      min: 0.0,
      max: 0.5,
      step: 0.01,
      label: "Text Thickness",
      onChange: (v: number) => { uTextThickness.value = v; },
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
      Randomize: button(() => {
        const r = () => Math.random();
        const newA: [number, number, number] = [r() * 0.4 + 0.3, r() * 0.4 + 0.3, r() * 0.4 + 0.3];
        const newB: [number, number, number] = [r() * 0.4 + 0.3, r() * 0.4 + 0.3, r() * 0.4 + 0.3];
        const newC: [number, number, number] = [r() * 1.5 + 0.5, r() * 1.5 + 0.5, r() * 1.5 + 0.5];
        const newD: [number, number, number] = [r(), r(), r()];
        setRef.current?.({ a: newA, b: newB, c: newC, d: newD });
        uA.value.set(...newA); uB.value.set(...newB);
        uC.value.set(...newC); uD.value.set(...newD);
      }),
    }),
    Export: folder({
      exportWidth:  { value: 4500, min: 100, max: 9000, step: 10, label: "Width" },
      exportHeight: { value: 4500, min: 100, max: 9000, step: 10, label: "Height" },
    }),
  }));
  setRef.current = set;

  const { text, fontFamily, fontSize, capRadius, exportWidth, exportHeight } = controls as any;

  const fontFamilyString = fontMap[fontFamily as keyof typeof fontMap]?.style.fontFamily ?? fontFamily;

  useEffect(() => {
    drawText(textTex, text, fontFamilyString, fontSize, capRadius);
  }, [textTex, text, fontFamilyString, fontSize, capRadius]);

  useFrame(() => {
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

  const exportSettingsRef = useRef({ exportWidth: 4500, exportHeight: 4500 });
  exportSettingsRef.current = { exportWidth, exportHeight };

  const handleExport = useCallback(() => {
    if (!meshRef.current) return;
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return;

    const { exportWidth: targetWidth } = exportSettingsRef.current;

    const originalSize = new THREE.Vector2();
    gl.getSize(originalSize);
    const originalPixelRatio = gl.getPixelRatio();
    const originalBackground = scene.background;

    const targetHeight = Math.round(targetWidth * (originalSize.y / originalSize.x));

    gl.setSize(targetWidth, targetHeight, false);
    gl.setPixelRatio(1);

    scene.background = null;
    gl.setClearColor(0x000000, 0);
    gl.render(scene, camera);

    const dataUrl = gl.domElement.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = "line-text.png";
    link.href = dataUrl;
    link.click();

    gl.setSize(originalSize.x, originalSize.y, false);
    gl.setPixelRatio(originalPixelRatio);
    scene.background = originalBackground;
    gl.render(scene, camera);
  }, [gl, scene, camera]);

  useControls("Line Text", { "Export PNG": button(handleExport) }, [handleExport]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();

      // Sample text canvas: 1 where text exists, 0 elsewhere
      const textSample = texture(textTex, uvCoord).r;

      // Position within row, centered at 0
      const rowY = fract(uvCoord.y.mul(uRows));
      const distFromCenter = abs(rowY.sub(0.5));

      // Half-thickness: thin base, expanded where text appears
      const halfThickness = uBaseThickness.add(textSample.mul(uTextThickness));

      // SDF: negative inside line, positive outside
      const d = distFromCenter.sub(halfThickness);
      const aa = fwidth(d).mul(0.5);
      const lineMask = float(1).sub(smoothstep(aa.negate(), aa, d));

      // Color from cosine palette along x-axis
      const col = (cosinePalette as any)(uvCoord.x, uA, uB, uC, uD);

      return vec4(col, lineMask);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [uRows, uBaseThickness, uTextThickness, uA, uB, uC, uD, textTex]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
