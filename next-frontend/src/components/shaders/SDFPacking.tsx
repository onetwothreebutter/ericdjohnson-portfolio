"use client";

import {
  Montserrat,
  Space_Mono,
  Courier_Prime,
  DM_Sans,
  Unbounded,
  Oswald,
  Syne,
} from "next/font/google";
import { MeshBasicNodeMaterial } from "three/webgpu";
import {
  vec2,
  vec3,
  vec4,
  uv,
  float,
  Fn,
  uniform,
  floor,
  length,
  clamp,
  abs,
  mix,
  smoothstep,
  fwidth,
  step,
  texture,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useControls, folder, LevaInputs } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";

const montserrat  = Montserrat({ weight: "700",          subsets: ["latin"] });
const spaceMono   = Space_Mono({ weight: "700",          subsets: ["latin"] });
const courierPrime= Courier_Prime({ weight: "700",       subsets: ["latin"] });
const dmSans      = DM_Sans({ weight: "700",             subsets: ["latin"] });
const unbounded   = Unbounded({ weight: "700",           subsets: ["latin"] });
const oswald      = Oswald({ weight: "700",              subsets: ["latin"] });
const syne        = Syne({ weight: "800",                subsets: ["latin"] });

const fontMap = {
  Montserrat:    montserrat,
  "Space Mono":  spaceMono,
  "Courier Prime": courierPrime,
  "DM Sans":     dmSans,
  Unbounded:     unbounded,
  Oswald:        oswald,
  Syne:          syne,
};

type PaletteVec = [number, number, number];
type Palette = { a: PaletteVec; b: PaletteVec; c: PaletteVec; d: PaletteVec };
const palettes: Record<string, Palette> = {
  Rainbow:    { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
  "Cool Blue":{ a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
  "Neon Heat":{ a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
  Cyberpunk:  { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
  Golden:     { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

const CANVAS_SIZE = 1024;

export function SDFPacking(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, viewport } = useThree();
  const setRef = useRef<any>(null);

  const uTime       = useMemo(() => uniform(0.0), []);
  const uAspect     = useMemo(() => uniform(1.0), []);
  const uCols       = useMemo(() => uniform(50.0), []);
  const uRows       = useMemo(() => uniform(50.0), []);
  const uThreshold  = useMemo(() => uniform(0.5), []);
  const uSdfScale   = useMemo(() => uniform(2.0), []);
  const uFillFactor    = useMemo(() => uniform(0.9), []);
  const uOutlineWidth  = useMemo(() => uniform(0.15), []);
  const uColorScale = useMemo(() => uniform(2.0), []);
  const uColorSpeed = useMemo(() => uniform(0.0), []);
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);

  // Canvas texture: white bg + blurred black letter = approximate SDF.
  // White (1.0) = far from letter, Black (0.0) = inside letter.
  const [sdfTexture] = useState(() => {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    return new THREE.CanvasTexture(canvas);
  });

  const [controls, set] = useControls("SDF Packing", () => ({
    outline: { value: false, label: "Outline" },
    outlineWidth: {
      value: 0.15, min: 0.01, max: 0.5, step: 0.01, label: "Outline Width",
      onChange: (v: number) => { uOutlineWidth.value = v; },
    },
    Letter: folder({
      letter:     { value: "A", label: "Letter", type: LevaInputs.STRING },
      fontFamily: { value: "Montserrat", options: Object.keys(fontMap), label: "Font" },
      fontSize:   { value: 750, min: 100, max: 950, step: 1, label: "Font Size" },
      sdfSpread:  { value: 80,  min: 1,   max: 300, step: 1, label: "SDF Spread" },
      threshold:  {
        value: 0.5, min: 0.05, max: 0.95, step: 0.01, label: "Threshold",
        onChange: (v: number) => { uThreshold.value = v; },
      },
    }),
    Grid: folder({
      cols: {
        value: 50, min: 5, max: 150, step: 1, label: "Columns",
        onChange: (v: number) => { uCols.value = v; },
      },
      rows: {
        value: 50, min: 5, max: 150, step: 1, label: "Rows",
        onChange: (v: number) => { uRows.value = v; },
      },
      fillFactor: {
        value: 0.9, min: 0.1, max: 1.0, step: 0.01, label: "Fill Factor",
        onChange: (v: number) => { uFillFactor.value = v; },
      },
      sdfScale: {
        value: 2.0, min: 0.1, max: 8.0, step: 0.1, label: "SDF Scale",
        onChange: (v: number) => { uSdfScale.value = v; },
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
      colorScale: {
        value: 2.0, min: 0.1, max: 10.0, step: 0.1, label: "Color Scale",
        onChange: (v: number) => { uColorScale.value = v; },
      },
      colorSpeed: {
        value: 0.0, min: 0.0, max: 1.0, step: 0.01, label: "Color Speed",
        onChange: (v: number) => { uColorSpeed.value = v; },
      },
      a: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uA.value.set(...v) },
      b: { value: [0.5, 0.5, 0.5], onChange: (v: [number, number, number]) => uB.value.set(...v) },
      c: { value: [1.0, 1.0, 1.0], onChange: (v: [number, number, number]) => uC.value.set(...v) },
      d: { value: [0.0, 0.33, 0.67], onChange: (v: [number, number, number]) => uD.value.set(...v) },
    }),
  }));
  setRef.current = set;

  const { letter, fontFamily, fontSize, sdfSpread, outline } = controls as any;

  // Draw the blurred letter to the canvas immediately (no setTimeout — see MEMORY.md).
  useEffect(() => {
    const canvas = sdfTexture.image as HTMLCanvasElement;
    canvas.width  = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    if (letter) {
      const offscreen = document.createElement("canvas");
      offscreen.width  = CANVAS_SIZE;
      offscreen.height = CANVAS_SIZE;
      const octx = offscreen.getContext("2d")!;
      octx.fillStyle = "white";
      octx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const font = fontMap[fontFamily as keyof typeof fontMap];
      octx.font          = `${fontSize}px ${font.style.fontFamily}, sans-serif`;
      octx.textAlign     = "center";
      octx.textBaseline  = "middle";
      octx.fillStyle     = "black";
      octx.fillText(letter, CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.filter = `blur(${sdfSpread}px)`;
      ctx.drawImage(offscreen, 0, 0);
      ctx.filter = "none";
    }

    sdfTexture.needsUpdate = true;
  }, [letter, fontFamily, fontSize, sdfSpread, sdfTexture]);

  useFrame(({ clock }) => {
    uTime.value   = clock.getElapsedTime();
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

      // Grid cell
      const gridUV = vec2(uvCoord.x.mul(uCols), uvCoord.y.mul(uRows));
      const cellID = floor(gridUV);

      // Cell center in UV space [0,1] — used to sample the letter canvas texture
      const cellCenterUV = cellID.add(0.5).div(vec2(uCols, uRows));

      // Sample the blurred-letter canvas.
      // texVal: 1.0 = white (far outside letter), 0.0 = black (inside letter).
      const texVal = texture(sdfTexture, cellCenterUV).r;

      // Treat (texVal - threshold) as a signed SDF proxy:
      //   > 0  outside letter, < 0 inside letter, ≈ 0 on the boundary.
      const sdf = texVal.sub(uThreshold);

      // Circle radius = |SDF| normalised to [0,1] then remapped to [minR, maxR].
      // Boundary cells (sdf≈0) → tiny circles packed tightly.
      // Far cells (|sdf| large) → large circles filling their cell.
      const cellH     = float(2.0).div(uRows);
      const maxR      = cellH.mul(uFillFactor).mul(0.5);
      const minR      = cellH.mul(0.04);
      const normalized = clamp(abs(sdf).mul(uSdfScale), float(0), float(1));
      const r          = mix(minR, maxR, normalized);

      // Distance from the current pixel to its cell center (world space)
      const cellCenterWorld = vec2(
        cellCenterUV.x.sub(0.5).mul(2.0).mul(uAspect),
        cellCenterUV.y.sub(0.5).mul(-2.0),
      );
      const pixWorld = vec2(
        uvCoord.x.sub(0.5).mul(2.0).mul(uAspect),
        uvCoord.y.sub(0.5).mul(-2.0),
      );
      const distToCenter = length(pixWorld.sub(cellCenterWorld));

      // Anti-aliased circle mask
      const circleSdf = distToCenter.sub(r);
      const aa         = fwidth(circleSdf).mul(0.5);
      const mask       = float(1).sub(smoothstep(aa.negate(), aa, circleSdf));

      // Color: palette keyed on signed SDF so inside/outside letter get different hues.
      const t   = sdf.mul(uColorScale).add(uTime.mul(uColorSpeed));
      const col = (cosinePalette as any)(t, uA, uB, uC, uD);

      if (outline) {
        // Hide any cell whose SDF distance exceeds outlineWidth.
        // step(a, b) = 1 when b >= a, so this is 1 when abs(sdf) <= outlineWidth.
        const visible = step(abs(sdf), uOutlineWidth);
        return vec4(col, mask.mul(visible));
      }

      const bg = vec3(0.04);
      return vec4(mix(bg, col, mask), 1.0);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [outline, uTime, uAspect, uCols, uRows, uThreshold, uSdfScale, uFillFactor, uOutlineWidth, uColorScale, uColorSpeed, uA, uB, uC, uD, sdfTexture]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
