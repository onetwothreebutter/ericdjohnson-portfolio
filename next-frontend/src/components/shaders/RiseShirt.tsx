'use client';

import {
    Space_Mono,
    Roboto_Mono,
    Source_Code_Pro,
    JetBrains_Mono,
    Fira_Code,
    Inconsolata,
    IBM_Plex_Mono,
    Courier_Prime,
    Share_Tech_Mono,
} from 'next/font/google';
import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree, useFrame } from '@react-three/fiber';
import {
    Fn, vec2, vec3, vec4, uv, mix, step, length, fract, uniform, float, smoothstep, texture, floor, select
} from 'three/tsl';
import { cosinePalette } from './tsl/utils/color/cosine_palette';
import { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls, button } from 'leva';

const spaceMono = Space_Mono({ weight: '700', subsets: ['latin'] });
const robotoMono = Roboto_Mono({ weight: '700', subsets: ['latin'] });
const sourceCodePro = Source_Code_Pro({ weight: '900', subsets: ['latin'] });
const jetBrainsMono = JetBrains_Mono({ weight: '800', subsets: ['latin'] });
const firaCode = Fira_Code({ weight: '700', subsets: ['latin'] });
const inconsolata = Inconsolata({ weight: '900', subsets: ['latin'] });
const ibmPlexMono = IBM_Plex_Mono({ weight: '700', subsets: ['latin'] });
const courierPrime = Courier_Prime({ weight: '700', subsets: ['latin'] });
const shareTechMono = Share_Tech_Mono({ weight: '400', subsets: ['latin'] });

const palettes = {
    'Cool Blue': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.263, 0.416, 0.557] },
    'Rainbow':   { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.0, 0.33, 0.67] },
    'Neon Heat': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 1.0], d: [0.3, 0.2, 0.2] },
    'Cyberpunk': { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [2.0, 1.0, 0.0], d: [0.5, 0.2, 0.25] },
    'Golden':    { a: [0.5, 0.5, 0.5], b: [0.5, 0.5, 0.5], c: [1.0, 1.0, 0.5], d: [0.8, 0.9, 0.3] },
};

const fontMap = {
    'Space Mono': spaceMono,
    'Roboto Mono': robotoMono,
    'Source Code Pro': sourceCodePro,
    'JetBrains Mono': jetBrainsMono,
    'Fira Code': firaCode,
    'Inconsolata': inconsolata,
    'IBM Plex Mono': ibmPlexMono,
    'Courier Prime': courierPrime,
    'Share Tech Mono': shareTechMono,
};

export function RiseShirt(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { gl, scene, camera, viewport } = useThree();

    // Leva controls
    const { rows, cols, minRadius, maxRadius, color, backgroundColor, exportWidth, exportHeight, transparent, preview, invert, topMargin, text, textGridCols, textGridRows, textX, textY, fontSize, textBlendAmount, textCircleRadius, textColor, textBgColor, textBgTransparent, fontFamily, colorMode } = useControls('Rise Shirt', {
        rows: { value: 48, min: 10, max: 200, step: 1 },
        cols: { value: 37, min: 1, max: 50, step: 1 },
        minRadius: { value: 0.02, min: 0.01, max: 0.5, step: 0.01 },
        maxRadius: { value: 0.55, min: 0.1, max: 1.5, step: 0.01 },
        color: { value: '#ffffff' },
        backgroundColor: { value: '#000000' },
        exportWidth: { value: 1720, min: 100, max: 8000, step: 10 },
        exportHeight: { value: 2450, min: 100, max: 8000, step: 10 },
        transparent: { value: true },
        preview: { value: true },
        invert: { value: true },
        topMargin: { value: 0.0, min: 0.0, max: 1.0, step: 0.01, label: 'Top Margin' },
        text: { value: 'RISE' },
        textGridCols: { value: 47, min: 1, max: 50, step: 1 },
        textGridRows: { value: 31, min: 1, max: 100, step: 1 },
        textX: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
        textY: { value: 0.79, min: 0.0, max: 1.0, step: 0.01 },
        fontSize: { value: 460, min: 50, max: 800, step: 10 },
        textBlendAmount: { value: 1.0, min: 0.0, max: 1.0, step: 0.01 },
        textCircleRadius: { value: 0.16, min: 0.01, max: 1.5, step: 0.01 },
        textColor: { value: '#ffffff' },
        textBgColor: { value: '#000000', label: 'Text BG Color' },
        textBgTransparent: { value: false, label: 'Text BG Transparent' },
        fontFamily: {
            value: 'Space Mono',
            options: Object.keys(fontMap),
        },
        colorMode: { value: 'Flat', options: ['Flat', 'Palette'] },
        palette: {
            value: 'Cool Blue',
            options: Object.keys(palettes),
            onChange: (v: string) => {
                const p = palettes[v as keyof typeof palettes];
                if (!p) return;
                uPaletteA.value.set(...(p.a as [number, number, number]));
                uPaletteB.value.set(...(p.b as [number, number, number]));
                uPaletteC.value.set(...(p.c as [number, number, number]));
                uPaletteD.value.set(...(p.d as [number, number, number]));
            },
        },
        a: { value: [0.5, 0.5, 0.5],       onChange: (v: [number, number, number]) => uPaletteA.value.set(...v) },
        b: { value: [0.5, 0.5, 0.5],       onChange: (v: [number, number, number]) => uPaletteB.value.set(...v) },
        c: { value: [1.0, 1.0, 1.0],       onChange: (v: [number, number, number]) => uPaletteC.value.set(...v) },
        d: { value: [0.263, 0.416, 0.557], onChange: (v: [number, number, number]) => uPaletteD.value.set(...v) },
    });

    const { width, height } = useMemo(() => {
        const z = (props.position?.[2] ?? (Array.isArray(props.position) ? props.position[2] : 0)) || 0;
        const cam = camera as THREE.PerspectiveCamera;

        if (!cam.isPerspectiveCamera) return viewport;

        const distance = Math.abs(cam.position.z - z);
        const fov = (cam.fov * Math.PI) / 180;
        const h = 2 * Math.tan(fov / 2) * distance;
        const w = h * (viewport.width / viewport.height);

        return { width: w, height: h };
    }, [camera, props.position, viewport]);

    // Calculate preview dimensions
    const { renderWidth, renderHeight } = useMemo(() => {
        // @ts-ignore
        const isPreview = typeof preview !== 'undefined' ? preview : false;

        if (!isPreview) {
            return { renderWidth: width, renderHeight: height };
        }

        // Target aspect ratio
        // @ts-ignore
        const targetWidth = typeof exportWidth !== 'undefined' ? exportWidth : 4000;
        // @ts-ignore
        const targetHeight = typeof exportHeight !== 'undefined' ? exportHeight : 4000;
        const targetAspect = targetWidth / targetHeight;

        // Current aspect ratio of the available space
        const currentAspect = width / height;

        let w = width;
        let h = height;

        if (currentAspect > targetAspect) {
            // Screen is wider than target: constrain width
            w = height * targetAspect;
        } else {
            // Screen is taller than target: constrain height
            h = width / targetAspect;
        }

        return { renderWidth: w, renderHeight: h };
        // @ts-ignore
    }, [width, height, preview, exportWidth, exportHeight]);

    // Handle export need to be memoized or just a function, but used in useControls.
    // Ideally we define it before passing to useControls, but useControls needs to be top level?
    // Actually useControls can be called multiple times.
    // But button callback shouldn't depend on render vars if possible to avoid stale closures?
    // In this case, gl, scene, camera are stable. width/height change on resize.
    // If we use 'width/height' inside the callback, we need to make sure the callback is fresh.
    // But useControls inputs are not re-registered easily.
    // However, button callback can access refs.
    // Let's use a ref for dimensions if needed, or just calculate inside.
    const dimensionsRef = useRef({ width, height });
    dimensionsRef.current = { width, height };

    // Use refs to track latest state for export callback
    const exportSettingsRef = useRef({ width: 4000, height: 4000, transparent: false });

    // Update ref in render body which runs when controls change
    exportSettingsRef.current = {
        width: typeof exportWidth !== 'undefined' ? exportWidth : 4000,
        height: typeof exportHeight !== 'undefined' ? exportHeight : 4000,
        transparent: typeof transparent !== 'undefined' ? transparent : false
    };


    // Uniforms
    const uRatio = useMemo(() => uniform(1), []);
    const uRows = useMemo(() => uniform(100), []);
    const uCols = useMemo(() => uniform(10), []);
    const uMinRadius = useMemo(() => uniform(0.05), []);
    const uMaxRadius = useMemo(() => uniform(0.6), []);
    const uColorVec4 = useMemo(() => uniform(new THREE.Vector4(0, 0, 0, 1)), []);
    const uBgColorVec4 = useMemo(() => uniform(new THREE.Vector4(1, 1, 1, 1)), []);
    const uTextColorVec4 = useMemo(() => uniform(new THREE.Vector4(1, 1, 1, 1)), []);
    const uTextBgColorVec4 = useMemo(() => uniform(new THREE.Vector4(0, 0, 0, 1)), []);
    const uInvert = useMemo(() => uniform(0), []);
    const uTextGridCols = useMemo(() => uniform(10), []);
    const uTextGridRows = useMemo(() => uniform(20), []);
    const uTextBlendAmount = useMemo(() => uniform(1.0), []);
    const uTextCircleRadius = useMemo(() => uniform(0.16), []);
    const uTextRatio = useMemo(() => uniform(1.0), []);
    const uTopMargin = useMemo(() => uniform(0.0), []);

    // Cosine palette uniforms
    const uPaletteA = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
    const uPaletteB = useMemo(() => uniform(new THREE.Vector3(0.5, 0.5, 0.5)), []);
    const uPaletteC = useMemo(() => uniform(new THREE.Vector3(1.0, 1.0, 1.0)), []);
    const uPaletteD = useMemo(() => uniform(new THREE.Vector3(0.263, 0.416, 0.557)), []);
    const uColorMode = useMemo(() => uniform(0), []); // 0 = Flat, 1 = Palette

    // Text Texture
    const [textTexture] = useState(() => new THREE.CanvasTexture(document.createElement('canvas')));

    useEffect(() => {
        const canvas = textTexture.image;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Fixed canvas size — resizing would crash the WebGPU texture
        const size = 1024;
        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size, size);
        if (text) {
            // Pre-distort the glyph horizontally so it appears undistorted
            // when mapped onto the non-square export canvas.
            // aspect = W/H: portrait (<1) means we scale x up so it gets
            // squished back to correct proportions by the canvas mapping.
            const aspect = exportWidth / exportHeight;
            ctx.save();
            ctx.scale(1 / aspect, 1);
            ctx.fillStyle = 'white';
            const selectedFont = fontMap[fontFamily as keyof typeof fontMap];
            ctx.font = `${fontSize}px ${selectedFont.style.fontFamily}, monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, size * textX * aspect, size * (1 - textY));
            ctx.restore();
        }
        textTexture.needsUpdate = true;
    }, [text, textX, textY, fontSize, fontFamily, textTexture, exportWidth, exportHeight]);


    const handleExport = useCallback(() => {
        const { width: targetWidth, height: targetHeight, transparent: isTransparent } = exportSettingsRef.current;
        const cam = camera as THREE.PerspectiveCamera;
        const mesh = meshRef.current;

        if (!mesh || !cam.isPerspectiveCamera) return;

        const originalSize = new THREE.Vector2();
        gl.getSize(originalSize);
        const originalPixelRatio = gl.getPixelRatio();

        // Save original state
        const originalRatio = uRatio.value;
        const originalBackground = scene.background;
        const originalAspect = cam.aspect;
        const originalScale = mesh.scale.clone();

        // Configure for export
        gl.setSize(targetWidth, targetHeight, false);
        gl.setPixelRatio(1);

        // Update Camera Aspect Ratio
        cam.aspect = targetWidth / targetHeight;
        cam.updateProjectionMatrix();

        // Scale Mesh to fill the new view
        const z = (props.position?.[2] ?? (Array.isArray(props.position) ? props.position[2] : 0)) || 0;
        const distance = Math.abs(cam.position.z - z);
        const fov = (cam.fov * Math.PI) / 180;
        const visibleHeight = 2 * Math.tan(fov / 2) * distance;
        const visibleWidth = visibleHeight * cam.aspect;

        mesh.scale.set(visibleWidth / renderWidth, visibleHeight / renderHeight, 1);

        // Update uRatio for export dimensions
        // We use the uniform values which are updated in useFrame
        const currentCols = uCols.value;
        const currentRows = uRows.value;

        const cellWidth = targetWidth / currentCols;
        const cellHeight = (targetHeight * (1 - uTopMargin.value)) / currentRows;
        uRatio.value = cellWidth / cellHeight;

        if (isTransparent) {
            scene.background = null; // Remove scene background
            gl.setClearColor(0x000000, 0); // Clear to transparent
        }

        // Render
        gl.render(scene, camera);

        // Save
        const dataUrl = gl.domElement.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = 'rise-shirt-high-res.png';
        link.href = dataUrl;
        link.click();

        // Restore
        gl.setSize(originalSize.x, originalSize.y, false);
        gl.setPixelRatio(originalPixelRatio);
        scene.background = originalBackground;
        uRatio.value = originalRatio;

        cam.aspect = originalAspect;
        cam.updateProjectionMatrix();

        mesh.scale.copy(originalScale);

        // Restore clear color if it was changed? usually scene background handles it, or autoClearColor.
        if (isTransparent) {
            // We don't know original clear color/alpha easily, but if scene.background is restored, it overrides.
            // If scene.background is null originally, we might have issue. 
            // But ShaderCanvas sets it.
            // Just in case, reset clear alpha to 1 (default) or whatever.
            gl.setClearColor(0x000000, 0); // Assuming standard, but scene background will cover it.
        }

        // Re-render
        gl.render(scene, camera);
    }, [gl, scene, camera, uRatio, uCols, uRows, uTopMargin, props.position, renderWidth, renderHeight]);


    // Register export button (separate control)
    useControls('Rise Shirt', {
        'Export for Print': button(handleExport),
        'Copy Settings': button(() => {
            const settings = {
                rows, cols, minRadius, maxRadius, color, backgroundColor,
                exportWidth, exportHeight, transparent, preview, invert, topMargin,
                text, textGridCols, textGridRows, textX, textY, fontSize,
                textBlendAmount, textCircleRadius, textColor, textBgColor, fontFamily
            };
            navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
        })
    }, [handleExport, rows, cols, minRadius, maxRadius, color, backgroundColor,
        exportWidth, exportHeight, transparent, preview, invert, topMargin,
        text, textGridCols, textGridRows, textX, textY, fontSize,
        textBlendAmount, textCircleRadius, textColor, textBgColor, fontFamily]);


    // Update uniforms
    useFrame(() => {
        uRows.value = rows;
        uCols.value = cols;
        uMinRadius.value = minRadius;
        uMaxRadius.value = maxRadius;

        const c = new THREE.Color(color);
        uColorVec4.value.set(c.r, c.g, c.b, 1);

        const bg = new THREE.Color(backgroundColor);

        // Use the 'transparent' variable from useControls (or props if passed)
        const isTransparent = transparent || (props as any).transparent || false;

        uBgColorVec4.value.set(bg.r, bg.g, bg.b, isTransparent ? 0 : 1);

        // Physical dimensions of the viewport (or preview)
        const w = renderWidth;
        const h = renderHeight;

        // Physical dimensions of a single cell — height accounts for the design area
        // being compressed by topMargin, keeping dots circular
        const cellWidth = w / cols;
        const cellHeight = (h * (1 - topMargin)) / rows;

        uRatio.value = cellWidth / cellHeight;
        uInvert.value = invert ? 1 : 0;
        uTopMargin.value = topMargin;
        uTextGridCols.value = textGridCols;
        uTextGridRows.value = textGridRows;
        uTextBlendAmount.value = textBlendAmount;
        uTextCircleRadius.value = textCircleRadius;
        uTextRatio.value = (w / textGridCols) / (h / textGridRows);
        const tc = new THREE.Color(textColor);
        uTextColorVec4.value.set(tc.r, tc.g, tc.b, 1);
        const tbc = new THREE.Color(textBgColor);
        uTextBgColorVec4.value.set(tbc.r, tbc.g, tbc.b, textBgTransparent ? 0 : 1);
        uColorMode.value = colorMode === 'Palette' ? 1 : 0;
    });

    const main = Fn(() => {
        const currentUv = uv();

        // Margin threshold: y values above this are empty space
        const marginThreshold = float(1).sub(uTopMargin);

        // 1 = in top margin (show background), 0 = in design area
        const inMargin = step(marginThreshold, currentUv.y);

        // Remap Y so the full gradient spans only the design area [0, marginThreshold].
        // When topMargin=0 this is a no-op. When topMargin=0.3, [0, 0.7] → [0, 1].
        const remappedY = currentUv.y.div(marginThreshold.max(float(0.001))).min(float(1));

        // Grid configuration — uses remapped Y so dots shift down with the margin
        const gridDims = vec2(uCols, uRows);
        const gridUv = vec2(currentUv.x, remappedY).mul(gridDims);
        const localUv = fract(gridUv).sub(0.5);
        const correctedUv = vec2(localUv.x.mul(uRatio), localUv.y);
        const dist = length(correctedUv);

        const effectiveMaxRadius = uMaxRadius.mul(uRatio);

        // Drive gradient with remapped Y so full range is always visible
        const mixFactor = mix(remappedY, float(1).sub(remappedY), uInvert);
        const radius = mix(effectiveMaxRadius, uMinRadius, mixFactor);

        const smoothing = float(0.005);
        const mainMask = smoothstep(radius, radius.sub(smoothing), dist);

        // Dot color: flat or cosine palette driven by the gradient position
        const paletteColor = vec4((cosinePalette as any)(mixFactor, uPaletteA, uPaletteB, uPaletteC, uPaletteD), 1.0);
        const dotColor = select(uColorMode.greaterThan(float(0.5)), paletteColor, uColorVec4);
        const mainColor = mix(uBgColorVec4, dotColor, mainMask);

        // Text grid in margin area
        const textGridDims = vec2(uTextGridCols, uTextGridRows);
        const textGridUv = vec2(currentUv.x, currentUv.y).mul(textGridDims);
        const textLocalUv = fract(textGridUv).sub(0.5);
        const textCorrectedUv = vec2(textLocalUv.x.mul(uTextRatio), textLocalUv.y);
        const textDist = length(textCorrectedUv);
        const textCellIndex = floor(textGridUv);
        const textCenterUv = (textCellIndex.add(0.5)).div(textGridDims);
        const textSample = texture(textTexture, textCenterUv).r;
        const circleMask = smoothstep(uTextCircleRadius, uTextCircleRadius.sub(smoothing), textDist);
        const textMask = circleMask.mul(textSample).mul(uTextBlendAmount);
        const textMixFactor = mix(textCenterUv.y, float(1).sub(textCenterUv.y), uInvert);
        const textPaletteColor = vec4((cosinePalette as any)(textMixFactor, uPaletteA, uPaletteB, uPaletteC, uPaletteD), 1.0);
        const textDotColor = select(uColorMode.greaterThan(float(0.5)), textPaletteColor, uTextColorVec4);
        const marginColor = mix(uTextBgColorVec4, textDotColor, textMask);

        // Margin shows text, design area shows dots
        return mix(mainColor, marginColor, inMargin);
    });

    const material = useMemo(() => {
        const mat = new MeshBasicNodeMaterial();
        mat.colorNode = main();
        mat.transparent = true;
        return mat;
    }, []); // built once — all color logic driven by uniforms updated in useFrame

    return (
        <group>
            {/* 
                For export transparency to work, we need the renderer to clear with alpha 0.
                Since ShaderCanvas likely sets a background, we might need to hide it during export
                if 'transparent' is selected. 
                But the shader itself is drawing a quad over the whole screen.
                If shader outputs alpha 0, and renderer has alpha enabled (default usually),
                and clearColor is alpha 0, then we get transparency.
                However, if ShaderCanvas has <color attach="background" />, that is a scene background.
                It will be drawn behind our transparent shader.
                So in handleExport, we must temporarily remove the scene background.
            */}
            <mesh ref={meshRef}>
                <planeGeometry args={[renderWidth, renderHeight]} />
                <primitive object={material} attach="material" />
            </mesh>
            {/* Removed UI button */}
        </group>
    );
}
