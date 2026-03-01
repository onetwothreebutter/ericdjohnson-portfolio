'use client';

import { MeshBasicNodeMaterial } from 'three/webgpu';
import { useThree, useFrame } from '@react-three/fiber';
import {
    Fn, vec2, uv, mix, length, fract, uniform, float, smoothstep, floor, texture
} from 'three/tsl';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useControls } from 'leva';
import {
    Bebas_Neue,
    Oswald,
    Anton,
    Fjalla_One,
    Yanone_Kaffeesatz,
    Pathway_Gothic_One,
    Alfa_Slab_One,
    Squada_One,
    Passion_One,
    Staatliches,
    Saira_Extra_Condensed
} from 'next/font/google';

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'] });
const oswald = Oswald({ weight: '700', subsets: ['latin'] });
const anton = Anton({ weight: '400', subsets: ['latin'] });
const fjallaOne = Fjalla_One({ weight: '400', subsets: ['latin'] });
const yanoneKaffeesatz = Yanone_Kaffeesatz({ weight: '700', subsets: ['latin'] });
const pathwayGothicOne = Pathway_Gothic_One({ weight: '400', subsets: ['latin'] });
const alfaSlabOne = Alfa_Slab_One({ weight: '400', subsets: ['latin'] });
const squadaOne = Squada_One({ weight: '400', subsets: ['latin'] });
const passionOne = Passion_One({ weight: '700', subsets: ['latin'] });
const staatliches = Staatliches({ weight: '400', subsets: ['latin'] });
const sairaExtraCondensed = Saira_Extra_Condensed({ weight: '700', subsets: ['latin'] });

const fontMap = {
    'Bebas Neue': bebasNeue,
    'Oswald': oswald,
    'Anton': anton,
    'Fjalla One': fjallaOne,
    'Yanone Kaffeesatz': yanoneKaffeesatz,
    'Pathway Gothic One': pathwayGothicOne,
    'Alfa Slab One': alfaSlabOne,
    'Squada One': squadaOne,
    'Passion One': passionOne,
    'Staatliches': staatliches,
    'Saira Extra Condensed': sairaExtraCondensed
};

export function RiseShirtText(props: any) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera, viewport } = useThree();

    // Leva controls - simplified for text grid only
    const { dotColumns, dotRows, textCircleRadius, color, backgroundColor, text, textX, textY, fontSize, fontFamily } = useControls('Rise Shirt Text', {
        dotColumns: { value: 10, min: 1, max: 200, step: 1, label: 'Dot Columns' },
        dotRows: { value: 20, min: 1, max: 100, step: 1, label: 'Dot Rows' },
        textCircleRadius: { value: 0.4, min: 0.01, max: 0.5, step: 0.01 },
        color: { value: '#000000' },
        backgroundColor: { value: '#ffffff' },
        text: { value: 'RISE' },
        textX: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
        textY: { value: 0.5, min: 0.0, max: 1.0, step: 0.01 },
        fontSize: { value: 300, min: 50, max: 800, step: 10 },
        fontFamily: {
            value: 'Bebas Neue',
            options: [
                'Bebas Neue',
                'Oswald',
                'Anton',
                'Fjalla One',
                'Yanone Kaffeesatz',
                'Pathway Gothic One',
                'Alfa Slab One',
                'Squada One',
                'Passion One',
                'Staatliches',
                'Saira Extra Condensed'
            ]
        }
    });

    // Use the controls directly as grid dimensions
    const textGridCols = dotColumns;
    const textGridRows = dotRows;

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

    // Uniforms
    const uRatio = useMemo(() => uniform(1), []);
    const uTextGridCols = useMemo(() => uniform(10), []);
    const uTextGridRows = useMemo(() => uniform(20), []);
    const uTextCircleRadius = useMemo(() => uniform(0.4), []);
    const uColorVec4 = useMemo(() => uniform(new THREE.Vector4(0, 0, 0, 1)), []);
    const uBgColorVec4 = useMemo(() => uniform(new THREE.Vector4(1, 1, 1, 1)), []);

    // Text Texture
    const [textTexture] = useState(() => new THREE.CanvasTexture(document.createElement('canvas')));

    // Update text texture
    useEffect(() => {
        const canvas = textTexture.image;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 1024;
        if (canvas.width !== size) {
            canvas.width = size;
            canvas.height = size;
        }

        // Background (black = no text)
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, size, size);

        if (text) {
            ctx.fillStyle = 'white';
            const selectedFont = fontMap[fontFamily as keyof typeof fontMap];
            ctx.font = `${fontSize}px ${selectedFont.style.fontFamily}, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // textX: 0.0 is left, 1.0 is right
            // textY: 1.0 is top, 0.0 is bottom (inverted for canvas)
            ctx.fillText(text, size * textX, size * (1 - textY));
        }

        textTexture.needsUpdate = true;
    }, [text, textX, textY, fontSize, fontFamily, textTexture]);

    // Update uniforms
    useFrame(() => {
        uTextGridCols.value = textGridCols;
        uTextGridRows.value = textGridRows;
        uTextCircleRadius.value = textCircleRadius;

        const c = new THREE.Color(color);
        uColorVec4.value.set(c.r, c.g, c.b, 1);

        const bg = new THREE.Color(backgroundColor);
        uBgColorVec4.value.set(bg.r, bg.g, bg.b, 1);

        // Calculate aspect ratio for grid cells
        const cellWidth = width / textGridCols;
        const cellHeight = height / textGridRows;
        uRatio.value = cellWidth / cellHeight;
    });

    const main = Fn(() => {
        // Standard UV coordinates (0 to 1)
        const vUv = uv();

        // Text Grid configuration
        const textGridDims = vec2(uTextGridCols, uTextGridRows);

        // Scale UVs to text grid space
        const textGridUv = vUv.mul(textGridDims);

        // Get local UV within the text grid cell
        const textLocalUv = fract(textGridUv).sub(0.5);

        // Correct for aspect ratio to ensure circular dots
        const textCorrectedUv = vec2(textLocalUv.x.mul(uRatio), textLocalUv.y);
        const textDist = length(textCorrectedUv);

        // Circle radius
        const circleRadius = uTextCircleRadius.mul(uRatio);

        // Sample text texture at center of current cell
        const textCellIndex = floor(textGridUv);
        const textCenterUv = (textCellIndex.add(0.5)).div(textGridDims);
        const textSample = texture(textTexture, textCenterUv).r;

        // Create the dot mask
        const smoothing = float(0.005);
        const circleMask = smoothstep(circleRadius, circleRadius.sub(smoothing), textDist);

        // Only show dots where text is present
        const mask = circleMask.mul(textSample);

        // Create colors
        // mask 1 = dot, mask 0 = background
        const color = mix(uBgColorVec4, uColorVec4, mask);

        return color;
    });

    const material = useMemo(() => new MeshBasicNodeMaterial(), []);
    material.colorNode = main();
    material.transparent = true;

    return (
        <group>
            <mesh ref={meshRef}>
                <planeGeometry args={[width, height]} />
                <primitive object={material} attach="material" />
            </mesh>
        </group>
    );
}
