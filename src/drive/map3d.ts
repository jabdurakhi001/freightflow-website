import * as THREE from 'three';
import { CITIES, HUB } from '../lib/lanes';
import { MAP_H, MAP_W, projectAlbers } from '../lib/projection';
import { env } from './sky';

/** Map pixels → metres. The hub sits on the world origin, right where the truck is. */
export const MAP_SCALE = 0.62;
const HUB_XY = projectAlbers(CITIES[HUB]);
export const mapToWorld = (p: readonly number[], y = 0) => new THREE.Vector3((p[0] - HUB_XY[0]) * MAP_SCALE, y, (p[1] - HUB_XY[1]) * MAP_SCALE);
export const cityToWorld = (name: string, y = 0) => mapToWorld(projectAlbers(CITIES[name]), y);

/** Illustrative lanes out of the hub for the platform chapter. */
const NETWORK = ['Dallas, TX', 'Atlanta, GA', 'New York, NY', 'Denver, CO', 'Los Angeles, CA', 'Seattle, WA', 'Miami, FL', 'Minneapolis, MN', 'Houston, TX', 'Phoenix, AZ', 'Boston, MA', 'Salt Lake City, UT', 'Charlotte, NC', 'Kansas City, MO', 'Memphis, TN', 'Oakland, CA'];

function parsePath(d: string): number[][] {
  const rings: number[][] = [];
  let cur: number[] = [];
  const re = /([MLZ])\s*(-?[\d.]+)?[ ,]*(-?[\d.]+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d))) {
    if (m[1] === 'M') { cur = [+m[2]!, +m[3]!]; rings.push(cur); }
    else if (m[1] === 'L') cur.push(+m[2]!, +m[3]!);
    else if (cur.length >= 2) cur.push(cur[0], cur[1]);
  }
  return rings;
}

const ARC_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const ARC_FRAG = /* glsl */ `
  varying vec2 vUv; uniform float uDraw, uTime, uAlpha, uPulse, uPhase;
  void main() {
    if (vUv.x > uDraw) discard;
    vec3 col = mix(vec3(1.0, 0.82, 0.62), vec3(1.0, 0.42, 0.11), vUv.x);
    float head = smoothstep(0.06, 0.0, abs(vUv.x - fract(uTime * uPulse + uPhase)));
    float lead = smoothstep(0.03, 0.0, uDraw - vUv.x) * step(uDraw, 0.999);
    gl_FragColor = vec4(col * (0.7 + head * 1.5 + lead * 2.0), uAlpha);
  }
`;

function arcCurve(a: THREE.Vector3, b: THREE.Vector3) {
  const d = a.distanceTo(b);
  const mid = a.clone().add(b).multiplyScalar(0.5);
  // bend left of travel like the flat map did, and lift off the map
  const side = new THREE.Vector3(b.z - a.z, 0, -(b.x - a.x)).normalize().multiplyScalar(Math.min(40, d * 0.12));
  mid.add(side); mid.y = Math.min(90, 8 + d * 0.22);
  return new THREE.QuadraticBezierCurve3(a, mid, b);
}

export function createMap(low: boolean) {
  const group = new THREE.Group();
  group.visible = false;
  // drawn over the road world while the camera lifts off, in the order added
  group.renderOrder = 20;
  const u = { uMix: { value: 0 }, uTime: env.uTime, uScale: { value: 600 } };

  // land as a field of dots with a slow ring spreading from the hub
  const dotsMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, uniforms: u,
    vertexShader: /* glsl */ `
      attribute float size; uniform float uMix, uTime, uScale; varying float vA;
      void main() {
        float r = length(position.xz);
        float ring = smoothstep(26.0, 0.0, abs(r - mod(uTime * 46.0, 620.0))) * smoothstep(620.0, 200.0, r);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vA = (0.34 + ring * 0.5 + size * 0.5) * uMix;
        gl_PointSize = max((1.5 + size * 4.2 + ring * 0.9) * uScale / -mv.z, 1.4);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `varying float vA;
      void main() { float r = length(gl_PointCoord - 0.5) * 2.0; if (r > 1.0) discard;
        gl_FragColor = vec4(vec3(0.72, 0.8, 0.92), vA * smoothstep(1.0, 0.55, r)); }`,
  });
  const dots = new THREE.Points(new THREE.BufferGeometry(), dotsMat);
  dots.frustumCulled = false;
  const outlineMat = new THREE.LineBasicMaterial({ color: 0x9fb3d1, transparent: true, opacity: 0, fog: false, depthWrite: false, depthTest: false });
  const outline = new THREE.LineSegments(new THREE.BufferGeometry(), outlineMat);
  outline.frustumCulled = false;
  group.add(dots, outline);

  // hub marker
  const hubMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.9, 1.6), transparent: true, opacity: 0, fog: false, depthWrite: false, depthTest: false });
  const hub = new THREE.Mesh(new THREE.RingGeometry(6, 8, 48).rotateX(-Math.PI / 2), hubMat);
  const hubDot = new THREE.Mesh(new THREE.CircleGeometry(3.2, 32).rotateX(-Math.PI / 2), hubMat);
  const pulseMat = hubMat.clone();
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 64).rotateX(-Math.PI / 2), pulseMat);
  hub.position.y = hubDot.position.y = pulse.position.y = 0.5;
  group.add(hub, hubDot, pulse);

  // the visitor's lane
  const laneMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, depthTest: false, fog: false,
    uniforms: { uDraw: { value: 0 }, uTime: env.uTime, uAlpha: { value: 0 }, uPulse: { value: 0.35 }, uPhase: { value: 0 } },
    vertexShader: ARC_VERT, fragmentShader: ARC_FRAG,
  });
  const lane = new THREE.Mesh(new THREE.BufferGeometry(), laneMat);
  lane.frustumCulled = false;
  const endMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 1.1, 0.3), transparent: true, opacity: 0, fog: false, depthWrite: false, depthTest: false });
  const endA = new THREE.Mesh(new THREE.CircleGeometry(4.6, 32).rotateX(-Math.PI / 2), endMat);
  const endB = new THREE.Mesh(new THREE.RingGeometry(4.4, 6.4, 40).rotateX(-Math.PI / 2), endMat);
  group.add(lane, endA, endB);
  const lanePts = { from: new THREE.Vector3(), to: new THREE.Vector3(), has: false, hasTo: false };
  let laneCurve: THREE.QuadraticBezierCurve3 | null = null;
  let drawT = 0;

  // network lanes
  const net = new THREE.Group();
  const netMats: THREE.ShaderMaterial[] = [];
  const origin = cityToWorld(HUB, 0.6);
  NETWORK.forEach((name, i) => {
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, fog: false,
      uniforms: { uDraw: { value: 1 }, uTime: env.uTime, uAlpha: { value: 0 }, uPulse: { value: 0.16 + (i % 5) * 0.03 }, uPhase: { value: i * 0.37 } },
      vertexShader: ARC_VERT, fragmentShader: ARC_FRAG,
    });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(arcCurve(origin, cityToWorld(name, 0.6)), low ? 28 : 44, 0.8, 5), mat);
    mesh.frustumCulled = false;
    netMats.push(mat);
    net.add(mesh);
  });
  group.add(net);

  // every listed city as a small point
  const cityPos: number[] = [], citySize: number[] = [];
  Object.keys(CITIES).forEach((n) => { const p = cityToWorld(n, 0.4); cityPos.push(p.x, p.y, p.z); citySize.push(1.1); });
  const cityGeo = new THREE.BufferGeometry();
  cityGeo.setAttribute('position', new THREE.Float32BufferAttribute(cityPos, 3));
  cityGeo.setAttribute('size', new THREE.Float32BufferAttribute(citySize, 1));
  const cityPts = new THREE.Points(cityGeo, dotsMat);
  cityPts.frustumCulled = false;
  group.add(cityPts);

  const load = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) return;
    const { d } = (await res.json()) as { d: string };
    const rings = parsePath(d);
    const seg: number[] = [];
    rings.forEach((r) => {
      for (let i = 0; i + 3 < r.length; i += 2) {
        const a = mapToWorld([r[i], r[i + 1]], 0.2), b = mapToWorld([r[i + 2], r[i + 3]], 0.2);
        seg.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    });
    outline.geometry.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    // rasterise the outline once to know where land is
    const c = document.createElement('canvas');
    c.width = MAP_W; c.height = MAP_H;
    const g = c.getContext('2d', { willReadFrequently: true });
    if (!g) return;
    g.fillStyle = '#fff';
    g.fill(new Path2D(d), 'evenodd');
    const img = g.getImageData(0, 0, MAP_W, MAP_H).data;
    const step = low ? 7 : 5;
    const pos: number[] = [], size: number[] = [];
    for (let y = step / 2; y < MAP_H; y += step) for (let x = step / 2 + ((Math.round(y / step) % 2) * step) / 2; x < MAP_W; x += step) {
      if (img[((y | 0) * MAP_W + (x | 0)) * 4] > 128) { const w = mapToWorld([x, y]); pos.push(w.x, 0, w.z); size.push(0); }
    }
    dots.geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    dots.geometry.setAttribute('size', new THREE.Float32BufferAttribute(size, 1));
  };

  const setLane = (from: string, to: string | null) => {
    if (!CITIES[from]) return;
    lanePts.from.copy(cityToWorld(from, 0.8)); lanePts.has = true;
    lanePts.hasTo = !!(to && CITIES[to]);
    lane.geometry.dispose();
    if (lanePts.hasTo) {
      lanePts.to.copy(cityToWorld(to!, 0.8));
      laneCurve = arcCurve(lanePts.from, lanePts.to);
      lane.geometry = new THREE.TubeGeometry(laneCurve, 72, 2.2, 8);
    } else { laneCurve = null; lane.geometry = new THREE.BufferGeometry(); }
    endA.position.copy(lanePts.from); endB.position.copy(lanePts.to);
    drawT = 0;
  };

  const update = (mix: number, netMix: number, dt: number, time: number, still: boolean) => {
    group.visible = mix > 0.01;
    if (!group.visible) return;
    u.uMix.value = mix;
    outlineMat.opacity = 0.5 * mix;
    const laneShow = mix * (1 - netMix * 0.85);
    hubMat.opacity = mix * 0.95;
    const pk = (time * 0.45) % 1;
    pulse.scale.setScalar(9 + pk * 46); pulseMat.opacity = mix * (1 - pk) * 0.4;
    drawT = still ? 1 : Math.min(1, drawT + dt * (mix > 0.6 ? 0.8 : 0));
    laneMat.uniforms.uDraw.value = 1 - Math.pow(1 - drawT, 3);
    laneMat.uniforms.uAlpha.value = laneShow;
    lane.visible = lanePts.hasTo;
    endA.visible = lanePts.has; endB.visible = lanePts.hasTo;
    endMat.opacity = laneShow;
    netMats.forEach((m, i) => {
      m.uniforms.uAlpha.value = mix * netMix * 0.6;
      m.uniforms.uDraw.value = still ? 1 : THREE.MathUtils.clamp(netMix * 2.2 - i * 0.07, 0, 1);
    });
    net.visible = netMix > 0.01;
  };
  const resize = (h: number, fov: number) => { u.uScale.value = h / (2 * Math.tan((fov * Math.PI) / 360)); };
  return { group, load, setLane, update, resize, lanePts };
}
