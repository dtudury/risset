
const model = {}

function setFromHash () {
  if (document.location.hash) {
    try {
      const hash = JSON.parse(unescape(document.location.hash.substring(1)))
      Object.assign(model, hash)
    } catch (err) {
      console.error(err)
    }
  }
}
setFromHash()

window.addEventListener('hashchange', setFromHash)

const canvas = document.querySelector('canvas')
const gl = canvas.getContext('webgl')
if (!gl) {
  console.error('no webgl?!')
}

function createProgram (vertexShader, fragmentShader) {
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  var success = gl.getProgramParameter(program, gl.LINK_STATUS)
  if (success) {
    return program
  }
  console.error(gl.getProgramInfoLog(program))
  gl.deleteProgram(program)
}

function createShader (type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }
  console.error(gl.getShaderInfoLog(shader))
  gl.deleteShader(shader)
}

const program = createProgram(
  createShader(gl.VERTEX_SHADER, `
    #define WAVES 10.0
    #define PI2 ${2 * Math.PI}
    precision lowp float;
    uniform vec2 resolution;
    uniform float time;
    attribute vec2 vertPosition;
    varying vec4 fragColor;
    void main() {
      float x = vertPosition.x - resolution.x * 0.5;
      float y = vertPosition.y - resolution.y * 0.5;
      float r = 0.0;
      float g = 0.0;
      float b = 0.0;
      for (float i = 0.0; i < WAVES; i++) {
        float j = mod(time * 4.0 + i, WAVES);

        float f = 0.2 * pow(0.85, j);
        float angle = mod(i + time / 3.0, PI2);
        float v = 2.4 * pow(0.97, i);
        float amp = 0.9 * pow(0.97, i);

        amp *= 0.5 - cos(PI2 * j / WAVES) * 0.5;

        r += amp * sin((time + 0.4) * v + f * (sin(angle) * x + cos(angle) * y));
        g += amp * sin((time + 0.8) * v + f * (sin(angle) * x + cos(angle) * y));
        b += amp * sin((time + 0.0) * v + f * (sin(angle) * x + cos(angle) * y));
      }

      // map colors
      r = sin(r) * 0.5 + 0.5;
      g = sin(g) * 0.5 + 0.5;
      b = sin(b) * 0.5 + 0.5;
      fragColor = vec4(
        10.0 + -15.0 * r + -5.0 * g + -5.0 * b,
        4.0 + 0.0 * r + -5.0 * g + 0.0 * b,
        9.0 + -5.0 * r + 0.0 * g + -5.0 * b,
        1.0
      );
      gl_Position = vec4(
        2.0 * vertPosition.x / resolution.x - 1.0,
        -2.0 * vertPosition.y / resolution.y + 1.0,
        0.0,
        1.0
      );
    }
  `),
  createShader(gl.FRAGMENT_SHADER, `
    precision lowp float;
    varying vec4 fragColor;
    void main() {
      gl_FragColor = fragColor;
    }
  `)
)
gl.useProgram(program)

let vertices

const triangleVertexBufferObject = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject)
const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition')
gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0)
gl.enableVertexAttribArray(positionAttribLocation)
const timeLocation = gl.getUniformLocation(program, 'time')
const resolutionLocation = gl.getUniformLocation(program, 'resolution')

function resizeCanvas () {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  const xStep = 5 // step size
  const yStep = xStep * Math.sqrt(3) / 2
  vertices = []
  for (let x = 0; x < canvas.width + xStep / 2; x += xStep) {
    for (let y = 0; y < canvas.height; y += yStep * 2) {
      vertices.push([
        x, y,
        x + xStep / 2, y + yStep,
        x - xStep / 2, y + yStep,
        x + xStep / 2, y + yStep,
        x - xStep / 2, y + yStep,
        x, y + yStep * 2,
        x, y,
        x + xStep, y,
        x + xStep / 2, y + yStep,
        x + xStep / 2, y + yStep,
        x + xStep, y + yStep * 2,
        x, y + yStep * 2
      ])
    }
  }
  vertices = vertices.flat()
  gl.viewport(0, 0, window.innerWidth, window.innerHeight)
  gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}
window.addEventListener('resize', resizeCanvas, false)
resizeCanvas()

function redraw (t) {
  const time = (t / 1000) % 0x10000
  gl.uniform1f(timeLocation, time)
  gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2)
  window.requestAnimationFrame(redraw)
}
redraw(0)
