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
  vec3,
  vec4,
  uv,
  float,
  floor,
  Fn,
  uniform,
  mix,
  step,
  smoothstep,
  texture,
  cos,
  sin,
  max,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { useControls, button, folder, LevaInputs } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";

const spaceMono = Space_Mono({ weight: "700", subsets: ["latin"] });
const ibmPlexMono = IBM_Plex_Mono({ weight: "700", subsets: ["latin"] });
const courierPrime = Courier_Prime({ weight: "700", subsets: ["latin"] });
const shareTechMono = Share_Tech_Mono({ weight: "400", subsets: ["latin"] });
const cutiveMono = Cutive_Mono({ weight: "400", subsets: ["latin"] });
const dmMono = DM_Mono({ weight: "500", subsets: ["latin"] });
const fragmentMono = Fragment_Mono({ weight: "400", subsets: ["latin"] });
const robotoMono = Roboto_Mono({ weight: "700", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ weight: "900", subsets: ["latin"] });
const jetBrainsMono = JetBrains_Mono({ weight: "800", subsets: ["latin"] });
const firaCode = Fira_Code({ weight: "700", subsets: ["latin"] });
const inconsolata = Inconsolata({ weight: "900", subsets: ["latin"] });
const azeretMono = Azeret_Mono({ weight: "900", subsets: ["latin"] });
const splineSansMono = Spline_Sans_Mono({ weight: "700", subsets: ["latin"] });
const geistMono = Geist_Mono({ weight: "900", subsets: ["latin"] });
const syne = Syne({ weight: "800", subsets: ["latin"] });
const unbounded = Unbounded({ weight: "900", subsets: ["latin"] });
const bricolageGrotesque = Bricolage_Grotesque({ weight: "800", subsets: ["latin"] });
const epilogue = Epilogue({ weight: "900", subsets: ["latin"] });
const dmSans = DM_Sans({ weight: "900", subsets: ["latin"] });
const oswald = Oswald({ weight: "700", subsets: ["latin"] });
const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

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
  Rainbow:      { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0,  0.33, 0.67] },
  "Cool Blue":  { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
  "Neon Heat":  { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3,  0.2,  0.2  ] },
  Cyberpunk:    { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5,  0.2,  0.25 ] },
  Golden:       { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8,  0.9,  0.3  ] },
};

const CANVAS_SIZE = 2048;

export function EchoText(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera, viewport } = useThree();

  const uAspect       = useMemo(() => uniform(1.0), []);
  const uTextX        = useMemo(() => uniform(0.5), []);
  const uTextY        = useMemo(() => uniform(0.5), []);
  const uBgColor      = useMemo(() => uniform(new THREE.Vector3(0.0, 0.0, 0.0)), []);
  const uTextColor    = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uOutlineColor = useMemo(() => uniform(new THREE.Vector3(0.0, 0.0, 0.0)), []);
  const uColorMode    = useMemo(() => uniform(0.0), []);
  const uA            = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB            = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC            = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD            = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);
  const uColor0       = useMemo(() => uniform(new THREE.Vector3(1.0, 0.2, 0.4)), []);
  const uColor1       = useMemo(() => uniform(new THREE.Vector3(1.0, 0.8, 0.0)), []);
  const uColor2       = useMemo(() => uniform(new THREE.Vector3(0.0, 0.8, 1.0)), []);
  const uColor3       = useMemo(() => uniform(new THREE.Vector3(0.667, 0.0, 1.0)), []);
  const uSnapStrips   = useMemo(() => uniform(0.0), []);
  const uStripUVH     = useMemo(() => uniform(0.05), []);
  const uPalMin       = useMemo(() => uniform(0.0), []);
  const uPalMax       = useMemo(() => uniform(1.0), []);
  const uDragAngle    = useMemo(() => uniform(Math.PI), []);
  const uBlurAngle    = useMemo(() => uniform(Math.PI), []);
  const uBlurLength   = useMemo(() => uniform(0.08), []);
  const uBlurFalloff  = useMemo(() => uniform(0.6), []);
  const uBlurEnabled  = useMemo(() => uniform(1.0), []);

  const setRef = useRef<Function | null>(null);

  const [textTexture] = useState(
    () => new THREE.CanvasTexture(document.createElement("canvas")),
  );

  const [controls, set] = useControls("Plain Text", () => ({
    Palette: folder({
      colorMode: {
        value: "Flat",
        options: ["Flat", "Cosine", "4-Stop"],
        label: "Color Mode",
        onChange: (v: string) => {
          uColorMode.value = v === "4-Stop" ? 1.0 : v === "Cosine" ? 2.0 : 0.0;
        },
      },
      palette: {
        value: "Rainbow",
        options: Object.keys(palettes),
        render: (get) => get("Plain Text.Palette.colorMode") === "Cosine",
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
      a: { value: [0.5, 0.5, 0.5], render: (get) => get("Plain Text.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uA.value.set(...v) },
      b: { value: [0.5, 0.5, 0.5], render: (get) => get("Plain Text.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uB.value.set(...v) },
      c: { value: [1.0, 1.0, 1.0], render: (get) => get("Plain Text.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uC.value.set(...v) },
      d: { value: [0.0, 0.33, 0.67], render: (get) => get("Plain Text.Palette.colorMode") === "Cosine", onChange: (v: [number, number, number]) => uD.value.set(...v) },
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
        { render: (get) => get("Plain Text.Palette.colorMode") === "Cosine" } as any,
      ),
      color0: { value: "#ff3366", label: "Color 1", render: (get) => get("Plain Text.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor0.value.set(c.r, c.g, c.b); } },
      color1: { value: "#ffcc00", label: "Color 2", render: (get) => get("Plain Text.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor1.value.set(c.r, c.g, c.b); } },
      color2: { value: "#00ccff", label: "Color 3", render: (get) => get("Plain Text.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor2.value.set(c.r, c.g, c.b); } },
      color3: { value: "#aa00ff", label: "Color 4", render: (get) => get("Plain Text.Palette.colorMode") === "4-Stop", onChange: (v: string) => { const c = new THREE.Color(v); uColor3.value.set(c.r, c.g, c.b); } },
      snapStrips: {
        value: false,
        label: "Flat Per Strip",
        render: (get) => get("Plain Text.Palette.colorMode") !== "Flat",
        onChange: (v: boolean) => { uSnapStrips.value = v ? 1.0 : 0.0; },
      },
    }),
    "Text Settings": folder({
      text: { value: "Hello", label: "Text", type: LevaInputs.STRING },
      fontFamily: {
        value: "Montserrat",
        options: Object.keys(fontMap),
        label: "Font",
      },
      fontSize:     { value: 300, min: 8, max: 750, step: 1, label: "Font Size" },
      textRotation: { value: 0, min: -180, max: 180, step: 1, label: "Rotation" },
      textX:        { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: "Text X" },
      textY:        { value: 0.5, min: 0.0, max: 1.0, step: 0.01, label: "Text Y" },
      textColor: {
        value: "#ffffff",
        label: "Text Color",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uTextColor.value.set(c.r, c.g, c.b);
        },
      },
      outlineEnabled: { value: false, label: "Outline" },
      outlineWidth:   { value: 8, min: 1, max: 60, step: 1, label: "Outline Width" },
      outlineColor: {
        value: "#000000",
        label: "Outline Color",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uOutlineColor.value.set(c.r, c.g, c.b);
        },
      },
      Strips: folder({
        repeatStrip:   { value: true, label: "Enable Strips" },
        stripFraction: { value: 0.2, min: 0.05, max: 0.5, step: 0.01, label: "Strip Size", render: (get) => get("Plain Text.Text Settings.Strips.repeatStrip") },
        repeatCount:   { value: 10, min: 1, max: 30, step: 1, label: "Repeat Count", render: (get) => get("Plain Text.Text Settings.Strips.repeatStrip") },
        stripGap:      { value: 0, min: 0, max: 500, step: 1, label: "Strip Gap (px)", render: (get) => get("Plain Text.Text Settings.Strips.repeatStrip") },
      }),
      Solids: folder({
        solidEnabled: { value: true, label: "Enable Solids" },
        solidCount:   { value: 30, min: 1, max: 500, step: 1, label: "Solid Count", render: (get) => get("Plain Text.Text Settings.Solids.solidEnabled") },
        solidSample:  { value: 0.2, min: 0.0, max: 1.0, step: 0.01, label: "Solid Sample %", render: (get) => get("Plain Text.Text Settings.Solids.solidEnabled") },
        sectionGap:   { value: 0, min: -200, max: 500, step: 1, label: "Section Gap (px)", render: (get) => get("Plain Text.Text Settings.Solids.solidEnabled") },
      }),
    }),
    Echoes: folder({
      "Primary Echo": folder({
        dragEnabled:  { value: true, label: "Enable Stamps" },
        dragAngle:    { value: 180, min: 0, max: 360, step: 1, label: "Angle (°)", render: (get) => get("Plain Text.Echoes.Primary Echo.dragEnabled") },
        dragDistance: { value: 120, min: 0, max: 800, step: 1, label: "Stamp Distance (px)", render: (get) => get("Plain Text.Echoes.Primary Echo.dragEnabled") },
        dragSteps:    { value: 8, min: 1, max: 30, step: 1, label: "Stamp Count", render: (get) => get("Plain Text.Echoes.Primary Echo.dragEnabled") },
        dragDecay:    { value: 0.7, min: 0.1, max: 1.0, step: 0.01, label: "Stamp Decay", render: (get) => get("Plain Text.Echoes.Primary Echo.dragEnabled") },
      }),
      "Secondary Echo": folder({
        blurEnabled:  { value: true, label: "Enable Blur" },
        blurAngle:    { value: 180, min: 0, max: 360, step: 1, label: "Blur Angle (°)", render: (get) => get("Plain Text.Echoes.Secondary Echo.blurEnabled") },
        blurLength:   { value: 0.08, min: 0.0, max: 0.5, step: 0.005, label: "Blur Length", render: (get) => get("Plain Text.Echoes.Secondary Echo.blurEnabled") },
        blurFalloff:  { value: 0.6, min: 0.0, max: 1.0, step: 0.01, label: "Blur Falloff", render: (get) => get("Plain Text.Echoes.Secondary Echo.blurEnabled") },
      }),
    }),
    bgColor: {
      value: "#000000",
      label: "Background",
      onChange: (v: string) => {
        const c = new THREE.Color(v);
        uBgColor.value.set(c.r, c.g, c.b);
      },
    },
  }));
  setRef.current = set;

  const { text, fontFamily, fontSize, textRotation, textX, textY, outlineEnabled, outlineWidth,
          repeatStrip, stripFraction, repeatCount, stripGap,
          solidEnabled, solidCount, solidSample, sectionGap,
          dragEnabled, dragAngle, dragDistance, dragSteps, dragDecay,
          blurEnabled, blurAngle, blurLength, blurFalloff } = controls as any;

  useEffect(() => {
    const canvas = textTexture.image as HTMLCanvasElement;
    canvas.width  = CANVAS_SIZE;
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
      const fontStr = `${fontSize}px ${selectedFont.style.fontFamily}, monospace`;

      ctx.font         = fontStr;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";

      // --- Metrics & drawing ---
      const metrics = ctx.measureText(text);
      const ascent  = metrics.actualBoundingBoxAscent;
      const descent = metrics.actualBoundingBoxDescent;
      const textH   = ascent + descent;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rad);
      if (outlineEnabled && outlineWidth > 0) {
        ctx.strokeStyle = "rgb(0,255,0)";
        ctx.lineWidth   = outlineWidth * 2;
        ctx.lineJoin    = "round";
        ctx.strokeText(text, 0, 0);
      }
      ctx.fillStyle = "rgb(255,0,0)";
      ctx.fillText(text, 0, 0);
      ctx.restore();

      // --- Ghost stamps (drag effect) ---
      if (dragEnabled && dragSteps > 0 && dragDistance > 0) {
        const dragRad = (dragAngle * Math.PI) / 180;
        const dx = (Math.cos(dragRad) * dragDistance) / dragSteps;
        const dy = (Math.sin(dragRad) * dragDistance) / dragSteps;
        const stampRad = (textRotation * Math.PI) / 180;

        for (let i = 1; i <= dragSteps; i++) {
          const alpha = Math.pow(dragDecay, i);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.font = fontStr;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.translate(cx + dx * i, cy + dy * i);
          ctx.rotate(stampRad);
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
      }

      // --- Strip repeat effect (Up only) ---
      const textTopY = Math.round(cy - ascent);
      const stripH   = Math.max(1, Math.round(textH * stripFraction));

      if (repeatStrip && textH > 0) {
        const strip = ctx.getImageData(0, textTopY, CANVAS_SIZE, stripH);
        for (let i = 1; i <= repeatCount; i++) {
          ctx.putImageData(strip, 0, textTopY - i * (stripH + stripGap));
        }
      }

      if (solidEnabled && textH > 0) {
        const solidRowH    = Math.max(1, Math.round(textH * 0.05));
        const solidSampleY = Math.round(textTopY + textH * solidSample);
        const sourceRow    = ctx.getImageData(0, solidSampleY, CANVAS_SIZE, 1);
        const totalH       = solidCount * solidRowH;
        const solidStartY  = repeatStrip
          ? textTopY - repeatCount * (stripH + stripGap) - stripH - sectionGap
          : textTopY - sectionGap;
        const filled = ctx.createImageData(CANVAS_SIZE, totalH);
        for (let row = 0; row < totalH; row++) {
          filled.data.set(sourceRow.data, row * CANVAS_SIZE * 4);
        }
        ctx.putImageData(filled, 0, solidStartY - totalH);
      }

      // --- Compute content UV bounds and update palette uniforms ---
      const contentBottomCanvasY = cy + descent;
      let contentTopCanvasY: number;

      if (solidEnabled && textH > 0) {
        const solidRowH2   = Math.max(1, Math.round(textH * 0.05));
        const solidStartY2 = repeatStrip
          ? textTopY - repeatCount * (stripH + stripGap) - stripH - sectionGap
          : textTopY - sectionGap;
        contentTopCanvasY = solidStartY2 - solidCount * solidRowH2;
        const contentH = contentBottomCanvasY - contentTopCanvasY;
        uStripUVH.value = contentH > 0 ? solidRowH2 / contentH : 0.05;
      } else if (repeatStrip && textH > 0) {
        contentTopCanvasY = textTopY - repeatCount * (stripH + stripGap);
        const contentH = contentBottomCanvasY - contentTopCanvasY;
        uStripUVH.value = contentH > 0 ? stripH / contentH : 0.05;
      } else {
        contentTopCanvasY = textTopY;
        uStripUVH.value = 0.05;
      }

      uPalMin.value = 1 - contentBottomCanvasY / CANVAS_SIZE;
      uPalMax.value = 1 - contentTopCanvasY / CANVAS_SIZE;
    }

    uTextX.value = textX;
    uTextY.value = textY;
    uDragAngle.value  = (dragAngle * Math.PI) / 180;
    uBlurAngle.value  = (blurAngle * Math.PI) / 180;
    uBlurLength.value = blurLength;
    uBlurFalloff.value = blurFalloff;
    uBlurEnabled.value = blurEnabled ? 1.0 : 0.0;
    textTexture.needsUpdate = true;
  }, [text, fontFamily, fontSize, textRotation, textX, textY, outlineEnabled, outlineWidth,
      repeatStrip, stripFraction, repeatCount, stripGap,
      solidEnabled, solidCount, solidSample, sectionGap,
      dragEnabled, dragAngle, dragDistance, dragSteps, dragDecay,
      blurEnabled, blurAngle, blurLength, blurFalloff,
      textTexture, uStripUVH, uPalMin, uPalMax,
      uDragAngle, uBlurLength, uBlurFalloff, uBlurEnabled]);

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

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();

      // Aspect-correct UV for text sampling (matches StackedGradient pattern)
      const textAnchor = vec2(uTextX, uTextY);
      const textDelta  = uvCoord.sub(textAnchor);
      const textUV     = vec2(textDelta.x.mul(uAspect), textDelta.y).add(textAnchor);

      // Directional blur: 8 samples along drag direction, weighted by exponential falloff
      const dragDir = vec2(cos(uBlurAngle), sin(uBlurAngle)).mul(uBlurLength);
      const s0 = texture(textTexture, textUV);
      const s1 = texture(textTexture, textUV.add(dragDir.mul(float(1 / 8))));
      const s2 = texture(textTexture, textUV.add(dragDir.mul(float(2 / 8))));
      const s3 = texture(textTexture, textUV.add(dragDir.mul(float(3 / 8))));
      const s4 = texture(textTexture, textUV.add(dragDir.mul(float(4 / 8))));
      const s5 = texture(textTexture, textUV.add(dragDir.mul(float(5 / 8))));
      const s6 = texture(textTexture, textUV.add(dragDir.mul(float(6 / 8))));
      const s7 = texture(textTexture, textUV.add(dragDir.mul(float(7 / 8))));

      const w1 = uBlurFalloff.pow(float(1));
      const w2 = uBlurFalloff.pow(float(2));
      const w3 = uBlurFalloff.pow(float(3));
      const w4 = uBlurFalloff.pow(float(4));
      const w5 = uBlurFalloff.pow(float(5));
      const w6 = uBlurFalloff.pow(float(6));
      const w7 = uBlurFalloff.pow(float(7));

      const blurredR = max(s0.r, max(s1.r.mul(w1), max(s2.r.mul(w2), max(s3.r.mul(w3),
                       max(s4.r.mul(w4), max(s5.r.mul(w5), max(s6.r.mul(w6), s7.r.mul(w7))))))));
      const blurredG = max(s0.g, max(s1.g.mul(w1), max(s2.g.mul(w2), max(s3.g.mul(w3),
                       max(s4.g.mul(w4), max(s5.g.mul(w5), max(s6.g.mul(w6), s7.g.mul(w7))))))));

      const texR = mix(s0.r, blurredR, uBlurEnabled);
      const texG = mix(s0.g, blurredG, uBlurEnabled);

      const fillSample    = smoothstep(float(0.05), float(0.6), texR);
      const outlineSample = smoothstep(float(0.05), float(0.6), texG);

      // Normalize to content UV range so palette spans full content height
      const palT = uvCoord.y.sub(uPalMin).div(uPalMax.sub(uPalMin)).clamp(0, 1);
      const snapT = floor(palT.div(uStripUVH).add(float(0.5))).mul(uStripUVH);
      const palTFinal = mix(palT, snapT, step(float(0.5), uSnapStrips));

      const cosineCol = (cosinePalette as any)(palTFinal, uA, uB, uC, uD);

      const t01 = palTFinal.mul(3.0).clamp(0, 1);
      const t12 = palTFinal.sub(float(1.0 / 3.0)).mul(3.0).clamp(0, 1);
      const t23 = palTFinal.sub(float(2.0 / 3.0)).mul(3.0).clamp(0, 1);
      const seg01 = mix(uColor0, uColor1, t01);
      const seg12 = mix(uColor1, uColor2, t12);
      const seg23 = mix(uColor2, uColor3, t23);
      const inSeg1 = step(float(1.0 / 3.0), palTFinal);
      const inSeg2 = step(float(2.0 / 3.0), palTFinal);
      const gradCol = mix(mix(seg01, seg12, inSeg1), seg23, inSeg2);

      const fillCol = mix(
        mix(vec3(uTextColor), gradCol, step(float(0.5), uColorMode)),
        cosineCol,
        step(float(1.5), uColorMode),
      );

      const bg          = vec4(uBgColor, float(1));
      const withOutline = mix(bg, vec4(uOutlineColor, float(1)), outlineSample);
      const withFill    = mix(withOutline, vec4(fillCol, float(1)), fillSample);

      return withFill;
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [uAspect, uTextX, uTextY, uBgColor, uTextColor, uOutlineColor, uColorMode,
      uA, uB, uC, uD, uColor0, uColor1, uColor2, uColor3,
      uSnapStrips, uStripUVH, uPalMin, uPalMax,
      uDragAngle, uBlurAngle, uBlurLength, uBlurFalloff, uBlurEnabled,
      textTexture]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
