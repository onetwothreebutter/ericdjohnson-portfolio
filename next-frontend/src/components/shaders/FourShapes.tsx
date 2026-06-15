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
  floor,
  mix,
  step,
  smoothstep,
  fwidth,
  texture,
  cos,
  sin,
  tan,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useControls, LevaInputs, button, folder } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";
import { sdSphere, sdIsosceles } from "./tsl/utils/sdf/shapes";

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

const CANVAS_SIZE = 512;

type PaletteVec = [number, number, number];
type Palette = { a: PaletteVec; b: PaletteVec; c: PaletteVec; d: PaletteVec };
const palettes: Record<string, Palette> = {
  Rainbow: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
  "Cool Blue": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
  "Neon Heat": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
  Cyberpunk: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
  Golden: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

function drawLetter(
  tex: THREE.CanvasTexture,
  letter: string,
  font: string,
  size: number,
  outlineEnabled: boolean,
  outlineWidth: number,
) {
  const canvas = tex.image as HTMLCanvasElement;
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (letter) {
    ctx.font = `bold ${size}px ${font}, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const metrics = ctx.measureText(letter);
    const y = CANVAS_SIZE / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    if (outlineEnabled && outlineWidth > 0) {
      ctx.strokeStyle = "rgb(0,255,0)";
      ctx.lineWidth = outlineWidth * 2;
      ctx.lineJoin = "round";
      ctx.strokeText(letter, CANVAS_SIZE / 2, y);
    }
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillText(letter, CANVAS_SIZE / 2, y);
  }
  tex.needsUpdate = true;
}

export function FourShapes(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, viewport, camera } = useThree();
  const setRef = useRef<any>(null);
  const syncRotRef = useRef(false);

  const uAspect       = useMemo(() => uniform(1.0), []);
  const uCircleSize   = useMemo(() => uniform(0.42), []);
  const uTriSize      = useMemo(() => uniform(0.22), []);
  const uGlobalGrad      = useMemo(() => uniform(0.0), []);
  const uTextEnabled     = useMemo(() => uniform(1.0), []);
  const uAA              = useMemo(() => uniform(1.0), []);
  const uOffsetX         = useMemo(() => uniform(0.0), []);
  const uOffsetY         = useMemo(() => uniform(0.0), []);
  const uTriAngle        = useMemo(() => uniform(0.0), []);
  const uTriApex         = useMemo(() => uniform(Math.PI / 3), []); // 60° default (equilateral)
  const uRot1            = useMemo(() => uniform(0.0), []); // top-left
  const uRot2            = useMemo(() => uniform(0.0), []); // top-right
  const uRot3            = useMemo(() => uniform(0.0), []); // bottom-left
  const uRot4            = useMemo(() => uniform(0.0), []); // bottom-right
  const uOutlineColor = useMemo(() => uniform(new THREE.Vector3(0.0, 0.0, 0.0)), []);
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);
  const uColorMode = useMemo(() => uniform(0.0), []);
  const uColor0 = useMemo(() => uniform(new THREE.Vector3(1.0, 0.2, 0.4)), []);
  const uColor1 = useMemo(() => uniform(new THREE.Vector3(1.0, 0.8, 0.0)), []);
  const uColor2 = useMemo(() => uniform(new THREE.Vector3(0.0, 0.8, 1.0)), []);
  const uColor3 = useMemo(() => uniform(new THREE.Vector3(0.667, 0.0, 1.0)), []);

  const [tex1] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex2] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex3] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex4] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));

  const [controls, set] = useControls("Four Shapes", () => ({
    circleSize: {
      value: 0.42,
      min: 0.05,
      max: 0.49,
      step: 0.01,
      label: "Circle Size",
      onChange: (v: number) => { uCircleSize.value = v; },
    },
    triSize: {
      value: 0.22,
      min: 0.01,
      max: 1,
      step: 0.01,
      label: "Triangle Size",
      onChange: (v: number) => { uTriSize.value = v; },
    },
    triAngle: {
      value: 0,
      min: -180,
      max: 180,
      step: 1,
      label: "Triangle Angle",
      onChange: (v: number) => { uTriAngle.value = v * (Math.PI / 180); },
    },
    triApex: {
      value: 60,
      min: 5,
      max: 175,
      step: 1,
      label: "Triangle Width",
      onChange: (v: number) => { uTriApex.value = v * (Math.PI / 180); },
    },
    offsetX: {
      value: 0.0,
      min: -1.0,
      max: 0.4,
      step: 0.01,
      label: "X Spacing",
      onChange: (v: number) => { uOffsetX.value = v; },
    },
    offsetY: {
      value: 0.0,
      min: -1.0,
      max: 0.4,
      step: 0.01,
      label: "Y Spacing",
      onChange: (v: number) => { uOffsetY.value = v; },
    },
    textEnabled: {
      value: true,
      label: "Text",
      onChange: (v: boolean) => { uTextEnabled.value = v ? 1.0 : 0.0; },
    },
    Rotation: folder({
      syncRotation: {
        value: false,
        label: "Sync",
        onChange: (v: boolean) => { syncRotRef.current = v; },
      },
      rot1: { value: 0, min: -180, max: 180, step: 1, label: "Top Left",     onChange: (v: number) => { const r = v * (Math.PI / 180); uRot1.value = r; if (syncRotRef.current) { uRot2.value = uRot3.value = uRot4.value = r; setRef.current?.({ rot2: v, rot3: v, rot4: v }); } } },
      rot2: { value: 0, min: -180, max: 180, step: 1, label: "Top Right",    onChange: (v: number) => { const r = v * (Math.PI / 180); uRot2.value = r; if (syncRotRef.current) { uRot1.value = uRot3.value = uRot4.value = r; setRef.current?.({ rot1: v, rot3: v, rot4: v }); } } },
      rot3: { value: 0, min: -180, max: 180, step: 1, label: "Bottom Left",  onChange: (v: number) => { const r = v * (Math.PI / 180); uRot3.value = r; if (syncRotRef.current) { uRot1.value = uRot2.value = uRot4.value = r; setRef.current?.({ rot1: v, rot2: v, rot4: v }); } } },
      rot4: { value: 0, min: -180, max: 180, step: 1, label: "Bottom Right", onChange: (v: number) => { const r = v * (Math.PI / 180); uRot4.value = r; if (syncRotRef.current) { uRot1.value = uRot2.value = uRot3.value = r; setRef.current?.({ rot1: v, rot2: v, rot3: v }); } } },
    }),
    Palette: folder({
      colorMode: {
        value: "Cosine",
        options: ["Cosine", "4-Stop"],
        label: "Color Mode",
        onChange: (v: string) => { uColorMode.value = v === "4-Stop" ? 1.0 : 0.0; },
      },
      globalGradient: {
        value: false,
        label: "Global Gradient",
        onChange: (v: boolean) => { uGlobalGrad.value = v ? 1.0 : 0.0; },
      },
      palette: {
        value: "Rainbow",
        options: Object.keys(palettes),
        render: (get) => get("Four Shapes.Palette.colorMode") === "Cosine",
        onChange: (v: string) => {
          const p = palettes[v as keyof typeof palettes];
          if (!p) return;
          set({ a: p.a, b: p.b, c: p.c, d: p.d } as any);
          uA.value.set(...(p.a as [number, number, number]));
          uB.value.set(...(p.b as [number, number, number]));
          uC.value.set(...(p.c as [number, number, number]));
          uD.value.set(...(p.d as [number, number, number]));
        },
      },
      a: { value: [0.5, 0.5, 0.5], render: (get) => get("Four Shapes.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uA.value.set(...v) },
      b: { value: [0.5, 0.5, 0.5], render: (get) => get("Four Shapes.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uB.value.set(...v) },
      c: { value: [1.0, 1.0, 1.0], render: (get) => get("Four Shapes.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uC.value.set(...v) },
      d: { value: [0.0, 0.33, 0.67], render: (get) => get("Four Shapes.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uD.value.set(...v) },
      Randomize: button(
        () => {
          const r = () => Math.random();
          const newA: [number, number, number] = [r() * 0.4 + 0.3, r() * 0.4 + 0.3, r() * 0.4 + 0.3];
          const newB: [number, number, number] = [r() * 0.4 + 0.3, r() * 0.4 + 0.3, r() * 0.4 + 0.3];
          const newC: [number, number, number] = [r() * 1.5 + 0.5, r() * 1.5 + 0.5, r() * 1.5 + 0.5];
          const newD: [number, number, number] = [r(), r(), r()];
          setRef.current?.({ a: newA, b: newB, c: newC, d: newD });
          uA.value.set(...newA); uB.value.set(...newB);
          uC.value.set(...newC); uD.value.set(...newD);
        },
        { render: (get: (key: string) => any) => get("Four Shapes.Palette.colorMode") === "Cosine" } as any,
      ),
      color0: { value: "#ff3366", label: "Color 1", render: (get) => get("Four Shapes.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor0.value.set(c.r, c.g, c.b); } },
      color1: { value: "#ffcc00", label: "Color 2", render: (get) => get("Four Shapes.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor1.value.set(c.r, c.g, c.b); } },
      color2: { value: "#00ccff", label: "Color 3", render: (get) => get("Four Shapes.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor2.value.set(c.r, c.g, c.b); } },
      color3: { value: "#aa00ff", label: "Color 4", render: (get) => get("Four Shapes.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor3.value.set(c.r, c.g, c.b); } },
    }),
    Letters: folder({
      letter1: { value: "A", label: "Top Left",     type: LevaInputs.STRING },
      letter2: { value: "B", label: "Top Right",    type: LevaInputs.STRING },
      letter3: { value: "C", label: "Bottom Left",  type: LevaInputs.STRING },
      letter4: { value: "D", label: "Bottom Right", type: LevaInputs.STRING },
      fontFamily: { value: "Montserrat", label: "Font", options: Object.keys(fontMap) },
      fontSize: { value: 300, min: 50, max: 500, step: 10, label: "Font Size" },
      outlineEnabled: { value: false, label: "Outline" },
      outlineWidth: { value: 12, min: 1, max: 60, step: 1, label: "Outline Width" },
      outlineColor: {
        value: "#000000",
        label: "Outline Color",
        onChange: (v: string) => { const c = new THREE.Color(v); uOutlineColor.value.set(c.r, c.g, c.b); },
      },
    }),
    Export: folder({
      exportWidth:  { value: 4500, min: 100, max: 9000, step: 10, label: "Width" },
      exportHeight: { value: 4500, min: 100, max: 9000, step: 10, label: "Height" },
    }),
  }));
  setRef.current = set;

  const { letter1, letter2, letter3, letter4, fontFamily, fontSize, outlineEnabled, outlineWidth, exportWidth, exportHeight } = controls as any;

  const fontFamilyString = fontMap[fontFamily as keyof typeof fontMap]?.style.fontFamily ?? fontFamily;
  useEffect(() => { drawLetter(tex1, letter1, fontFamilyString, fontSize, outlineEnabled, outlineWidth); }, [tex1, letter1, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);
  useEffect(() => { drawLetter(tex2, letter2, fontFamilyString, fontSize, outlineEnabled, outlineWidth); }, [tex2, letter2, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);
  useEffect(() => { drawLetter(tex3, letter3, fontFamilyString, fontSize, outlineEnabled, outlineWidth); }, [tex3, letter3, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);
  useEffect(() => { drawLetter(tex4, letter4, fontFamilyString, fontSize, outlineEnabled, outlineWidth); }, [tex4, letter4, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);

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
    link.download = "four-shapes.png";
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

  useControls("Four Shapes", { "Export PNG": button(handleExport) }, [handleExport]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();

      // Quadrant indices: cellX=0 left, 1 right; cellY=0 bottom, 1 top
      const cellX = floor(uvCoord.x.mul(2));
      const cellY = floor(uvCoord.y.mul(2));

      // Local UV within the quadrant [0, 1]
      const localUV = fract(uvCoord.mul(2));

      // Aspect-corrected local point centered at (0, 0)
      const localP = vec2(
        localUV.x.sub(0.5).mul(uAspect),
        localUV.y.sub(0.5),
      );

      const isRight = step(float(0.5), cellX);
      const isTop   = step(float(0.5), cellY);

      // Shift each quadrant's shapes toward/away from the image center
      const xDir = mix(uOffsetX, uOffsetX.negate(), isRight);
      const yDir = mix(uOffsetY, uOffsetY.negate(), isTop);
      const shiftedP = vec2(localP.x.add(xDir), localP.y.add(yDir));

      // Per-quadrant rotation
      const activeRot = mix(
        mix(uRot3, uRot4, isRight),
        mix(uRot1, uRot2, isRight),
        isTop,
      );
      const rc = cos(activeRot);
      const rs = sin(activeRot);
      const rotatedP = vec2(
        shiftedP.x.mul(rc).sub(shiftedP.y.mul(rs)),
        shiftedP.x.mul(rs).add(shiftedP.y.mul(rc)),
      );

      // --- Circle SDF (same for all quadrants) ---
      const circleSdf = sdSphere(rotatedP, uCircleSize);
      const aaCircle = fwidth(circleSdf).mul(uAA);
      const circleMask = float(1).sub(smoothstep(aaCircle.negate(), aaCircle, circleSdf));

      // --- Equilateral triangle SDFs, rotated per quadrant (pinwheel) ---
      // Rotating input p by θ rotates the shape by -θ.
      // Top-left  (0,1): pointing RIGHT  → rotate p by +90° CCW: p' = (-y, x)
      // Top-right (1,1): pointing DOWN   → rotate p by 180°:      p' = (-x, -y)
      // Bot-left  (0,0): pointing UP     → no rotation:            p' = (x, y)
      // Bot-right (1,0): pointing LEFT   → rotate p by -90° CCW:  p' = (y, -x)
      // Extra rotation applied only to the triangle
      const trc = cos(uTriAngle);
      const trs = sin(uTriAngle);
      const triP = vec2(
        rotatedP.x.mul(trc).sub(rotatedP.y.mul(trs)),
        rotatedP.x.mul(trs).add(rotatedP.y.mul(trc)),
      );

      const pForRight = vec2(triP.y.negate(), triP.x);
      const pForDown  = vec2(triP.x.negate(), triP.y.negate());
      const pForUp    = triP;
      const pForLeft  = vec2(triP.y, triP.x.negate());

      // Isosceles triangle: apex at origin, base at y = uTriSize, half-width from apex angle
      const triHalfWidth = uTriSize.mul(tan(uTriApex.mul(0.5)));
      const triQ = vec2(triHalfWidth, uTriSize);

      const triRight = sdIsosceles(pForRight, triQ);
      const triDown  = sdIsosceles(pForDown,  triQ);
      const triUp    = sdIsosceles(pForUp,    triQ);
      const triLeft  = sdIsosceles(pForLeft,  triQ);

      // Select triangle SDF by quadrant
      const activeTriTop = mix(triRight, triDown, isRight); // top-left=right, top-right=down
      const activeTriBot = mix(triUp,   triLeft, isRight);  // bot-left=up,   bot-right=left
      const activeTri    = mix(activeTriBot, activeTriTop, isTop);

      // Invert: 1 where triangle IS (the cutout area)
      const aaTri = fwidth(activeTri).mul(uAA);
      const triCutout = float(1).sub(smoothstep(aaTri.negate(), aaTri, activeTri));

      // Final shape = circle minus triangle hole
      const shapeMask = circleMask.mul(float(1).sub(triCutout));

      // --- Letter + color layer ---
      const letterLayer = (letterTex: THREE.CanvasTexture) => {
        const texSample     = texture(letterTex, localUV);
        const fillSample    = smoothstep(float(0.3), float(0.7), texSample.r).mul(uTextEnabled);
        const outlineSample = smoothstep(float(0.3), float(0.7), texSample.g).mul(uTextEnabled);

        // palT: per-cell local x, or global x when globalGradient is on
        const palT      = mix(localUV.x, uvCoord.x, uGlobalGrad);
        const cosineCol = (cosinePalette as any)(palT, uA, uB, uC, uD);

        // 4-stop piecewise linear gradient
        const t01     = palT.mul(3.0).clamp(0, 1);
        const t12     = palT.sub(float(1.0 / 3.0)).mul(3.0).clamp(0, 1);
        const t23     = palT.sub(float(2.0 / 3.0)).mul(3.0).clamp(0, 1);
        const seg01   = mix(uColor0, uColor1, t01);
        const seg12   = mix(uColor1, uColor2, t12);
        const seg23   = mix(uColor2, uColor3, t23);
        const inSeg1  = step(float(1.0 / 3.0), palT);
        const inSeg2  = step(float(2.0 / 3.0), palT);
        const gradCol = mix(mix(seg01, seg12, inSeg1), seg23, inSeg2);

        const col        = mix(cosineCol, gradCol, uColorMode);
        const layerColor = mix(col, uOutlineColor, outlineSample);
        const layerAlpha = float(1).add(outlineSample).min(float(1));

        return { col: layerColor, alpha: layerAlpha };
      };

      const layer1 = letterLayer(tex1); // top-left
      const layer2 = letterLayer(tex2); // top-right
      const layer3 = letterLayer(tex3); // bottom-left
      const layer4 = letterLayer(tex4); // bottom-right

      // Select active layer by quadrant
      const activeColor = mix(
        mix(layer3.col, layer4.col, isRight),
        mix(layer1.col, layer2.col, isRight),
        isTop,
      );
      const activeAlpha = mix(
        mix(layer3.alpha, layer4.alpha, isRight),
        mix(layer1.alpha, layer2.alpha, isRight),
        isTop,
      );

      return vec4(activeColor, activeAlpha.mul(shapeMask));
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [
    uAspect, uCircleSize, uTriSize, uTriAngle, uTriApex, uGlobalGrad, uTextEnabled, uAA, uOffsetX, uOffsetY, uRot1, uRot2, uRot3, uRot4,
    uOutlineColor, uA, uB, uC, uD, uColorMode, uColor0, uColor1, uColor2, uColor3,
    tex1, tex2, tex3, tex4,
  ]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
