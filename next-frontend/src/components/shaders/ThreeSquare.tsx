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
  vec3,
  uv,
  float,
  Fn,
  uniform,
  fract,
  floor,
  mix,
  abs,
  step,
  texture,
  smoothstep,
} from "three/tsl";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { useControls, LevaInputs, button, folder } from "leva";
import { cosinePalette } from "./tsl/utils/color/cosine_palette";
import { sdBox2d } from "./tsl/utils/sdf/shapes";

// Fixed-weight fonts
const spaceMono = Space_Mono({ weight: ["700"], subsets: ["latin"] });
const courierPrime = Courier_Prime({
  weight: "700",
  subsets: ["latin"],
});
const fragmentMono = Fragment_Mono({ weight: "400", subsets: ["latin"] });
// Variable fonts
const robotoMono = Roboto_Mono({ weight: "700", subsets: ["latin"] });
const firaCode = Fira_Code({ weight: "700", subsets: ["latin"] });
const inconsolata = Inconsolata({ weight: "800", subsets: ["latin"] });
const azeretMono = Azeret_Mono({ weight: "800", subsets: ["latin"] });
const splineSansMono = Spline_Sans_Mono({ weight: "700", subsets: ["latin"] });
const geistMono = Geist_Mono({ weight: "800", subsets: ["latin"] });
const syne = Syne({ weight: "800", subsets: ["latin"] });
const unbounded = Unbounded({ weight: "800", subsets: ["latin"] });
const bricolageGrotesque = Bricolage_Grotesque({
  weight: "800",
  subsets: ["latin"],
});
const epilogue = Epilogue({ weight: "800", subsets: ["latin"] });
const dmSans = DM_Sans({ weight: "800", subsets: ["latin"] });
const oswald = Oswald({ weight: "700", subsets: ["latin"] });
const montserrat = Montserrat({ weight: "900", subsets: ["latin"] });

const fontMap = {
  "Space Mono": spaceMono,
  "Roboto Mono": robotoMono,
  "Fira Code": firaCode,
  Inconsolata: inconsolata,
  "Courier Prime": courierPrime,
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

const CANVAS_SIZE = 512;

type PaletteVec = [number, number, number];
type Palette = { a: PaletteVec; b: PaletteVec; c: PaletteVec; d: PaletteVec };
const palettes: Record<string, Palette> = {
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
    // Measure actual glyph extents to compute true visual center.
    const metrics = ctx.measureText(letter);
    const y = CANVAS_SIZE / 2 + (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
    // Outline pass — pure green channel, drawn before fill so fill covers the inner half.
    if (outlineEnabled && outlineWidth > 0) {
      ctx.strokeStyle = "rgb(0,255,0)";
      ctx.lineWidth = outlineWidth * 2;
      ctx.lineJoin = "round";
      ctx.strokeText(letter, CANVAS_SIZE / 2, y);
    }
    // Fill pass — pure red channel.
    ctx.fillStyle = "rgb(255,0,0)";
    ctx.fillText(letter, CANVAS_SIZE / 2, y);
  }
  tex.needsUpdate = true;
}

export function ThreeSquare(props: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gl, scene, viewport, camera } = useThree();

  const fillRef = useRef(0.85);
  const squareCountRef = useRef(3);
  const setRef = useRef<any>(null);

  const uAspect = useMemo(() => uniform(1.0), []);
  const uSquareSize = useMemo(() => uniform(0.28), []);
  const uOffset = useMemo(() => uniform(0.2), []);
  const uDensity = useMemo(() => uniform(10.0), []);
  const uColWidth = useMemo(() => uniform(0.35), []);
  const uColWidthWide = useMemo(() => uniform(0.45), []);
  const uGlobalGradient = useMemo(() => uniform(0.0), []);
  const uSquareCount = useMemo(() => uniform(3.0), []);
  const uOutlineColor = useMemo(
    () => uniform(new THREE.Vector3(0.0, 0.0, 0.0)),
    [],
  );
  const uA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
  const uC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
  const uD = useMemo(() => uniform(new THREE.Vector3(0.0, 0.33, 0.67)), []);
  const uColorMode = useMemo(() => uniform(0.0), []);
  const uColor0 = useMemo(() => uniform(new THREE.Vector3(1.0, 0.2, 0.4)), []);
  const uColor1 = useMemo(() => uniform(new THREE.Vector3(1.0, 0.8, 0.0)), []);
  const uColor2 = useMemo(() => uniform(new THREE.Vector3(0.0, 0.8, 1.0)), []);
  const uColor3 = useMemo(() => uniform(new THREE.Vector3(0.667, 0.0, 1.0)), []);

  const [tex1] = useState(
    () => new THREE.CanvasTexture(document.createElement("canvas")),
  );
  const [tex2] = useState(
    () => new THREE.CanvasTexture(document.createElement("canvas")),
  );
  const [tex3] = useState(
    () => new THREE.CanvasTexture(document.createElement("canvas")),
  );
  const [tex4] = useState(
    () => new THREE.CanvasTexture(document.createElement("canvas")),
  );

  const [controls, set] = useControls("Three Square", () => ({
    squareCount: {
      value: 3,
      options: [2, 3, 4],
      label: "Square Count",
      onChange: (v: number) => {
        uSquareCount.value = v;
        squareCountRef.current = v;
      },
    },
    fill: {
      value: 0.85,
      min: 0.1,
      max: 1.0,
      step: 0.01,
      label: "Fill",
      onChange: (v: number) => {
        fillRef.current = v;
      },
    },
    offset: {
      value: 0.2,
      min: 0.0,
      max: 0.45,
      step: 0.01,
      label: "Diagonal Offset",
      onChange: (v: number) => {
        uOffset.value = v;
      },
    },
    density: {
      value: 10,
      min: 2,
      max: 40,
      step: 1,
      label: "Grid Density",
      onChange: (v: number) => {
        uDensity.value = v;
      },
    },
    colWidth: {
      value: 0.35,
      min: 0.05,
      max: 0.49,
      step: 0.01,
      label: "Column Width",
      onChange: (v: number) => {
        uColWidth.value = v;
      },
    },
    Palette: folder({
      colorMode: {
        value: "Cosine",
        options: ["Cosine", "4-Stop"],
        label: "Color Mode",
        onChange: (v: string) => {
          uColorMode.value = v === "4-Stop" ? 1.0 : 0.0;
        },
      },
      globalGradient: {
        value: false,
        label: "Global Gradient",
        onChange: (v: boolean) => {
          uGlobalGradient.value = v ? 1.0 : 0.0;
        },
      },
      // Cosine palette controls
      palette: {
        value: "Rainbow",
        options: Object.keys(palettes),
        render: (get) => get("Three Square.Palette.colorMode") === "Cosine",
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
      a: {
        value: [0.5, 0.5, 0.5],
        render: (get) => get("Three Square.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uA.value.set(...v),
      },
      b: {
        value: [0.5, 0.5, 0.5],
        render: (get) => get("Three Square.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uB.value.set(...v),
      },
      c: {
        value: [1.0, 1.0, 1.0],
        render: (get) => get("Three Square.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uC.value.set(...v),
      },
      d: {
        value: [0.0, 0.33, 0.67],
        render: (get) => get("Three Square.Palette.colorMode") === "Cosine",
        onChange: (v: [number, number, number]) => uD.value.set(...v),
      },
      Randomize: button(
        () => {
          const r = () => Math.random();
          const newA: [number, number, number] = [
            r() * 0.4 + 0.3,
            r() * 0.4 + 0.3,
            r() * 0.4 + 0.3,
          ];
          const newB: [number, number, number] = [
            r() * 0.4 + 0.3,
            r() * 0.4 + 0.3,
            r() * 0.4 + 0.3,
          ];
          const newC: [number, number, number] = [
            r() * 1.5 + 0.5,
            r() * 1.5 + 0.5,
            r() * 1.5 + 0.5,
          ];
          const newD: [number, number, number] = [r(), r(), r()];
          setRef.current?.({ a: newA, b: newB, c: newC, d: newD });
          uA.value.set(...newA);
          uB.value.set(...newB);
          uC.value.set(...newC);
          uD.value.set(...newD);
        },
        { render: (get: (key: string) => any) => get("Three Square.Palette.colorMode") === "Cosine" } as any,
      ),
      // 4-stop color pickers
      color0: {
        value: "#ff3366",
        label: "Color 1",
        render: (get) => get("Three Square.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor0.value.set(c.r, c.g, c.b);
        },
      },
      color1: {
        value: "#ffcc00",
        label: "Color 2",
        render: (get) => get("Three Square.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor1.value.set(c.r, c.g, c.b);
        },
      },
      color2: {
        value: "#00ccff",
        label: "Color 3",
        render: (get) => get("Three Square.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor2.value.set(c.r, c.g, c.b);
        },
      },
      color3: {
        value: "#aa00ff",
        label: "Color 4",
        render: (get) => get("Three Square.Palette.colorMode") === "4-Stop",
        onChange: (v: string) => {
          const c = new THREE.Color(v);
          uColor3.value.set(c.r, c.g, c.b);
        },
      },
    }),
    Letters: folder({
      letter1: { value: "A", label: "Letter 1", type: LevaInputs.STRING },
      letter2: { value: "B", label: "Letter 2", type: LevaInputs.STRING },
      letter3: { value: "C", label: "Letter 3", type: LevaInputs.STRING },
      letter4: { value: "D", label: "Letter 4", type: LevaInputs.STRING },
      fontFamily: {
        value: "Montserrat",
        label: "Font",
        options: Object.keys(fontMap),
      },
      fontSize: { value: 300, min: 50, max: 500, step: 10, label: "Font Size" },
      colWidthWide: {
        value: 0.45,
        min: 0.05,
        max: 0.49,
        step: 0.01,
        label: "Column Width (Letter)",
        onChange: (v: number) => {
          uColWidthWide.value = v;
        },
      },
      outlineEnabled: { value: false, label: "Outline" },
      outlineWidth: {
        value: 12,
        min: 1,
        max: 60,
        step: 1,
        label: "Outline Width",
      },
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
      exportWidth: {
        value: 4500,
        min: 100,
        max: 9000,
        step: 10,
        label: "Width",
      },
      exportHeight: {
        value: 4500,
        min: 100,
        max: 9000,
        step: 10,
        label: "Height",
      },
    }),
  }));
  setRef.current = set;

  const {
    letter1,
    letter2,
    letter3,
    letter4,
    fontFamily,
    fontSize,
    outlineEnabled,
    outlineWidth,
    exportWidth,
    exportHeight,
  } = controls as any;

  const fontFamilyString =
    fontMap[fontFamily as keyof typeof fontMap]?.style.fontFamily ?? fontFamily;
  useEffect(() => {
    drawLetter(
      tex1,
      letter1,
      fontFamilyString,
      fontSize,
      outlineEnabled,
      outlineWidth,
    );
  }, [tex1, letter1, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);
  useEffect(() => {
    drawLetter(
      tex2,
      letter2,
      fontFamilyString,
      fontSize,
      outlineEnabled,
      outlineWidth,
    );
  }, [tex2, letter2, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);
  useEffect(() => {
    drawLetter(
      tex3,
      letter3,
      fontFamilyString,
      fontSize,
      outlineEnabled,
      outlineWidth,
    );
  }, [tex3, letter3, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);
  useEffect(() => {
    drawLetter(
      tex4,
      letter4,
      fontFamilyString,
      fontSize,
      outlineEnabled,
      outlineWidth,
    );
  }, [tex4, letter4, fontFamilyString, fontSize, outlineEnabled, outlineWidth]);

  useFrame(() => {
    uAspect.value = viewport.width / viewport.height;
    // Outermost center = (n−1)/2 × offset; squareSize fills remaining space × fill factor.
    const outerCenter = ((squareCountRef.current - 1) / 2) * uOffset.value;
    uSquareSize.value = Math.max(0.01, 0.5 - outerCenter) * fillRef.current;
  });

  const { width, height } = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera)
      return { width: viewport.width, height: viewport.height };
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

    const { exportWidth: targetWidth, exportHeight: targetHeight } =
      exportSettingsRef.current;

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
    link.download = "three-square.png";
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

  useControls("Three Square", { "Export PNG": button(handleExport) }, [
    handleExport,
  ]);

  const material = useMemo(() => {
    const main = Fn(() => {
      const uvCoord = uv();
      const centered = uvCoord.sub(0.5);
      const p = vec2(centered.x.mul(uAspect), centered.y);

      // Square center positions: cx_i = (i − (n−1)/2) × offset, cy_i = −cx_i
      // This centers the arrangement regardless of count (2, 3, or 4).
      const halfN = uSquareCount.sub(1.0).mul(0.5); // (n−1)/2
      const c1x = float(0.0).sub(halfN).mul(uOffset);
      const c2x = float(1.0).sub(halfN).mul(uOffset);
      const c3x = float(2.0).sub(halfN).mul(uOffset);
      const c4x = float(3.0).sub(halfN).mul(uOffset);
      const c1 = vec2(c1x, c1x.negate());
      const c2 = vec2(c2x, c2x.negate());
      const c3 = vec2(c3x, c3x.negate());
      const c4 = vec2(c4x, c4x.negate());

      const sdf1 = sdBox2d(p.sub(c1), uSquareSize);
      const sdf2 = sdBox2d(p.sub(c2), uSquareSize);
      const sdf3 = sdBox2d(p.sub(c3), uSquareSize);
      const sdf4 = sdBox2d(p.sub(c4), uSquareSize);

      const sqMask1 = float(1).sub(step(float(0.0), sdf1));
      const sqMask2 = float(1).sub(step(float(0.0), sdf2));
      // c3 visible for count ≥ 3, c4 for count ≥ 4
      const gate3 = step(float(2.5), uSquareCount);
      const gate4 = step(float(3.5), uSquareCount);
      const sqMask3 = float(1)
        .sub(step(float(0.0), sdf3))
        .mul(gate3);
      const sqMask4 = float(1)
        .sub(step(float(0.0), sdf4))
        .mul(gate4);

      // Global gradient: left edge of c1 to right edge of last square.
      // outerCX = halfN × offset (x-coord of outermost center).
      const outerCX = halfN.mul(uOffset);
      const gradientHalfWidth = outerCX.add(uSquareSize);
      const globalPalT = p.x
        .add(gradientHalfWidth)
        .div(gradientHalfWidth.mul(2.0));

      const colLayer = (center: any, letterTex: THREE.CanvasTexture) => {
        const localUV = p
          .sub(center)
          .add(uSquareSize)
          .div(uSquareSize.mul(2.0));
        const scaledX = localUV.x.mul(uDensity);
        const cellX = fract(scaledX).sub(0.5);

        const texSample = texture(letterTex, localUV);
        const fillSample = smoothstep(float(0.3), float(0.7), texSample.r);
        const outlineSample = smoothstep(float(0.3), float(0.7), texSample.g);

        const effectiveWidth = mix(uColWidth, uColWidthWide, fillSample);
        const colInside = float(1).sub(
          step(float(0.0), abs(cellX).sub(effectiveWidth)),
        );

        const palT = mix(localUV.x, globalPalT, uGlobalGradient);
        const cosineCol = (cosinePalette as any)(palT, uA, uB, uC, uD);
        // 4-stop linear gradient
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

        // Outline overlaid on top of columns; present even where no column exists.
        const layerColor = mix(col, uOutlineColor, outlineSample);
        const layerAlpha = colInside.add(outlineSample).min(float(1.0));

        return { colInside: layerAlpha, col: layerColor };
      };

      const layer1 = colLayer(c1, tex1);
      const layer2 = colLayer(c2, tex2);
      const layer3 = colLayer(c3, tex3);
      const layer4 = colLayer(c4, tex4);

      const finalColor = vec3(0.0).toVar();
      const finalAlpha = float(0.0).toVar();

      const sq1Alpha = layer1.colInside.mul(sqMask1);
      finalColor.assign(mix(finalColor, layer1.col, sq1Alpha));
      finalAlpha.assign(mix(finalAlpha, float(1.0), sq1Alpha));

      const sq2Alpha = layer2.colInside.mul(sqMask2);
      finalColor.assign(mix(finalColor, layer2.col, sq2Alpha));
      finalAlpha.assign(mix(finalAlpha, float(1.0), sq2Alpha));

      const sq3Alpha = layer3.colInside.mul(sqMask3);
      finalColor.assign(mix(finalColor, layer3.col, sq3Alpha));
      finalAlpha.assign(mix(finalAlpha, float(1.0), sq3Alpha));

      const sq4Alpha = layer4.colInside.mul(sqMask4);
      finalColor.assign(mix(finalColor, layer4.col, sq4Alpha));
      finalAlpha.assign(mix(finalAlpha, float(1.0), sq4Alpha));

      return vec4(finalColor, finalAlpha);
    });

    const mat = new MeshBasicNodeMaterial();
    mat.colorNode = main();
    mat.transparent = true;
    return mat;
  }, [
    uAspect,
    uSquareSize,
    uOffset,
    uDensity,
    uColWidth,
    uColWidthWide,
    uGlobalGradient,
    uSquareCount,
    uOutlineColor,
    uA,
    uB,
    uC,
    uD,
    uColorMode,
    uColor0,
    uColor1,
    uColor2,
    uColor3,
    tex1,
    tex2,
    tex3,
    tex4,
  ]);

  return (
    <mesh ref={meshRef} {...props}>
      <planeGeometry args={[width, height]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
