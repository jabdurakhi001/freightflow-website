import * as THREE from 'three';
import { env, FOG_PARS } from './sky';
import { ROAD } from './road';

const Z_NEAR = 160, Z_FAR = -760, Z_SPAN = Z_NEAR - Z_FAR;
const wrapZ = (z: number) => ((((z - Z_FAR) % Z_SPAN) + Z_SPAN) % Z_SPAN) + Z_FAR;

/** Soft additive light points (lamps, traffic, beacons): one draw call for all of them. */
function createGlows(max: number) {
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), size = new Float32Array(max);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { ...env, uScale: { value: 600 } },
    vertexShader: /* glsl */ `
      attribute float size; attribute vec3 color; varying vec3 vC; varying float vFog; uniform float uScale;
      ${FOG_PARS}
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float d = -mv.z;
        vFog = 1.0 - fogAmt(d * 0.55);
        vC = color;
        gl_PointSize = clamp(size * uScale / max(d, 1.0), 1.5, 220.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vC; varying float vFog;
      void main() {
        float r = length(gl_PointCoord - 0.5) * 2.0;
        float a = pow(max(1.0 - r, 0.0), 2.6) + pow(max(1.0 - r * 3.5, 0.0), 2.0) * 1.5;
        gl_FragColor = vec4(vC * a * vFog, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  let n = 0;
  return {
    points, mat,
    begin() { n = 0; },
    add(x: number, y: number, z: number, r: number, g: number, b: number, s: number) {
      if (n >= max) return;
      pos[n * 3] = x; pos[n * 3 + 1] = y; pos[n * 3 + 2] = z;
      col[n * 3] = r; col[n * 3 + 1] = g; col[n * 3 + 2] = b; size[n] = s; n++;
    },
    end() {
      geo.setDrawRange(0, n);
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; geo.attributes.size.needsUpdate = true;
    },
  };
}

/** Chicago, far behind the truck: lit towers that never get closer. */
function createSkyline() {
  const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
  const N = 74;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  geo.translate(0, 0.5, 0);
  const uniforms = { ...env, uShow: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true,
    vertexShader: /* glsl */ `
      varying vec3 vL; varying vec3 vS; varying float vSeed; varying vec3 vN;
      void main() {
        vL = position; vN = normal;
        vS = vec3(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz), length(instanceMatrix[2].xyz));
        vSeed = fract(instanceMatrix[3].x * 0.137 + instanceMatrix[3].z * 0.071);
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vL; varying vec3 vS; varying float vSeed; varying vec3 vN;
      uniform float uShow, uDay, uTime; uniform vec3 uFogColor;
      float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      void main() {
        float u = (abs(vN.x) > 0.5 ? vL.z : vL.x) + 0.5;
        vec2 cell = vec2(u * vS.x / 5.0, vL.y * vS.y / 4.2);
        vec2 id = floor(cell), f = fract(cell);
        float lit = step(0.8, hash21(id + vSeed * 91.0)) * step(0.18, f.x) * step(f.x, 0.82) * step(0.25, f.y) * step(f.y, 0.75);
        lit *= step(abs(vN.y), 0.5);
        vec3 body = mix(vec3(0.03, 0.06, 0.12), vec3(0.05, 0.1, 0.19), vL.y);
        vec3 win = mix(vec3(1.0, 0.78, 0.5), vec3(0.75, 0.86, 1.0), step(0.7, hash21(id * 1.7 + vSeed)));
        vec3 col = body + win * lit * (0.5 - 0.35 * uDay);
        col = mix(col, uFogColor, 0.42 + 0.2 * (1.0 - vL.y));
        gl_FragColor = vec4(col, uShow);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  const m = new THREE.Matrix4();
  const beacons: [number, number, number][] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const x = -470 + t * 880 + (rnd() - 0.5) * 20;
    const core = Math.exp(-Math.pow((x + 30) / 190, 2));
    let h = 26 + rnd() * 60 + core * (70 + rnd() * 150);
    let w = 20 + rnd() * 26, d = 20 + rnd() * 20;
    if (i === 30) { h = 330; w = 34; } // one tall shouldered tower
    if (i === 41) { h = 285; w = 24; }
    const z = 640 + rnd() * 130;
    m.makeScale(w, h, d).setPosition(x, -4, z);
    mesh.setMatrixAt(i, m);
    if (h > 190) beacons.push([x, h + 2, z]);
  }
  mesh.frustumCulled = false;
  mesh.renderOrder = -5;
  return { mesh, uniforms, beacons };
}

/** Distant ridgelines: flat silhouettes that read against the dawn. */
function createRidges() {
  const group = new THREE.Group();
  const uniforms = { ...env };
  const make = (radius: number, amp: number, seed: number, tone: number) => {
    const SEG = 260, pos: number[] = [], shade: number[] = [];
    const h = (a: number) => (Math.sin(a * 7 + seed) * 0.5 + Math.sin(a * 17 + seed * 2.3) * 0.28 + Math.sin(a * 41 + seed * 5.1) * 0.12 + Math.sin(a * 97 + seed) * 0.05 + 0.75) * amp;
    for (let i = 0; i < SEG; i++) {
      const a0 = (i / SEG) * Math.PI * 2, a1 = ((i + 1) / SEG) * Math.PI * 2;
      const x0 = Math.sin(a0) * radius, z0 = -Math.cos(a0) * radius, x1 = Math.sin(a1) * radius, z1 = -Math.cos(a1) * radius;
      // lower toward +Z so the skyline stands clear
      const k0 = 0.3 + 0.7 * Math.pow(Math.abs(Math.cos(a0 / 2)), 1.5), k1 = 0.3 + 0.7 * Math.pow(Math.abs(Math.cos(a1 / 2)), 1.5);
      const y0 = h(a0) * k0, y1 = h(a1) * k1;
      pos.push(x0, -30, z0, x1, -30, z1, x1, y1, z1, x0, -30, z0, x1, y1, z1, x0, y0, z0);
      shade.push(0, 0, 1, 0, 1, 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('shade', new THREE.Float32BufferAttribute(shade, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...uniforms, uTone: { value: tone } }, side: THREE.DoubleSide, depthWrite: false,
      vertexShader: /* glsl */ `attribute float shade; varying float vS; varying vec3 vD;
        void main() { vS = shade; vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: /* glsl */ `varying float vS; varying vec3 vD; uniform float uDay, uTone; uniform vec3 uSunDir;
        void main() {
          float toward = pow(max(dot(normalize(vD.xz), normalize(uSunDir.xz)), 0.0), 2.0);
          vec3 night = vec3(0.022, 0.05, 0.105) * uTone;
          vec3 dawn = mix(vec3(0.10, 0.12, 0.26), vec3(0.34, 0.18, 0.26), toward) * uTone;
          vec3 col = mix(night, dawn, uDay);
          gl_FragColor = vec4(col * (0.75 + 0.25 * vS), 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -8;
    group.add(mesh);
  };
  make(3200, 210, 1.3, 1.25);
  make(2300, 120, 4.1, 0.85);
  return group;
}

/** Air rushing past: short streaks that stretch with speed. */
function createStreaks(count: number) {
  const pos = new Float32Array(count * 6), end = new Float32Array(count * 2), seed = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = -34 + Math.random() * 60, y = 0.3 + Math.pow(Math.random(), 1.8) * 6, z = Math.random();
    pos.set([x, y, z, x, y, z], i * 6);
    end.set([0, 1], i * 2);
    const s = Math.random(); seed.set([s, s], i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('end', new THREE.BufferAttribute(end, 1));
  geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
  const uniforms = { ...env, uOffset: { value: 0 }, uStretch: { value: 1 }, uAlpha: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute float end, seed; uniform float uOffset, uStretch; varying float vA;
      void main() {
        vec3 p = position;
        float z = mod(p.z * 130.0 + uOffset * (0.75 + seed * 0.5), 130.0) - 95.0;
        p.z = z - end * uStretch * (0.6 + seed);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vA = (1.0 - end) * smoothstep(120.0, 20.0, -mv.z) * smoothstep(1.0, 6.0, -mv.z) * (0.35 + seed * 0.65);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `varying float vA; uniform float uAlpha, uDay;
      void main() { gl_FragColor = vec4(mix(vec3(0.6, 0.75, 1.0), vec3(1.0, 0.8, 0.6), uDay) * vA * uAlpha * 0.16, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const lines = new THREE.LineSegments(geo, mat);
  lines.frustumCulled = false;
  return { lines, uniforms };
}

interface Car { x: number; z: number; v: number; dir: 1 | -1; len: number; h: number }

export function createScenery(low: boolean) {
  const group = new THREE.Group();
  const glows = createGlows(260);
  const skyline = createSkyline();
  const ridges = createRidges();
  const streaks = createStreaks(low ? 260 : 620);
  group.add(ridges, skyline.mesh, streaks.lines);

  const dark = new THREE.MeshStandardMaterial({ color: 0x0c1420, roughness: 0.7, metalness: 0.4 });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), s3 = new THREE.Vector3(), p3 = new THREE.Vector3();

  // delineator posts
  const POST_STEP = 30, POSTS = Math.floor(Z_SPAN / POST_STEP);
  const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 1.15, 0.04).translate(0, 0.575, 0), dark, POSTS * 2);
  posts.frustumCulled = false;
  group.add(posts);

  // street lamps along the median
  const LAMP_STEP = 80, LAMPS = Math.floor(Z_SPAN / LAMP_STEP);
  const poleGeo = new THREE.CylinderGeometry(0.09, 0.14, 10.5, 6).translate(0, 5.25, 0);
  const armGeo = new THREE.BoxGeometry(5.2, 0.12, 0.14).translate(0, 10.4, 0);
  const poles = new THREE.InstancedMesh(poleGeo, dark, LAMPS);
  const arms = new THREE.InstancedMesh(armGeo, dark, LAMPS);
  poles.frustumCulled = arms.frustumCulled = false;
  group.add(poles, arms);

  // traffic
  const cars: Car[] = [];
  const oncoming = low ? 5 : 8;
  for (let i = 0; i < oncoming; i++) {
    const truck = i % 3 === 2;
    cars.push({ x: i % 2 ? -13.5 : -17.1, z: Z_FAR + (i + Math.random() * 0.6) * (Z_SPAN / oncoming), v: 27 + Math.random() * 5, dir: 1, len: truck ? 17 : 4.6, h: truck ? 3.9 : 1.45 });
  }
  cars.push({ x: -3.7, z: -150, v: 28.5, dir: -1, len: 4.6, h: 1.45 }, { x: -3.7, z: 120, v: 23.5, dir: -1, len: 4.8, h: 1.6 });
  const carMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), dark, cars.length);
  carMesh.frustumCulled = false;
  group.add(carMesh);
  group.add(glows.points);

  let lastOffset = 0;
  const update = (offset: number, dt: number, truckSpeed: number, day: number, time: number, show: { road: number; skyline: number; streak: number }) => {
    const night = 1 - THREE.MathUtils.smoothstep(day, 0.45, 0.9);
    const dOff = offset - lastOffset; lastOffset = offset;
    glows.begin();
    let pi = 0;
    for (let i = 0; i < POSTS; i++) {
      const z = wrapZ(i * POST_STEP + offset);
      m4.makeTranslation(ROAD.right - 0.5, 0, z); posts.setMatrixAt(pi++, m4);
      m4.makeTranslation(ROAD.medianA - 0.35, 0, z + 15); posts.setMatrixAt(pi++, m4);
      const near = z > -260 && z < 60;
      if (near) {
        glows.add(ROAD.right - 0.5, 1.05, z, 0.5, 0.52, 0.55, 0.12);
        glows.add(ROAD.medianA - 0.35, 1.05, z + 15, 0.6, 0.38, 0.1, 0.12);
      }
    }
    posts.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < LAMPS; i++) {
      const z = wrapZ(i * LAMP_STEP + offset);
      m4.makeTranslation(-9, 0, z); poles.setMatrixAt(i, m4);
      m4.makeTranslation(-8.4, 0, z); arms.setMatrixAt(i, m4);
      const k = 1.5 * night + 0.05;
      glows.add(-6.1, 10.2, z, 1.0 * k, 0.72 * k, 0.42 * k, 2.4);
      glows.add(-11.0, 10.2, z, 1.0 * k, 0.72 * k, 0.42 * k, 2.4);
    }
    poles.instanceMatrix.needsUpdate = arms.instanceMatrix.needsUpdate = true;
    cars.forEach((c, i) => {
      // oncoming traffic closes at its speed plus ours; same-direction traffic drifts by the difference
      c.z += c.dir === 1 ? c.v * dt + dOff : dOff - c.v * dt;
      c.z = wrapZ(c.z);
      p3.set(c.x, 0.25, c.z); s3.set(c.len > 10 ? 2.5 : 1.85, c.h, c.len);
      m4.compose(p3, q, s3); carMesh.setMatrixAt(i, m4);
      const front = c.z + (c.dir * c.len) / 2, rear = c.z - (c.dir * c.len) / 2;
      const hl = 2.0 * (0.45 + 0.55 * night);
      glows.add(c.x - 0.7, 0.85, front, hl, hl * 0.95, hl * 0.85, 1.5);
      glows.add(c.x + 0.7, 0.85, front, hl, hl * 0.95, hl * 0.85, 1.5);
      glows.add(c.x - 0.72, 0.95, rear, 1.6, 0.06, 0.03, 0.9);
      glows.add(c.x + 0.72, 0.95, rear, 1.6, 0.06, 0.03, 0.9);
    });
    carMesh.instanceMatrix.needsUpdate = true;
    if (show.skyline > 0.02) {
      const blink = 0.5 + 0.5 * Math.sin(time * 2.2);
      skyline.beacons.forEach(([x, y, z]) => glows.add(x, y, z, 2.2 * blink * show.skyline, 0.1, 0.06, 10));
    }
    glows.end();
    skyline.uniforms.uShow.value = show.skyline;
    skyline.mesh.visible = show.skyline > 0.01;
    streaks.uniforms.uOffset.value = offset;
    streaks.uniforms.uStretch.value = THREE.MathUtils.clamp(Math.abs(truckSpeed) * 0.09, 0.15, 5);
    streaks.uniforms.uAlpha.value = show.streak;
  };
  const resize = (h: number, fov: number) => { glows.mat.uniforms.uScale.value = h / (2 * Math.tan((fov * Math.PI) / 360)); };
  return { group, update, resize, dark };
}
