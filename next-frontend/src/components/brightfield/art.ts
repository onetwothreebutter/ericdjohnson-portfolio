/**
 * Canvas stand-ins for Brightfield artwork, used by the redesign case study.
 * These are 2D-canvas approximations so the page has no image dependencies;
 * swap in real exports whenever they're available.
 */

export interface SquareDanceOptions {
    /** Index into WIDTHS (0-6) */
    width: number;
    /** Index into GAPS (0-6) */
    gap: number;
    distress?: boolean;
    crosshatch?: boolean;
    halftone?: boolean;
    /** Shift the art up by this fraction of the canvas height (leaves room for a card label) */
    lift?: number;
}

export const STEP_COUNT = 7;

const COASTAL: Array<[number, string]> = [
    [0, "#d8432b"],
    [0.22, "#e07a3a"],
    [0.42, "#c9a570"],
    [0.6, "#3f9a8c"],
    [0.8, "#1f6b6c"],
    [1, "#123e45"],
];
const WIDTHS = [1, 1.6, 2.4, 3.4, 4.6, 6, 8];
const GAPS = [3.4, 4.4, 5.6, 7, 9, 11.5, 15];

/** Small seeded PRNG (mulberry32) so the textures are stable between redraws. */
function seeded(seed: number) {
    let s = seed;
    return () => {
        s |= 0;
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Match the canvas backing store to its CSS box and return a 2D context. */
export function fitCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
    }
    return canvas.getContext("2d");
}

/** "Square Dance": four stepped squares of vertical lines, coloured by x position. */
export function drawSquareDance(canvas: HTMLCanvasElement, o: SquareDanceOptions) {
    const ctx = fitCanvas(canvas);
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const extent = W * 0.84;
    const size = extent * 0.5;
    const step = extent / 6;
    const x0 = (W - extent) / 2;
    const y0 = (H - extent) / 2 - (o.lift ?? 0) * H;
    const k = W / 360;
    const lineWidth = Math.max(0.6, WIDTHS[o.width] * k * 0.9);
    const gap = GAPS[o.gap] * k;

    const gradient = ctx.createLinearGradient(x0, 0, x0 + extent, 0);
    COASTAL.forEach(([stop, color]) => gradient.addColorStop(stop, color));

    ctx.lineCap = o.halftone ? "round" : "butt";
    for (let i = 0; i < 4; i++) {
        const sx = x0 + i * step;
        const sy = y0 + i * step;
        ctx.fillStyle = "rgba(18,17,17,.5)";
        ctx.fillRect(sx, sy, size, size);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.setLineDash(o.halftone ? [0, Math.max(lineWidth * 1.9, gap * 0.8)] : []);
        ctx.beginPath();
        for (let lx = sx + lineWidth / 2; lx <= sx + size; lx += gap) {
            ctx.moveTo(lx, sy);
            ctx.lineTo(lx, sy + size);
        }
        if (o.crosshatch) {
            for (let ly = sy + lineWidth / 2; ly <= sy + size; ly += gap) {
                ctx.moveTo(sx, ly);
                ctx.lineTo(sx + size, ly);
            }
        }
        ctx.stroke();
    }
    ctx.setLineDash([]);

    if (o.distress) {
        const rand = seeded(7);
        ctx.fillStyle = "#121111";
        for (let n = 0; n < 900; n++) {
            const px = x0 + rand() * extent;
            const py = y0 + rand() * extent;
            const r = rand() * rand() * 9 * k + k * 0.6;
            ctx.beginPath();
            ctx.ellipse(px, py, r, r * (0.3 + rand() * 0.7), rand() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

/** Approximation of the orange shader render behind the redesigned hero. */
export function drawHeroShader(canvas: HTMLCanvasElement) {
    const ctx = fitCanvas(canvas);
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const u = W / 1440;
    const rand = seeded(3);

    ctx.fillStyle = "#170d0a";
    ctx.fillRect(0, 0, W, H);

    const left = 0.245 * W;
    const right = 0.76 * W;
    const band = ctx.createLinearGradient(left, 0, right, 0);
    band.addColorStop(0, "#c2431a");
    band.addColorStop(0.55, "#d9581c");
    band.addColorStop(1, "#e3741f");
    ctx.fillStyle = band;
    ctx.fillRect(left, 0, right - left, H);

    // Scanlines, plus the dark stepped wedge
    const strip = 6 * u;
    for (let y = 0; y < H; y += strip) {
        const t = y / H;
        ctx.fillStyle = `rgba(60,10,0,${0.05 + 0.1 * rand()})`;
        ctx.fillRect(left, y, right - left, strip * 0.5);
        if (t > 0.3 && t < 0.8) {
            const p = (t - 0.3) / 0.5;
            const alpha = Math.min(1, p * 5) * 0.9;
            const edge =
                (0.66 - 0.3 * Math.pow(p, 1.25)) * W +
                (Math.floor(y / strip) % 2 ? 16 * u : 0) +
                rand() * 10 * u;
            const start = left + (p > 0.72 ? (p - 0.72) * 1.6 * W * 0.3 : 0);
            if (edge > start) {
                ctx.fillStyle = `rgba(26,12,18,${alpha})`;
                ctx.fillRect(start, y, edge - start, strip);
            }
        }
    }

    // Glowing pixel grid on either side of the band
    const gridZone = (zx: number, zw: number, glow: (x: number, y: number) => number) => {
        const cell = 15 * u;
        for (let gy = 0; gy < H; gy += cell) {
            for (let gx = zx; gx < zx + zw; gx += cell) {
                const v = glow(gx / W, gy / H) * (0.75 + 0.25 * rand());
                const r = Math.round(40 + 215 * v);
                const g = Math.round(14 + 105 * v * v + 60 * v * v * v);
                const b = Math.round(8 + 20 * v);
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(gx + 1.5 * u, gy + 1.5 * u, cell - 3 * u, cell - 3 * u);
            }
        }
    };
    gridZone(0, left, (x, y) => Math.max(0, 1 - Math.abs(x - 0.17) / 0.1) * Math.max(0, 1 - Math.abs(y - 0.55) / 0.5) * 0.9);
    gridZone(right, W - right, (x, y) => 0.28 + 0.6 * Math.max(0, y - 0.45) * Math.max(0, 1.4 - (x - 0.76) * 3));

    const top = ctx.createLinearGradient(0, 0, 0, 199 * u);
    top.addColorStop(0, "#000");
    top.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = top;
    ctx.fillRect(0, 0, W, 199 * u);
}
