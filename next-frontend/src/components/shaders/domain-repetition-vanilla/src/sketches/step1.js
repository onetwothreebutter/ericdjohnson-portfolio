import { sdBox2d } from '@/tsl/utils/sdf/shapes'
import { Fn, screenSize, vec3, time, step, sin } from 'three/tsl'
import { screenAspectUV } from '@/tsl/utils/function/screen_aspect_uv'
import WebGPUSketch from '@/components/sketch/webgpu_sketch.js'

const step1 = Fn(() => {
  const _uv = screenAspectUV(screenSize).toVar()

  const finalColor = vec3(0).toVar()

  // Create a simple box, this will be repeated across the screen
  const pattern = sdBox2d(_uv).toVar()

  // Figure out a number of repetitions that will give an interesting repeating pattern
  const patternRepetitions = 8

  // This will give us a pattern that is essentially zoomed out, to rescale the space, divide it by the number of repetitions.
  pattern.assign(sin(pattern.mul(patternRepetitions).add(time)).div(patternRepetitions))

  // Step here will sharpen the edges
  pattern.assign(step(0.025, pattern))

  // Assign the pattern to the final color
  const col = vec3(1.0, 0.0, 1.0)

  // Assign the pattern to the final color
  finalColor.assign(pattern.mul(col))

  return finalColor
})

const canvas = document.querySelector('#webgpu-canvas')
const sketch = new WebGPUSketch(canvas, step1())

export default sketch
