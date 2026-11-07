import type { Particles } from './state';

export interface Renderer {
  /** Draw every particle; (sx, sy) is the scroll offset, (w, h) the canvas size in CSS px. */
  draw(P: Particles, sx: number, sy: number, w: number, h: number): void;
  /** Re-create GPU resources after a lost context is restored. */
  restore(): void;
}

const INK: [number, number, number] = [11 / 255, 37 / 255, 69 / 255];

const VS = `attribute vec2 p; attribute vec4 c; uniform vec2 off, res; uniform float sz; varying vec4 vc;
void main(){ vec2 q = (p - off) / res * 2.0 - 1.0; gl_Position = vec4(q.x, -q.y, 0.0, 1.0); gl_PointSize = sz * (0.75 + 0.6 * c.a); vc = c; }`;
const FS = `precision mediump float; varying vec4 vc;
void main(){ float d = length(gl_PointCoord - 0.5); float a = (1.0 - smoothstep(0.1, 0.5, d)) * vc.a; gl_FragColor = vec4(vc.rgb * a, a); }`;

/** Additive round points, one draw call; positions and colours re-uploaded each frame. */
export class WebGLRenderer implements Renderer {
  private pos: Float32Array;
  private col: Uint8Array;
  private uOff: WebGLUniformLocation | null = null;
  private uRes: WebGLUniformLocation | null = null;
  private uSz: WebGLUniformLocation | null = null;
  private pb: WebGLBuffer | null = null;
  private cbuf: WebGLBuffer | null = null;

  constructor(private gl: WebGLRenderingContext, n: number, private dpr: number, private pointSize: number) {
    this.pos = new Float32Array(n * 2);
    this.col = new Uint8Array(n * 4);
    this.restore();
  }

  restore() {
    const gl = this.gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    this.pb = gl.createBuffer();
    this.cbuf = gl.createBuffer();
    const lp = gl.getAttribLocation(prog, 'p'), lc = gl.getAttribLocation(prog, 'c');
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pb);
    gl.bufferData(gl.ARRAY_BUFFER, this.pos.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(lp);
    gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cbuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.col.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(lc);
    gl.vertexAttribPointer(lc, 4, gl.UNSIGNED_BYTE, true, 0, 0);
    this.uOff = gl.getUniformLocation(prog, 'off');
    this.uRes = gl.getUniformLocation(prog, 'res');
    this.uSz = gl.getUniformLocation(prog, 'sz');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.clearColor(INK[0], INK[1], INK[2], 1);
  }

  draw(P: Particles, sx: number, sy: number, w: number, h: number) {
    const gl = this.gl, pos = this.pos, col = this.col, n = P.n;
    for (let i = 0, j = 0; i < n; i++, j += 4) {
      pos[2 * i] = P.px[i]; pos[2 * i + 1] = P.py[i];
      col[j] = P.cr[i] * 255; col[j + 1] = P.cg[i] * 255; col[j + 2] = P.cb[i] * 255; col[j + 3] = Math.min(1, P.al[i]) * 255;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.uOff, sx, sy);
    gl.uniform2f(this.uRes, w, h);
    gl.uniform1f(this.uSz, this.pointSize * this.dpr);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pb);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, pos);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.cbuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, col);
    gl.drawArrays(gl.POINTS, 0, n);
  }
}

/** Fallback for browsers without WebGL: fewer particles, small additive squares. */
export class Canvas2DRenderer implements Renderer {
  constructor(private c2d: CanvasRenderingContext2D, private dpr: number) {}
  restore() {}
  draw(P: Particles, sx: number, sy: number, w: number, h: number) {
    const c = this.c2d, n = P.n;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.globalCompositeOperation = 'source-over';
    c.globalAlpha = 1;
    c.fillStyle = '#0b2545';
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < n; i++) {
      const a = P.al[i];
      if (a < 0.02) continue;
      const x = P.px[i] - sx, y = P.py[i] - sy;
      if (x < -2 || y < -2 || x > w + 2 || y > h + 2) continue;
      c.globalAlpha = Math.min(1, a);
      c.fillStyle = `rgb(${(P.cr[i] * 255) | 0},${(P.cg[i] * 255) | 0},${(P.cb[i] * 255) | 0})`;
      c.fillRect(x - 1, y - 1, 2.2, 2.2);
    }
    c.globalAlpha = 1;
  }
}
