// Module-level mutable state for sharing Lenis scroll progress
// with imperative animation loops (e.g. R3F useFrame) without React re-renders.
export const scrollState = { progress: 0, scrollY: 0 };
