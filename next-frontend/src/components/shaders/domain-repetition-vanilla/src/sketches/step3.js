import { sdBox2d, sdSphere } from '@/tsl/utils/sdf/shapes'
import { Fn, screenSize, vec3, time, step, sin, fract, mod, round, mix, abs, pow, div, add, mul } from 'three/tsl'
import { screenAspectUV } from '@/tsl/utils/function/screen_aspect_uv'
import { cosinePalette } from '@/tsl/utils/color/cosine_palette'
import WebGPUSketch from '@/components/sketch/webgpu_sketch.js'

const step3 = Fn(() => {
  const _uv = screenAspectUV(screenSize).toVar()
  const uv0 = screenAspectUV(screenSize)

  const finalColor = vec3(0).toVar()

  // How many times to repeat the domain
  const domainRepetitions = 6

  // Get a new, unmodified set of coordinates and transform it to the range of 0 to 1
  const uvR = screenAspectUV(screenSize).toVar()
  uvR.addAssign(0.5)

  // We use mod here to get our repeating pattern that alternates between 0 and 1
  // The step function here to give us a hard edge between the iterations
  uvR.x = step(0.5, mod(uvR.x.mul(round(domainRepetitions / 2)), 1.0))

  // Add some vertical movement based on the value of uvR.x (either 0, or 1)
  const _time = time.mul(0.01)
  _uv.y.addAssign(mix(_time, _time.negate(), uvR.x))

  // Warp the uv space to create a repeating pattern - we do this by first multiplying the coordinate space by a number of repetitions, then applying a sine function to it. We subtract 0.5 here to get back into our range of -0.5 to 0.5.
  _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5))

  // Create a simple box, this will be repeated across the screen
  const pattern = sdBox2d(_uv).toVar()

  // Figure out a number of repetitions that will give an interesting repeating pattern
  const patternRepetitions = 8

  // This will give us a pattern that is essentially zoomed out, to rescale the space, divide it by the number of repetitions.
  pattern.assign(sin(pattern.mul(patternRepetitions).add(time)).div(patternRepetitions))

  // Take the absolute value of the pattern, this gives us more defined edges rather than use step, or smoothstep
  pattern.assign(abs(pattern))

  // pow(edge / pattern, exponent) will give us an interesting bloomed edge to our pattern (thanks @kishimisu)
  // Here we play around with the edge to give us a little bit of variability over time.
  // You can play around with the edge and exponent to get differing amounts of bloom
  pattern.assign(pow(div(add(0.03, sin(time).mul(0.005)), pattern), 1.3))

  // Add our procedural color palette to the pattern
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(2.0, 1.0, 0.0)
  const d = vec3(0.5, 0.2, 0.25)

  // Here we apply a time offset to the sphere that gives us a nice animated gradient effect
  const col = cosinePalette(sdSphere(uv0).add(mul(time, 0.2)), a, b, c, d)

  // Assign the pattern to the final color
  finalColor.assign(pattern.mul(col))

  return finalColor
})

const canvas = document.querySelector('#webgpu-canvas')
const sketch = new WebGPUSketch(canvas, step3())

export default sketch
