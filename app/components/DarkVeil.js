"use client";

import { useEffect, useRef } from "react";

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uNoise;
uniform float uWarp;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p *= 2.02;
    amp *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  vec2 p = (uv - 0.5) * aspect;

  p.x += sin((p.y + uTime * 0.08) * 6.0) * 0.06 * uWarp;
  p.y += cos((p.x - uTime * 0.06) * 5.0) * 0.05 * uWarp;

  float veil = fbm(p * 2.4 + vec2(uTime * 0.045, -uTime * 0.035));
  float ribbon = sin((p.x * 3.2 + p.y * 1.4) + uTime * 0.28) * 0.5 + 0.5;
  float vignette = smoothstep(0.86, 0.08, length((uv - 0.5) * vec2(1.12, 0.9)));

  vec3 teal = vec3(0.10, 0.82, 0.88);
  vec3 amber = vec3(0.95, 0.50, 0.16);
  vec3 ink = vec3(0.015, 0.02, 0.025);
  vec3 color = mix(teal, amber, ribbon * 0.55 + veil * 0.25);
  color = mix(ink, color, smoothstep(0.35, 1.0, veil) * vignette);

  float grain = (hash(gl_FragCoord.xy + uTime) - 0.5) * uNoise;
  color += grain;

  float alpha = (0.22 + veil * 0.34 + ribbon * 0.12) * vignette;
  gl_FragColor = vec4(color, alpha);
}
`;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export default function DarkVeil({
  speed = 0.7,
  noiseIntensity = 0.035,
  warpAmount = 0.85,
  resolutionScale = 0.72,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return undefined;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
    });

    if (!gl) return undefined;

    const program = createProgram(gl);
    if (!program) return undefined;

    const buffer = gl.createBuffer();
    const positions = new Float32Array([-1, -1, 3, -1, -1, 3]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");
    const noiseLocation = gl.getUniformLocation(program, "uNoise");
    const warpLocation = gl.getUniformLocation(program, "uWarp");

    let frameId = 0;
    let width = 0;
    let height = 0;
    const start = performance.now();

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.max(1, Math.floor(width * dpr * resolutionScale));
      canvas.height = Math.max(1, Math.floor(height * dpr * resolutionScale));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      const elapsed = ((performance.now() - start) / 1000) * speed;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, width, height);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(noiseLocation, noiseIntensity);
      gl.uniform1f(warpLocation, warpAmount);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frameId = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
  }, [speed, noiseIntensity, warpAmount, resolutionScale]);

  return <canvas ref={canvasRef} className="darkveil-canvas" aria-hidden="true" />;
}
