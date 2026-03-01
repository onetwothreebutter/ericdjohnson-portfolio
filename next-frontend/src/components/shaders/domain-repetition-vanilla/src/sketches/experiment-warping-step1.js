import { sdBox2d, sdSphere, sdDiamond } from '@/tsl/utils/sdf/shapes'
import { Fn, screenSize, vec3, time, Loop, sin, fract, abs, pow, div, add, mul, rotate, mix } from 'three/tsl'
import { screenAspectUV } from '@/tsl/utils/function/screen_aspect_uv'
import { cosinePalette } from '@/tsl/utils/color/cosine_palette'
import WebGPUSketch from '@/components/sketch/webgpu_sketch.js'

const experimentWarpingStep1 = Fn(() => {
  // Note that we've zoomed out a bit to show more of the pattern in the sketch
  const _uv = screenAspectUV(screenSize).mul(2).toVar()
  const uv0 = screenAspectUV(screenSize)

  const finalColor = vec3(0).toVar()

  // Move our palette color declaration outside the loop
  const a = vec3(0.5, 0.5, 0.5)
  const b = vec3(0.5, 0.5, 0.5)
  const c = vec3(2.0, 1.0, 0.0)
  const d = vec3(0.5, 0.2, 0.25)

  // How many times to repeat the domain
  const domainRepetitions = 1.5

  // Figure out a number of repetitions that will give an interesting repeating pattern
  const patternRepetitions = 8

  // Here we can create a domain that rotates around the center of the screen (0,0, according to uv0)
  // Then we can use the mix function to blend between the original domain and the rotated one, giving us some extremely cool effects
  const uvR = rotate(uv0, time.mul(0.5))
  _uv.assign(mix(_uv, uvR, sdSphere(uv0)))

  // You can do multiple shapes if you like
  // _uv.assign(mix(_uv, uvR, sdDiamond(uv0)))

  const MAX_ITERATIONS = 2
  Loop({ start: 0, end: MAX_ITERATIONS }, ({ i }) => {
    // Warp the uv space to create a repeating pattern - we do this by first multiplying the coordinate space by a number of repetitions, then applying a sine function to it. We subtract 0.5 here to get back into our range of -0.5 to 0.5.
    _uv.assign(fract(_uv.mul(domainRepetitions)).sub(0.5))

    // Create a simple box, this will be repeated across the screen
    const pattern = sdBox2d(_uv).toVar()

    // This will give us a pattern that is essentially zoomed out, to rescale the space, divide it by the number of repetitions.
    pattern.assign(sin(pattern.mul(patternRepetitions).add(time)).div(patternRepetitions))

    // Take the absolute value of the pattern, this gives us more defined edges rather than use step, or smoothstep
    pattern.assign(abs(pattern))

    // pow(edge / pattern, exponent) will give us an interesting bloomed edge to our pattern (thanks @kishimisu)
    // Here we play around with the edge to give us a little bit of variability over time.
    // You can play around with the edge and exponent to get differing amounts of bloom
    pattern.assign(pow(div(add(0.02, sin(time).mul(0.005)), pattern), 1.5))

    // Here we apply a time offset to the sphere that gives us a nice animated gradient effect
    const col = cosinePalette(sdSphere(uv0).add(mul(time, 0.2)), a, b, c, d)

    // Because we have very small value ranges for pattern, we need to additively blend the pattern with the final color so that each loop contributes to the final color.
    finalColor.addAssign(pattern.mul(col))
  })

  return finalColor
})

const canvas = document.querySelector('#webgpu-canvas')
const sketch = new WebGPUSketch(canvas, experimentWarpingStep1())

export default sketch
