"use client";

import {
  Space_Mono,
  Roboto_Mono,
  Source_Code_Pro,
  JetBrains_Mono,
  IBM_Plex_Mono,
  Fira_Code,
  Inconsolata,
  Courier_Prime,
  Share_Tech_Mono,
  Cutive_Mono,
  DM_Mono,
  Fragment_Mono,
  Azeret_Mono,
  Spline_Sans_Mono,
  Geist_Mono,
  Syne,
  Unbounded,
  Bricolage_Grotesque,
  Epilogue,
  DM_Sans,
  Oswald,
  Montserrat,
} from "next/font/google";
import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  vec2,
  vec4,
  uv,
  float,
  Fn,
  uniform,
  uniformArray,
  fract,
  floor,
  mix,
  step,
  smoothstep,
  abs,
  texture,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useCallback, useState, useEffect } from "react";
import * as THREE from "three";
import { useControls, button, folder, LevaInputs } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";

const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["500"], subsets: ["latin"] });
const courierPrime = Courier_Prime({ weight: ["400", "700"], subsets: ["latin"] });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });
const cutiveMono = Cutive_Mono({ weight: "400", subsets: ["latin"] });
const dmMono = DM_Mono({ weight: ["300", "400", "500"], subsets: ["latin"] });
const fragmentMono = Fragment_Mono({ weight: "400", subsets: ["latin"] });
const robotoMono = Roboto_Mono({ weight: "500", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ weight: "500", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({ weight: "500", subsets: ["latin"] });
const firaCode = Fira_Code({ weight: "500", subsets: ["latin"] });
const inconsolata = Inconsolata({ weight: "500", subsets: ["latin"] });
const azeretMono = Azeret_Mono({ weight: "500", subsets: ["latin"] });
const splineSansMono = Spline_Sans_Mono({ weight: "500", subsets: ["latin"] });
const geistMono = Geist_Mono({ weight: "500", subsets: ["latin"] });
const syne = Syne({ weight: "500", subsets: ["latin"] });
const unbounded = Unbounded({ weight: "500", subsets: ["latin"] });
const bricolageGrotesque = Bricolage_Grotesque({ weight: "500", subsets: ["latin"] });
const epilogue = Epilogue({ weight: "500", subsets: ["latin"] });
const dmSans = DM_Sans({ weight: "500", subsets: ["latin"] });
const oswald = Oswald({ weight: "400", subsets: ["latin"] });
const montserrat = Montserrat({ weight: "500", subsets: ["latin"] });

const fontMap = {
  "Space Mono": spaceMono,
  "Roboto Mono": robotoMono,
  "Source Code Pro": sourceCodePro,
  "JetBrains Mono": jetBrainsMono,
  "IBM Plex Mono": ibmPlexMono,
  "Fira Code": firaCode,
  Inconsolata: inconsolata,
  "Courier Prime": courierPrime,
  "Share Tech Mono": shareTechMono,
  "Cutive Mono": cutiveMono,
  "DM Mono": dmMono,
  "Fragment Mono": fragmentMono,
  "Azeret Mono": azeretMono,
  "Spline Sans Mono": splineSansMono,
  "Geist Mono": geistMono,
  Syne: syne,
  Unbounded: unbounded,
  "Bricolage Grotesque": bricolageGrotesque,
  Epilogue: epilogue,
  "DM Sans": dmSans,
  Oswald: oswald,
  Montserrat: montserrat,
};

const CANVAS_SIZE = 2048;

const PHI = 1.6180339887498948;
const TALL_FRAC = PHI / (PHI + 1); // ≈ 0.618
const SHORT_FRAC = 1 / (PHI + 1); // ≈ 0.382

function tiltTan(deg: number) {
  return Math.tan((deg * Math.PI) / 180);
}

// 19 cumulative thresholds covering up to 20 rows. Unused slots = 1.0.
function computeThresholds(weights: number[]): number[] {
  const total = weights.reduce((a, b) => a + b, 0);
  const out = new Array(19).fill(1.0);
  let cumSum = 0;
  for (let i = 0; i < weights.length - 1; i++) {
    cumSum += weights[i] / total;
    out[i] = cumSum;
  }
  return out;
}

function computeFibThresholds(rowCount: number): number[] {
  const fibs: number[] = [1, 1];
  for (let i = 2; i < rowCount; i++) fibs.push(fibs[i - 1] + fibs[i - 2]);
  return computeThresholds(fibs.slice(0, rowCount));
}

// Equal temperament: each row is 2^(1/12) taller than the previous.
function computeEqTempThresholds(rowCount: number): number[] {
  const weights = Array.from({ length: rowCount }, (_, i) => Math.pow(2, i / 12));
  return computeThresholds(weights);
}

// Sine: row heights follow a half-sine arch — shortest at edges, tallest in the middle.
function computeSineThresholds(rowCount: number): number[] {
  const weights = Array.from({ length: rowCount }, (_, i) =>
    Math.sin(((i + 0.5) * Math.PI) / rowCount)
  );
  return computeThresholds(weights);
}

// Value noise: smooth random heights via interpolation between hashed lattice points.
function computeNoiseThresholds(rowCount: number, seed: number): number[] {
  function hash(n: number) {
    const x = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  function smoothstep(t: number) { return t * t * (3 - 2 * t); }
  const scale = 2.5; // ~2-3 smooth oscillations across the rows
  const weights = Array.from({ length: rowCount }, (_, i) => {
    const p = (i / Math.max(rowCount - 1, 1)) * scale;
    const i0 = Math.floor(p);
    const f = p - i0;
    return (hash(i0) + (hash(i0 + 1) - hash(i0)) * smoothstep(f)) * 0.8 + 0.2;
  });
  return computeThresholds(weights);
}

const palettes = {
  Rainbow: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.0, 0.33, 0.67],
  },
  "Cool Blue": {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.263, 0.416, 0.557],
  },
  "Neon Heat": {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 1.0],
    d: [0.3, 0.2, 0.2],
  },
  Cyberpunk: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [2.0, 1.0, 0.0],
    d: [0.5, 0.2, 0.25],
  },
  Golden: {
    a: [0.5, 0.5, 0.5],
    b: [0.5, 0.5, 0.5],
    c: [1.0, 1.0, 0.5],
    d: [0.8, 0.9, 0.3],
  },
};

export function StackedGradient(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, viewport, camera } = useThree();
  const setRef = useRef<any>(null);

  const uAspect = useMemo(() => uniform(1.0), []);
  const uRowCount = useMemo(() => uniform(8.0), []);
  const uStagger = useMemo(() => uniform(0.25), []);
  const uFadeWidth = useMemo(() => uniform(0.08), []);
  const uTiltTan = useMemo(() => uniform(tiltTan(-5)), []);
  const uWidth = useMemo(() => uniform(0.5), []);
  const uOffsetX = useMemo(() => uniform(0.0), []);
  const uColorMode = useMemo(() => uniform(0.0), []);
  const uSameGradient = useMemo(() => uniform(0.0), []);
  const uHeightMode = useMemo(() => uniform(0.0), []);
  const uFibThresholds = useMemo(() => uniformArray(computeFibThresholds(8), "float"), []);
  const uEqTempThresholds = useMemo(() => uniformArray(computeEqTempThresholds(8), "float"), []);
  const uSineThresholds = useMemo(() => uniformArray(computeSineThresholds(8), "float"), []);
  const uNoiseThresholds = useMemo(() => uniformArray(computeNoiseThresholds(8, 0), "float"), []);
  const noiseParamsRef = useRef({ rowCount: 8, seed: 0 });
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);
  const uColor0 = useMemo(() => uniform(new THREE.Vector3(1.0, 0.2, 0.4)), []);
  const uColor1 = useMemo(() => uniform(new THREE.Vector3(1.0, 0.8, 0.0)), []);
  const uColor2 = useMemo(() => uniform(new THREE.Vector3(0.0, 0.8, 1.0)), []);
  const uColor3 = useMemo(() => uniform(new THREE.Vector3(0.667, 0.0, 1.0)), []);
  const uTextX = useMemo(() => uniform(0.5), []);
  const uTextY = useMemo(() => uniform(0.5), []);
  const uTextColor = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uUseTextColor = useMemo(() => uniform(0.0), []);
  const uOutlineColor = useMemo(() => uniform(new THREE.Vector3(0.0, 0.0, 0.0)), []);
  const uInvertText = useMemo(() => uniform(1.0), []);

  const [textTexture] = useState(
    () => new THREE.CanvasTexture(document.createElement("canvas")),
  );

  const [controls, set] = useControls("Stacked Gradient", () => ({
    rowCount: {
      value: 8,
      min: 2,
      max: 20,
      step: 1,
      label: "Row Count",
      onChange: (v: number) => {
        uRowCount.value = v;
        noiseParamsRef.current.rowCount = v;
        const fib = computeFibThresholds(v);
        fib.forEach((val, i) => { (uFibThresholds.array as Float32Array)[i] = val; });
        uFibThresholds.needsUpdate = true;
        const eq = computeEqTempThresholds(v);
        eq.forEach((val, i) => { (uEqTempThresholds.array as Float32Array)[i] = val; });
        uEqTempThresholds.needsUpdate = true;
        const sine = computeSineThresholds(v);
        sine.forEach((val, i) => { (uSineThresholds.array as Float32Array)[i] = val; });
        uSineThresholds.needsUpdate = true;
        const noise = computeNoiseThresholds(v, noiseParamsRef.current.seed);
        noise.forEach((val, i) => { (uNoiseThresholds.array as Float32Array)[i] = val; });
        uNoiseThresholds.needsUpdate = true;
      },
    },
    heightMode: {
      value: "Golden Ratio",
      options: ["Golden Ratio", "Fibonacci", "Equal Temperament", "Sine", "Noise"],
      label: "Height Mode",
      onChange: (v: string) => {
        uHeightMode.value =
          v === "Fibonacci" ? 1.0
          : v === "Equal Temperament" ? 2.0
          : v === "Sine" ? 3.0
          : v === "Noise" ? 4.0
          : 0.0;
      },
    },
    noiseSeed: {
      value: 0,
      min: 0,
      max: 99,
      step: 1,
      label: "Noise Seed",
      render: (get) => get("Stacked Gradient.heightMode") === "Noise",
      onChange: (v: number) => {
        noiseParamsRef.current.seed = v;
        const noise = computeNoiseThresholds(noiseParamsRef.current.rowCount, v);
        noise.forEach((val, i) => { (uNoiseThresholds.array as Float32Array)[i] = val; });
        uNoiseThresholds.needsUpdate = true;
      },
    },
    stagger: {
      value: 0.25,
      min: 0,
      max: 0.5,
      step: 0.01,
      label: "Stagger",
      onChange: (v: number) => { uStagger.value = v; },
    },
    fadeWidth: {
      value: 0.08,
      min: 0,
      max: 0.3,
      step: 0.005,
      label: "Fade Width",
      onChange: (v: number) => { uFadeWidth.value = v; },
    },
    tilt: {
      value: -5,
      min: -45,
      max: 45,
      step: 1,
      label: "Tilt (°)",
      onChange: (v: number) => { uTiltTan.value = tiltTan(v); },
    },
    stripWidth: {
      value: 0.5,
      min: 0.05,
      max: 1.5,
      step: 0.01,
      label: "Strip Width",
      onChange: (v: number) => { uWidth.value = v; },
    },
    offsetX: {
      value: 0.0,
      min: -0.5,
      max: 0.5,
      step: 0.01,
      label: "Shift X",
      onChange: (v: number) => { uOffsetX.value = v; },
    },
    Palette: folder({
      sameGradient: {
        value: false,
        label: "Same Per Row",
        onChange: (v: boolean) => { uSameGradient.value = v ? 1.0 : 0.0; },
      },
      colorMode: {
        value: "Cosine",
        options: ["Cosine", "4-Stop"],
        label: "Color Mode",
        onChange: (v: string) => { uColorMode.value = v === "4-Stop" ? 1.0 : 0.0; },
      },
      palette: {
        value: "Rainbow",
        options: Object.keys(palettes),
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "Cosine",
        onChange: (v: string) => {
          const p = palettes[v as keyof typeof palettes];
          if (!p) return;
          set({ a: p.a, b: p.b, c: p.c, d: p.d });
          uA.value.set(...(p.a as [number, number, number]));
          uB.value.set(...(p.b as [number, number, number]));
          uC.value.set(...(p.c as [number, number, number]));
          uD.value.set(...(p.d as [number, number, number]));
        },
      },
      a: {
        value: [0.5, 0.5, 0.5],
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uA.value.set(...v),
      },
      b: {
        value: [0.5, 0.5, 0.5],
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uB.value.set(...v),
      },
      c: {
        value: [1.0, 1.0, 1.0],
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uC.value.set(...v),
      },
      d: {
        value: [0.0, 0.33, 0.67],
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uD.value.set(...v),
      },
      Randomize: button(
        () => {
          const r = () => Math.random();
          const newA: [number, number, number] = [r() * 0.4 + 0.3, r() * 0.4 + 0.3, r() * 0.4 + 0.3];
          const newB: [number, number, number] = [r() * 0.4 + 0.3, r() * 0.4 + 0.3, r() * 0.4 + 0.3];
          const newC: [number, number, number] = [r() * 1.5 + 0.5, r() * 1.5 + 0.5, r() * 1.5 + 0.5];
          const newD: [number, number, number] = [r(), r(), r()];
          setRef.current?.({ a: newA, b: newB, c: newC, d: newD });
          uA.value.set(...newA);
          uB.value.set(...newB);
          uC.value.set(...newC);
          uD.value.set(...newD);
        },
        { render: (get) => get("Stacked Gradient.Palette.colorMode") === "Cosine" },
      ),
      color0: {
        value: "#ff3366",
        label: "Color 1",
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor0.value.set(c.r, c.g, c.b);
        },
      },
      color1: {
        value: "#ffcc00",
        label: "Color 2",
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor1.value.set(c.r, c.g, c.b);
        },
      },
      color2: {
        value: "#00ccff",
        label: "Color 3",
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor2.value.set(c.r, c.g, c.b);
        },
      },
      color3: {
        value: "#aa00ff",
        label: "Color 4",
        render: (get) => get("Stacked Gradient.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor3.value.set(c.r, c.g, c.b);
        },
      },
    }),
    "Text Settings": folder({
      text: { value: "", label: "Text", type: LevaInputs.STRING },
      fontFamily: {
        value: "Montserrat",
        options: Object.keys(fontMap),
        label: "Font",
      },
      fontSize: { value: 180, min: 8, max: 750, step: 1, label: "Font Size" },
      textRotation: {
        value: 90,
        min: -180,
        max: 180,
        step: 1,
        label: "Text Rotation",
      },
      textX: { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: "Text X" },
      textY: { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: "Text Y" },
      invertTextColor: {
        value: true,
        label: "Invert Text Color",
        onChange: (v: boolean) => { uInvertText.value = v ? 1.0 : 0.0; },
      },
      useCustomTextColor: {
        value: false,
        label: "Custom Text Color",
        onChange: (v: boolean) => { uUseTextColor.value = v ? 1.0 : 0.0; },
      },
      textColor: {
        value: "#ffffff",
        label: "Text Color",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uTextColor.value.set(c.r, c.g, c.b);
        },
      },
      outlineEnabled: { value: false, label: "Outline" },
      outlineWidth: { value: 8, min: 1, max: 60, step: 1, label: "Outline Width" },
      outlineColor: {
        value: "#000000",
        label: "Outline Color",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uOutlineColor.value.set(c.r, c.g, c.b);
        },
      },
    }),
    Export: folder({
      exportWidth: { value: 4500, min: 100, max: 9000, step: 10, label: "Width" },
      exportHeight: { value: 4500, min: 100, max: 9000, step: 10, label: "Height" },
    }),
  }));
  setRef.current = set;

  const {
    text,
    fontFamily,
    fontSize,
    textRotation,
    textX,
    textY,
    outlineEnabled,
    outlineWidth,
    exportWidth,
    exportHeight,
  } = controls as any;

  useEffect(() => {
    const canvas = textTexture.image as HTMLCanvasElement;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (text) {
      const selectedFont = fontMap[fontFamily as keyof typeof fontMap];
      const cx = textX * CANVAS_SIZE;
      const cy = textY * CANVAS_SIZE;
      const rad = (textRotation * Math.PI) / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);
      ctx.font = `${fontSize}px ${selectedFont.style.fontFamily}, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (outlineEnabled && outlineWidth > 0) {
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth = outlineWidth * 2;
        ctx.lineJoin = "round";
        ctx.strokeText(text, 0, 0);
      }

      ctx.fillStyle = "rgb(255,0,0)";
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }

    uTextX.value = textX;
    uTextY.value = textY;
    textTexture.needsUpdate = true;
  }, [text, fontFamily, fontSize, textRotation, textX, textY, outlineEnabled, outlineWidth, textTexture]);

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
    const mesh = meshRef.current;
    const cam = camera as THREE.PerspectiveCamera;
    if (!mesh || !cam.isPerspectiveCamera) return;

    const { exportWidth: targetWidth, exportHeight: targetHeight } = exportSettingsRef.current;

    const originalSize = new THREE.Vector2();
    gl.getSize(originalSize);
    const originalPixelRatio = gl.getPixelRatio();
    const originalAspect = cam.aspect;
    const originalScale = mesh.scale.clone();
    const originalAspectValue = uAspect.value;
    const originalBackground = scene.background;

    gl.setSize(targetWidth, targetHeight, false);
    gl.setPixelRatio(1);
    cam.aspect = targetWidth / targetHeight;
    cam.updateProjectionMatrix();

    const distance = Math.abs(cam.position.z);
    const fov = (cam.fov * Math.PI) / 180;
    const newVisibleHeight = 2 * Math.tan(fov / 2) * distance;
    const newVisibleWidth = newVisibleHeight * cam.aspect;

    mesh.scale.set(newVisibleWidth / width, newVisibleHeight / height, 1);
    uAspect.value = newVisibleWidth / newVisibleHeight;

    scene.background = null;
    gl.setClearColor(0x000000, 0);
    gl.render(scene, camera);

    const dataUrl = gl.domElement.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = "stacked-gradient.png";
    link.href = dataUrl;
    link.click();

    gl.setSize(originalSize.x, originalSize.y, false);
    gl.setPixelRatio(originalPixelRatio);
    cam.aspect = originalAspect;
    cam.updateProjectionMatrix();
    mesh.scale.copy(originalScale);
    uAspect.value = originalAspectValue;
    scene.background = originalBackground;
    gl.render(scene, camera);
  }, [gl, scene, camera, uAspect, width, height]);

  useControls("Stacked Gradient", { "Export PNG": button(handleExport) }, [handleExport]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();
      const x = uvCoord.x;
      const y = uvCoord.y;

      // --- Golden ratio row layout ---
      const numPairs = uRowCount.div(2.0);
      const pairID = floor(y.mul(numPairs));
      const pairY = fract(y.mul(numPairs));
      const inTall = float(1).sub(step(float(TALL_FRAC), pairY));
      const goldenRowID = pairID.mul(2.0).add(float(1).sub(inTall));

      // --- Fibonacci row layout ---
      let fibRowID: any = float(0);
      for (let i = 0; i < 19; i++) {
        fibRowID = fibRowID.add(step(uFibThresholds.element(i), y));
      }

      // --- Equal temperament row layout ---
      let eqTempRowID: any = float(0);
      for (let i = 0; i < 19; i++) {
        eqTempRowID = eqTempRowID.add(step(uEqTempThresholds.element(i), y));
      }

      // --- Sine row layout ---
      let sineRowID: any = float(0);
      for (let i = 0; i < 19; i++) {
        sineRowID = sineRowID.add(step(uSineThresholds.element(i), y));
      }

      // --- Noise row layout ---
      let noiseRowID: any = float(0);
      for (let i = 0; i < 19; i++) {
        noiseRowID = noiseRowID.add(step(uNoiseThresholds.element(i), y));
      }

      // Select active layout: 0=golden, 1=fibonacci, 2=equal temperament, 3=sine, 4=noise
      const nonGoldenID = mix(
        mix(
          mix(fibRowID, eqTempRowID, step(float(1.5), uHeightMode)),
          sineRowID,
          step(float(2.5), uHeightMode)
        ),
        noiseRowID,
        step(float(3.5), uHeightMode)
      );
      const rowID = mix(goldenRowID, nonGoldenID, step(float(0.5), uHeightMode));

      // --- Per-row stagger via golden ratio distribution ---
      const leftEdge = fract(rowID.mul(float(TALL_FRAC))).mul(uStagger).mul(0.15).add(abs(uTiltTan).mul(0.5));
      const origRightEdge = float(1).sub(
        fract(rowID.mul(float(TALL_FRAC)).add(0.5)).mul(uStagger)
      );
      const rightEdge = leftEdge.add(origRightEdge.sub(leftEdge).mul(uWidth));

      // Tilt + horizontal shift
      const xTilted = x.add(y.sub(0.5).mul(uTiltTan)).sub(uOffsetX);

      // --- Gradient color ---
      // normalizedX in [0,1] within the row's horizontal span
      const normalizedX = xTilted.sub(leftEdge).div(rightEdge.sub(leftEdge)).clamp(0, 1);
      // palT offsets each row into a different palette section (disabled when sameGradient=1)
      const rowOffset = rowID.div(uRowCount).mul(float(1).sub(uSameGradient));
      const palT = normalizedX.add(rowOffset);

      const cosineCol = (cosinePalette as any)(palT, uA, uB, uC, uD);

      // 4-stop piecewise linear gradient
      const t01 = palT.mul(3.0).clamp(0, 1);
      const t12 = palT.sub(float(1.0 / 3.0)).mul(3.0).clamp(0, 1);
      const t23 = palT.sub(float(2.0 / 3.0)).mul(3.0).clamp(0, 1);
      const seg01 = mix(uColor0, uColor1, t01);
      const seg12 = mix(uColor1, uColor2, t12);
      const seg23 = mix(uColor2, uColor3, t23);
      const inSeg1 = step(float(1.0 / 3.0), palT);
      const inSeg2 = step(float(2.0 / 3.0), palT);
      const gradCol = mix(mix(seg01, seg12, inSeg1), seg23, inSeg2);

      const col = mix(cosineCol, gradCol, uColorMode);

      // --- Edge fade to transparent ---
      const fadeLeft = smoothstep(leftEdge, leftEdge.add(uFadeWidth), xTilted);
      const fadeRight = smoothstep(rightEdge, rightEdge.sub(uFadeWidth), xTilted);
      const baseAlpha = fadeLeft.mul(fadeRight);

      // Text overlay — aspect-correct the UV so glyphs aren't squished
      const textAnchor = vec2(uTextX, uTextY);
      const textDelta = uvCoord.sub(textAnchor);
      const textUV = vec2(textDelta.x.mul(uAspect), textDelta.y).add(textAnchor);
      const texSample = texture(textTexture, textUV);
      const fillSample = smoothstep(float(0.05), float(0.6), texSample.r);
      const outlineSample = smoothstep(float(0.05), float(0.6), texSample.g);
      const base = vec4(col, baseAlpha);
      const withOutline = mix(base, vec4(uOutlineColor, float(1)), outlineSample);
      const invertedCol = float(1).sub(col);
      const baseTextColor = mix(col, invertedCol, uInvertText);
      const textFillColor = mix(baseTextColor, uTextColor, uUseTextColor);
      const finalColor = mix(withOutline, vec4(textFillColor, float(1)), fillSample);
      const textAlpha = fillSample.add(outlineSample);
      const finalAlpha = mix(baseAlpha, float(1), textAlpha);

      return vec4(finalColor.xyz, finalAlpha);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [
    uRowCount,
    uStagger,
    uFadeWidth,
    uTiltTan,
    uWidth,
    uOffsetX,
    uColorMode,
    uSameGradient,
    uHeightMode,
    uFibThresholds,
    uEqTempThresholds,
    uSineThresholds,
    uNoiseThresholds,
    uA,
    uB,
    uC,
    uD,
    uColor0,
    uColor1,
    uColor2,
    uColor3,
    uTextX,
    uTextY,
    uTextColor,
    uUseTextColor,
    uOutlineColor,
    uInvertText,
    textTexture,
  ]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
