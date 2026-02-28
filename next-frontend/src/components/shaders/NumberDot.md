# NumberDot — Open Problem: White Line at Cell Border in Shadow

## Symptom
A visible white (un-shadowed) line appears in the shadow where it crosses from the
origin cell into an adjacent cell. The line runs along the cell boundary.

## Most Likely Cause
Floating-point precision at exact integer values in `floor(p2D)`.

When the marched 3D point `p3D` has `p3D.x` or `p3D.y` landing exactly on (or
infinitesimally below) a cell boundary (integer value), `floor()` can flip between
the two adjacent cells. This causes the 3×3 neighborhood to be centered on the wrong
cell for one step, temporarily excluding the casting sphere and producing a gap in
shadow coverage → white seam.

This is a classic grid-SDF artifact in GLSL/TSL.

## Location in Code
`next-frontend/src/components/shaders/NumberDot.tsx` — inside the `Loop(64, ...)`:
```ts
const pCell = floor(vec2(p3D.x, p3D.y)); // ← precision issue near integer boundaries
```

## Candidate Fixes (not yet tried)

### Option A — Epsilon nudge
Add a small epsilon to `p2D` before `floor()` to avoid landing exactly on integer:
```ts
const pCell = floor(vec2(p3D.x, p3D.y).add(float(0.0001)));
```
Risk: shifts shadow by a tiny constant amount; may not fully cure all angles.

### Option B — Expand neighborhood to 4×4 or 5×5 near boundary
For cells near a boundary (fract close to 0 or 1), widen the check range.
More samples, more complex.

### Option C — Offset the 3×3 center to always straddle the boundary
Instead of centering the 3×3 on `floor(p2D)`, center it on `round(p2D)`.
```ts
const pCell = floor(vec2(p3D.x, p3D.y).add(0.5)); // = round()
```
This makes the neighborhood straddle the nearest boundary rather than the
lower-left corner, which may naturally cover the gap. Worth trying first.

### Option D — Dual check (both floor and ceil)
Check both `floor(p2D)` and `floor(p2D) + 1` neighborhoods and take the min SDF.
Guarantees no boundary gap but doubles texture samples per step.

## Preferred Next Step
Try **Option C** (center on `round()`) first — one-line change, low risk.
If artifact persists at some angles, fall back to Option D.

## Related Context
- Self-shadowing was previously fixed by skipping the origin cell only for dot pixels
  (`skipSelf = isOrigin.and(dotMask.greaterThan(float(0.5)))`)
- 3×3 neighborhood unrolled in JS (compile-time) → 9 texture samples + 9 sphere SDFs per step
- Step capped at `minSDF.clamp(0.02, 1.0)` to avoid skipping cells
- Sphere SDF: center at `(cellCenter.x, cellCenter.y, paramsNode.w)`, radius = `gridNode.z`
