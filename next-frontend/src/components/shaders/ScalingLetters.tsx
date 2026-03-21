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
  mix,
  step,
  smoothstep,
  texture,
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

const CANVAS_SIZE = 512;

const palettes = {
  Rainbow: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
  "Cool Blue": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
  "Neon Heat": { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
  Cyberpunk: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
  Golden: { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

function getCellCa(texIndex: number, letterCount: number, aspect: number): number {
  if (texIndex === 1) return letterCount === 1 ? aspect : aspect * 2 / 3;
  if (letterCount === 2) return aspect / 3;
  if (letterCount === 3) return aspect * 2 / 3;
  if (letterCount === 4) return texIndex === 2 ? aspect * 2 / 3 : aspect / 3;
  if (letterCount === 5) {
    if (texIndex === 2 || texIndex === 5) return aspect;
    return aspect / 2;
  }
  return aspect * 2 / 3;
}

function drawLetter(
  tex: THREE.CanvasTexture,
  letter: string,
  font: string,
  size: number,
  outlineEnabled: boolean,
  outlineWidth: number,
  ca = 1,
) {
  const canvas = tex.image as HTMLCanvasElement;
  const canvasW = Math.round(CANVAS_SIZE * ca);
  const canvasH = CANVAS_SIZE;
  canvas.width = canvasW;
  canvas.height = canvasH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasW, canvasH);
  if (letter) {
    ctx.font = `bold ${size}px ${font}, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    const metrics = ctx.measureText(letter);
    const y = canvasH / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    if (outlineEnabled && outlineWidth > 0) {
      ctx.strokeStyle = "rgb(0,255,0)";
      ctx.lineWidth = outlineWidth * 2;
      ctx.lineJoin = "round";
      ctx.strokeText(letter, canvasW / 2, y);
    }
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillText(letter, canvasW / 2, y);
  }
  tex.needsUpdate = true;
}

export function ScalingLetters(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, camera, viewport } = useThree();
  const setRef = useRef<any>(null);

  const uAspect       = useMemo(() => uniform(1.0), []);
  const uA            = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB            = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC            = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD            = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);
  const uBorderWidth        = useMemo(() => uniform(0.01), []);
  const uBorderColor        = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uOutlineColor       = useMemo(() => uniform(new THREE.Vector3(0.0, 0.0, 0.0)), []);
  const uTextEnabled        = useMemo(() => uniform(1.0), []);
  const uOuterBorderEnabled = useMemo(() => uniform(0.0), []);

  const [tex1] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex2] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex3] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex4] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex5] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));
  const [tex6] = useState(() => new THREE.CanvasTexture(document.createElement("canvas")));

  const [controls, set] = useControls("Scaling Letters", () => ({
    word: { value: "ABCDE", label: "Word", type: LevaInputs.STRING },
    fontFamily: { value: "Montserrat", label: "Font", options: Object.keys(fontMap) },
    fontSize: { value: 300, min: 50, max: 500, step: 10, label: "Font Size" },
    outlineEnabled: { value: false, label: "Outline" },
    outlineWidth: { value: 12, min: 1, max: 60, step: 1, label: "Outline Width" },
    outlineColor: {
      value: "#000000",
      label: "Outline Color",
      onChange: (v: string) => { const c = new THREE.Color(v); uOutlineColor.value.set(c.r, c.g, c.b); },
    },
    textEnabled: {
      value: true,
      label: "Text",
      onChange: (v: boolean) => { uTextEnabled.value = v ? 1.0 : 0.0; },
    },
    borderWidth: {
      value: 0.01,
      min: 0.002,
      max: 0.05,
      step: 0.001,
      label: "Border Width",
      onChange: (v: number) => { uBorderWidth.value = v; },
    },
    borderColor: {
      value: "#ffffff",
      label: "Border Color",
      onChange: (v: string) => { const c = new THREE.Color(v); uBorderColor.value.set(c.r, c.g, c.b); },
    },
    outerBorder: {
      value: false,
      label: "Outer Border",
      onChange: (v: boolean) => { uOuterBorderEnabled.value = v ? 1.0 : 0.0; },
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

  const { word, fontFamily, fontSize, outlineEnabled, outlineWidth, exportWidth, exportHeight } = controls as any;

  const letters = (word as string).slice(0, 6).split("").filter(Boolean);
  const letterCount = Math.max(1, letters.length);

  const l1 = letters[0] ?? "";
  const l2 = letters[1] ?? "";
  const l3 = letters[2] ?? "";
  const l4 = letters[3] ?? "";
  const l5 = letters[4] ?? "";
  const l6 = letters[5] ?? "";

  const fontFamilyString = fontMap[fontFamily as keyof typeof fontMap]?.style.fontFamily ?? fontFamily;

  const aspect = viewport.width / viewport.height;
  useEffect(() => { drawLetter(tex1, l1, fontFamilyString, fontSize, outlineEnabled, outlineWidth, getCellCa(1, letterCount, aspect)); }, [tex1, l1, fontFamilyString, fontSize, outlineEnabled, outlineWidth, letterCount, aspect]);
  useEffect(() => { drawLetter(tex2, l2, fontFamilyString, fontSize, outlineEnabled, outlineWidth, getCellCa(2, letterCount, aspect)); }, [tex2, l2, fontFamilyString, fontSize, outlineEnabled, outlineWidth, letterCount, aspect]);
  useEffect(() => { drawLetter(tex3, l3, fontFamilyString, fontSize, outlineEnabled, outlineWidth, getCellCa(3, letterCount, aspect)); }, [tex3, l3, fontFamilyString, fontSize, outlineEnabled, outlineWidth, letterCount, aspect]);
  useEffect(() => { drawLetter(tex4, l4, fontFamilyString, fontSize, outlineEnabled, outlineWidth, getCellCa(4, letterCount, aspect)); }, [tex4, l4, fontFamilyString, fontSize, outlineEnabled, outlineWidth, letterCount, aspect]);
  useEffect(() => { drawLetter(tex5, l5, fontFamilyString, fontSize, outlineEnabled, outlineWidth, getCellCa(5, letterCount, aspect)); }, [tex5, l5, fontFamilyString, fontSize, outlineEnabled, outlineWidth, letterCount, aspect]);
  useEffect(() => { drawLetter(tex6, l6, fontFamilyString, fontSize, outlineEnabled, outlineWidth, getCellCa(6, letterCount, aspect)); }, [tex6, l6, fontFamilyString, fontSize, outlineEnabled, outlineWidth, letterCount, aspect]);

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

    // Preserve current viewport aspect ratio so content is not distorted
    const targetHeight = Math.round(targetWidth * (originalSize.y / originalSize.x));

    gl.setSize(targetWidth, targetHeight, false);
    gl.setPixelRatio(1);

    scene.background = null;
    gl.setClearColor(0x000000, 0);
    gl.render(scene, camera);

    const dataUrl = gl.domElement.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.download = "scaling-letters.png";
    link.href = dataUrl;
    link.click();

    gl.setSize(originalSize.x, originalSize.y, false);
    gl.setPixelRatio(originalPixelRatio);
    scene.background = originalBackground;
    gl.render(scene, camera);
  }, [gl, scene, camera]);

  useControls("Scaling Letters", { "Export PNG": button(handleExport) }, [handleExport]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();
      const aa = float(0.0008);
      const bw = uBorderWidth;

      const localUV      = vec2(0, 0).toVar();
      const isBorder     = float(0).toVar();
      const activeSample = vec4(0, 0, 0, 0).toVar();

      if (letterCount === 1) {
        localUV.assign(uvCoord);
        activeSample.assign(texture(tex1, uvCoord));
      } else if (letterCount === 2) {
        const isRight = step(float(2/3), uvCoord.x);
        const luv1 = vec2(uvCoord.x.mul(1.5), uvCoord.y);
        const luv2 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y);
        localUV.assign(mix(luv1, luv2, isRight));
        activeSample.assign(mix(texture(tex1, luv1), texture(tex2, luv2), isRight));
        const vertB = float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(2/3).abs()));
        isBorder.assign(vertB);
      } else if (letterCount === 3) {
        const isRight = step(float(2/3), uvCoord.x);
        const isTop   = step(float(0.5), uvCoord.y);
        const luv1 = vec2(uvCoord.x.mul(1.5), uvCoord.y);
        const luv2 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y.sub(0.5).mul(2));
        const luv3 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y.mul(2));
        const rightUV     = mix(luv3, luv2, isTop);
        const rightSample = mix(texture(tex3, luv3), texture(tex2, luv2), isTop);
        localUV.assign(mix(luv1, rightUV, isRight));
        activeSample.assign(mix(texture(tex1, luv1), rightSample, isRight));
        const vertB  = float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(2/3).abs()));
        const horizB = isRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.y.sub(0.5).abs().div(uAspect))));
        isBorder.assign(vertB.max(horizB));
      } else if (letterCount === 4) {
        const isRight       = step(float(2/3), uvCoord.x);
        const isTop         = step(float(0.5), uvCoord.y);
        const isMidRight    = step(float(5/6), uvCoord.x);
        const isBottomRight = isRight.mul(float(1).sub(isTop));
        const luv1 = vec2(uvCoord.x.mul(1.5), uvCoord.y);
        const luv2 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y.sub(0.5).mul(2));
        const luv3 = vec2(uvCoord.x.sub(2/3).mul(6), uvCoord.y.mul(2));
        const luv4 = vec2(uvCoord.x.sub(5/6).mul(6), uvCoord.y.mul(2));
        const bottomRightUV     = mix(luv3, luv4, isMidRight);
        const bottomRightSample = mix(texture(tex3, luv3), texture(tex4, luv4), isMidRight);
        const rightUV     = mix(bottomRightUV, luv2, isTop);
        const rightSample = mix(bottomRightSample, texture(tex2, luv2), isTop);
        localUV.assign(mix(luv1, rightUV, isRight));
        activeSample.assign(mix(texture(tex1, luv1), rightSample, isRight));
        const vertB  = float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(2/3).abs()));
        const horizB = isRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.y.sub(0.5).abs().div(uAspect))));
        const midB   = isBottomRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(5/6).abs())));
        isBorder.assign(vertB.max(horizB).max(midB));
      } else if (letterCount === 5) {
        const isRight      = step(float(2/3), uvCoord.x);
        const isTopThird   = step(float(2/3), uvCoord.y);
        const isAboveThird = step(float(1/3), uvCoord.y);
        const isMidRight   = step(float(5/6), uvCoord.x);
        const isMidRow     = isRight.mul(isAboveThird).mul(float(1).sub(isTopThird));
        const luv1 = vec2(uvCoord.x.mul(1.5), uvCoord.y);
        const luv2 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y.sub(2/3).mul(3));
        const luv3 = vec2(uvCoord.x.sub(2/3).mul(6), uvCoord.y.sub(1/3).mul(3));
        const luv4 = vec2(uvCoord.x.sub(5/6).mul(6), uvCoord.y.sub(1/3).mul(3));
        const luv5 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y.mul(3));
        const midUV        = mix(luv3, luv4, isMidRight);
        const nonTopUV     = mix(luv5, midUV, isAboveThird);
        const rightUV      = mix(nonTopUV, luv2, isTopThird);
        localUV.assign(mix(luv1, rightUV, isRight));
        const midSample    = mix(texture(tex3, luv3), texture(tex4, luv4), isMidRight);
        const nonTopSample = mix(texture(tex5, luv5), midSample, isAboveThird);
        const rightSample  = mix(nonTopSample, texture(tex2, luv2), isTopThird);
        activeSample.assign(mix(texture(tex1, luv1), rightSample, isRight));
        const vertB     = float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(2/3).abs()));
        const horizTopB = isRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.y.sub(2/3).abs().div(uAspect))));
        const horizBotB = isRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.y.sub(1/3).abs().div(uAspect))));
        const midB      = isMidRow.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(5/6).abs())));
        isBorder.assign(vertB.max(horizTopB).max(horizBotB).max(midB));
      } else {
        // N=6
        const isRight       = step(float(2/3), uvCoord.x);
        const isTop         = step(float(0.5), uvCoord.y);
        const isMidRight    = step(float(5/6), uvCoord.x);
        const isMidBottom   = step(float(0.25), uvCoord.y);
        const isBottomRight = isRight.mul(float(1).sub(isTop));
        const luv1 = vec2(uvCoord.x.mul(1.5), uvCoord.y);
        const luv2 = vec2(uvCoord.x.sub(2/3).mul(3), uvCoord.y.sub(0.5).mul(2));
        const luv3 = vec2(uvCoord.x.sub(2/3).mul(6), uvCoord.y.sub(0.25).mul(4));
        const luv4 = vec2(uvCoord.x.sub(5/6).mul(6), uvCoord.y.sub(0.25).mul(4));
        const luv5 = vec2(uvCoord.x.sub(2/3).mul(6), uvCoord.y.mul(4));
        const luv6 = vec2(uvCoord.x.sub(5/6).mul(6), uvCoord.y.mul(4));
        const botRightTopUV  = mix(luv3, luv4, isMidRight);
        const botRightBotUV  = mix(luv5, luv6, isMidRight);
        const botRightUV     = mix(botRightBotUV, botRightTopUV, isMidBottom);
        const rightUV        = mix(botRightUV, luv2, isTop);
        localUV.assign(mix(luv1, rightUV, isRight));
        const botRightTopSample = mix(texture(tex3, luv3), texture(tex4, luv4), isMidRight);
        const botRightBotSample = mix(texture(tex5, luv5), texture(tex6, luv6), isMidRight);
        const botRightSample    = mix(botRightBotSample, botRightTopSample, isMidBottom);
        const rightSample       = mix(botRightSample, texture(tex2, luv2), isTop);
        activeSample.assign(mix(texture(tex1, luv1), rightSample, isRight));
        const vertB   = float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(2/3).abs()));
        const horizB  = isRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.y.sub(0.5).abs().div(uAspect))));
        const midB    = isBottomRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.x.sub(5/6).abs())));
        const midBotB = isBottomRight.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), uvCoord.y.sub(0.25).abs().div(uAspect))));
        isBorder.assign(vertB.max(horizB).max(midB).max(midBotB));
      }

      const edgeX    = mix(uvCoord.x, float(1).sub(uvCoord.x), step(float(0.5), uvCoord.x));
      const edgeY    = mix(uvCoord.y.div(uAspect), float(1).sub(uvCoord.y).div(uAspect), step(float(0.5), uvCoord.y));
      const edgeDist = mix(edgeX, edgeY, step(edgeX, edgeY));
      const outerB = uOuterBorderEnabled.mul(float(1).sub(smoothstep(bw.sub(aa), bw.add(aa), edgeDist)));

      const fillMask    = smoothstep(float(0.3), float(0.7), activeSample.r).mul(uTextEnabled);
      const outlineMask = smoothstep(float(0.3), float(0.7), activeSample.g).mul(uTextEnabled);
      const cosCol      = (cosinePalette as any)(localUV.x, uA, uB, uC, uD);
      const letterColor = mix(cosCol, uOutlineColor, outlineMask);
      const letterAlpha = fillMask.max(outlineMask);
      const finalColor  = mix(mix(mix(vec3(0), letterColor, letterAlpha), uBorderColor, isBorder), uBorderColor, outerB);
      return vec4(finalColor, isBorder.max(outerB).max(letterAlpha));
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [
    letterCount,
    uBorderWidth, uBorderColor, uOutlineColor, uTextEnabled, uOuterBorderEnabled,
    uA, uB, uC, uD,
    tex1, tex2, tex3, tex4, tex5, tex6,
  ]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
