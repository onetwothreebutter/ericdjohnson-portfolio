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
  floor,
  length,
  smoothstep,
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
// Max grid resolution. The packing canvas is always MAX_GRID×MAX_GRID;
// only the active [0..cols-1, 0..rows-1] region is used.
const MAX_GRID = 100;
// r is stored as r_uv/R_SCALE so it fits in [0,1] even at fillFactor=2.
// sqrt(2) * fillFactor_max / maxDim * maxDim / 2 = sqrt(2) ≈ 1.41, so R_SCALE=2 covers it.
const R_SCALE = 2.0;

export function LetterGrid(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, viewport, camera } = useThree();
  const setRef = useRef<any>(null);

  const uCols = useMemo(() => uniform(30.0), []);
  const uRows = useMemo(() => uniform(30.0), []);
  const uAspect = useMemo(() => uniform(1.0), []);
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);

  // SDF canvas: white bg + blurred black letter.
  // White (1.0) = far from letter = large circle. Black (0.0) = inside/near letter.
  const [sdfTexture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    return new THREE.CanvasTexture(canvas);
  });

  // Packing canvas: MAX_GRID×MAX_GRID, one texel per grid cell.
  // RGBA8 encoding: R=cx, G=cy, B=r/R_SCALE, A=active (all in [0,1]).
  // flipY=false so canvas row r matches shader texUV.y ≈ r/MAX_GRID.
  const [packingTexture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = MAX_GRID;
    canvas.height = MAX_GRID;
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.flipY = false;
    return tex;
  });

  const [controls, set] = useControls("Letter Grid", () => ({
    "Letter Settings": folder({
      letter: { value: "A", label: "Letter", type: LevaInputs.STRING },
      fontFamily: { value: "Montserrat", options: Object.keys(fontMap), label: "Font" },
      fontSize: { value: 700, min: 50, max: 950, step: 1, label: "Font Size" },
      sdfSpread: { value: 80, min: 1, max: 300, step: 1, label: "SDF Spread" },
      threshold: { value: 0.5, min: 0.05, max: 0.95, step: 0.01, label: "Threshold" },
    }),
    Grid: folder({
      cols: { value: 30, min: 2, max: MAX_GRID, step: 1, label: "Columns" },
      rows: { value: 30, min: 2, max: MAX_GRID, step: 1, label: "Rows" },
    }),
    Circles: folder({
      // fillFactor=1 → circle tangent to where the letter was first detected.
      // >1 overlaps into the letter, <1 leaves a gap.
      fillFactor: { value: 1.0, min: 0.1, max: 2.0, step: 0.05, label: "Fill Factor" },
      minRunLength: { value: 1, min: 1, max: 20, step: 1, label: "Min Run Length" },
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
      a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uA.value.set(...v) },
      b: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uB.value.set(...v) },
      c: { value: [1.0, 1.0, 1.0], onChange: (v: [number, number, number]) => uC.value.set(...v) },
      d: { value: [0.0, 0.33, 0.67], onChange: (v: [number, number, number]) => uD.value.set(...v) },
    }),
    Export: folder({
      exportWidth: { value: 4500, min: 100, max: 9000, step: 10, label: "Width" },
      exportHeight: { value: 4500, min: 100, max: 9000, step: 10, label: "Height" },
    }),
  }));
  setRef.current = set;

  const {
    letter,
    fontFamily,
    fontSize,
    sdfSpread,
    threshold,
    cols,
    rows,
    fillFactor,
    minRunLength,
    exportWidth,
    exportHeight,
  } = controls as any;

  useEffect(() => {
    uCols.value = cols;
    uRows.value = rows;

    // --- Step 1: Draw blurred letter to SDF canvas ---
    const sdfCanvas = sdfTexture.image as HTMLCanvasElement;
    sdfCanvas.width = CANVAS_SIZE;
    sdfCanvas.height = CANVAS_SIZE;
    const ctx = sdfCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (letter) {
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

    // --- Step 2: Read SDF pixels ---
    const imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    function getSdf(col: number, row: number): number {
      const x = Math.min(Math.floor((col + 0.5) / cols * CANVAS_SIZE), CANVAS_SIZE - 1);
      const y = Math.min(Math.floor((row + 0.5) / rows * CANVAS_SIZE), CANVAS_SIZE - 1);
      return imageData.data[(y * CANVAS_SIZE + x) * 4] / 255;
    }

    // --- Step 3: Diagonal-scan packing ---
    // For each diagonal k = col-row, walk from the grid edge (direction +col,+row).
    // Consecutive cells with sdfVal >= threshold = one super cell.
    // One circle per super cell: center at midpoint, radius tangent to the letter boundary.
    //
    // Encoding into RGBA8 (all channels normalised to [0,1]):
    //   R = cx          (circle center x in UV)
    //   G = cy          (circle center y in UV)
    //   B = r / R_SCALE (radius, divided so it fits in [0,1])
    //   A = 1           (active cell)
    const packCanvas = packingTexture.image as HTMLCanvasElement;
    const packCtx = packCanvas.getContext("2d")!;
    const imgData = packCtx.createImageData(MAX_GRID, MAX_GRID); // initialised to all-zero

    const maxDim = Math.max(cols, rows);

    for (let k = -(rows - 1); k <= cols - 1; k++) {
      const startCol = Math.max(0, k);
      const startRow = Math.max(0, -k);

      let runLen = 0;
      let c = startCol;
      let r = startRow;
      while (c < cols && r < rows) {
        if (getSdf(c, r) < threshold) break;
        runLen++;
        c++;
        r++;
      }

      if (runLen < minRunLength) continue;

      const cx = (startCol + runLen * 0.5) / cols;
      const cy = (startRow + runLen * 0.5) / rows;
      // Radius so the circle is tangent to the letter boundary:
      // diagonal half-length in UV = sqrt(2)/2 * runLen/maxDim
      const r_uv = (Math.SQRT2 / 2) * (runLen / maxDim) * fillFactor;

      for (let i = 0; i < runLen; i++) {
        const col = startCol + i;
        const row = startRow + i;
        const idx = (row * MAX_GRID + col) * 4;
        imgData.data[idx + 0] = Math.round(cx * 255);
        imgData.data[idx + 1] = Math.round(cy * 255);
        imgData.data[idx + 2] = Math.round((r_uv / R_SCALE) * 255);
        imgData.data[idx + 3] = 255; // active
      }
    }

    packCtx.putImageData(imgData, 0, 0);
    packingTexture.needsUpdate = true;
  }, [letter, fontFamily, fontSize, sdfSpread, threshold, cols, rows, fillFactor, minRunLength, sdfTexture, packingTexture]);

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

      // Determine which grid cell this pixel belongs to.
      const gridUV = vec2(uvCoord.x.mul(uCols), uvCoord.y.mul(uRows));
      const cellID = floor(gridUV);

      // Look up the packing canvas at this cell's texel.
      // packingTexture is MAX_GRID×MAX_GRID with flipY=false, so texUV.y=0 → canvas row 0.
      const texUV = cellID.add(0.5).div(float(MAX_GRID));
      const pack = texture(packingTexture, texUV);

      // Decode RGBA8: cx, cy in [0,1]; r = B * R_SCALE; active = A (1 or 0)
      const cx = pack.r;
      const cy = pack.g;
      const r = pack.b.mul(float(R_SCALE));
      const active = pack.a;

      // Aspect-corrected distance from this pixel to the circle center
      const dx = uvCoord.x.sub(cx).mul(uAspect);
      const dy = uvCoord.y.sub(cy);
      const d = length(vec2(dx, dy)).sub(r);
      const aa = fwidth(d).mul(0.5);
      const circleMask = float(1).sub(smoothstep(aa.negate(), aa, d)).mul(active);

      // Color from cosine palette keyed on SDF value at circle center
      const sdfVal = texture(sdfTexture, vec2(cx, cy)).r;
      const col = (cosinePalette as any)(sdfVal, uA, uB, uC, uD);
      return vec4(col, circleMask);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [uCols, uRows, uAspect, uA, uB, uC, uD, sdfTexture, packingTexture]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
