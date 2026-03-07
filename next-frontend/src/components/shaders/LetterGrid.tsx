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
  fract,
  floor,
  length,
  smoothstep,
  pow,
  mix,
  texture,
  fwidth,
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

const CANVAS_SIZE = 1024;

export function LetterGrid(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, viewport, camera } = useThree();
  const setRef = useRef<any>(null);

  const uCols = useMemo(() => uniform(30.0), []);
  const uRows = useMemo(() => uniform(30.0), []);
  const uAspect = useMemo(() => uniform(1.0), []);
  const uMinRadius = useMemo(() => uniform(0.02), []);
  const uMaxRadius = useMemo(() => uniform(0.96), []);
  const uFalloff = useMemo(() => uniform(1.0), []);
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);

  const [sdfTexture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    return new THREE.CanvasTexture(canvas);
  });

  const [controls, set] = useControls("Letter Grid", () => ({
    "Letter Settings": folder({
      letter: { value: "A", label: "Letter", type: LevaInputs.STRING },
      fontFamily: {
        value: "Montserrat",
        options: Object.keys(fontMap),
        label: "Font",
      },
      fontSize: { value: 700, min: 50, max: 950, step: 1, label: "Font Size" },
      sdfSpread: { value: 80, min: 1, max: 300, step: 1, label: "SDF Spread" },
    }),
    Grid: folder({
      cols: {
        value: 30,
        min: 2,
        max: 100,
        step: 1,
        label: "Columns",
        onChange: (v: number) => { uCols.value = v; },
      },
      rows: {
        value: 30,
        min: 2,
        max: 100,
        step: 1,
        label: "Rows",
        onChange: (v: number) => { uRows.value = v; },
      },
    }),
    Circles: folder({
      minRadius: {
        value: 0.02,
        min: 0,
        max: 0.5,
        step: 0.005,
        label: "Min Radius",
        onChange: (v: number) => { uMinRadius.value = v; },
      },
      maxRadius: {
        value: 0.96,
        min: 0,
        max: 1.0,
        step: 0.005,
        label: "Max Radius",
        onChange: (v: number) => { uMaxRadius.value = v; },
      },
      falloff: {
        value: 1.0,
        min: 0.1,
        max: 5.0,
        step: 0.05,
        label: "Falloff",
        onChange: (v: number) => { uFalloff.value = v; },
      },
    }),
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
      a: {
        value: [0.5, 0.5, 0.5],
        onChange: (v: [number, number, number]) => uA.value.set(...v),
      },
      b: {
        value: [0.5, 0.5, 0.5],
        onChange: (v: [number, number, number]) => uB.value.set(...v),
      },
      c: {
        value: [1.0, 1.0, 1.0],
        onChange: (v: [number, number, number]) => uC.value.set(...v),
      },
      d: {
        value: [0.0, 0.33, 0.67],
        onChange: (v: [number, number, number]) => uD.value.set(...v),
      },
    }),
    Export: folder({
      exportWidth: { value: 4500, min: 100, max: 9000, step: 10, label: "Width" },
      exportHeight: { value: 4500, min: 100, max: 9000, step: 10, label: "Height" },
    }),
  }));
  setRef.current = set;

  const { letter, fontFamily, fontSize, sdfSpread, exportWidth, exportHeight } =
    controls as any;

  useEffect(() => {
    const canvas = sdfTexture.image as HTMLCanvasElement;
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // White background: far-from-letter areas stay white (sdfVal≈1 → large circles)
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (letter) {
      // Draw letter black-on-white to offscreen, then composite with blur.
      // Blur spreads the dark letter outward, creating a gradient:
      //   deep inside letter  → dark (low sdfVal  → small circles)
      //   near letter edge    → gray (mid sdfVal   → medium circles)
      //   far outside letter  → white (high sdfVal → large circles)
      const offscreen = document.createElement("canvas");
      offscreen.width = CANVAS_SIZE;
      offscreen.height = CANVAS_SIZE;
      const octx = offscreen.getContext("2d")!;
      octx.fillStyle = "white";
      octx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const selectedFont = fontMap[fontFamily as keyof typeof fontMap];
      octx.font = `${fontSize}px ${selectedFont.style.fontFamily}, sans-serif`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "black";
      octx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);

      ctx.filter = `blur(${sdfSpread}px)`;
      ctx.drawImage(offscreen, 0, 0);
      ctx.filter = "none";
    }

    sdfTexture.needsUpdate = true;
  }, [letter, fontFamily, fontSize, sdfSpread, sdfTexture]);

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
    link.download = "letter-grid.png";
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

  useControls("Letter Grid", { "Export PNG": button(handleExport) }, [handleExport]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();

      // Grid decomposition
      const gridUV = vec2(uvCoord.x.mul(uCols), uvCoord.y.mul(uRows));
      const cellID = floor(gridUV);
      const cellUV = fract(gridUV).sub(0.5); // [-0.5, 0.5] local coords

      // Sample SDF texture at this cell's center
      const cellCenter = cellID.add(0.5).div(vec2(uCols, uRows));
      const sdfVal = texture(sdfTexture, cellCenter).r;

      // Circle radius driven by SDF value
      const radius = mix(uMinRadius, uMaxRadius, pow(sdfVal, uFalloff));

      // Aspect-correct local UV so circles appear round on screen.
      // Cell physical aspect = (screenW/cols) / (screenH/rows) = uAspect * (uRows/uCols)
      const cellAspect = uAspect.mul(uRows).div(uCols);
      const correctedUV = vec2(cellUV.x.mul(cellAspect), cellUV.y);

      // Circle SDF + anti-aliased mask
      const d = length(correctedUV).sub(radius);
      const aa = fwidth(d).mul(0.5);
      const circleMask = float(1).sub(smoothstep(aa.negate(), aa, d));

      // Cosine palette color driven by SDF value (large circles = different hue than small)
      const col = (cosinePalette as any)(sdfVal, uA, uB, uC, uD);

      return vec4(col, circleMask);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [uCols, uRows, uAspect, uMinRadius, uMaxRadius, uFalloff, uA, uB, uC, uD, sdfTexture]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
