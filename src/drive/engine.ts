import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createSky, env } from './sky';
import { createRoad, createTerrain } from './road';
import { createScenery } from './scenery';
import { createGates, GATE_SPACING } from './gates';
import { createMap } from './map3d';
import { createTruck } from './truck';
import { SHOTS, blendShots, type Shot } from './shots';

export type DriveQuality = 'high' | 'low';

export interface DriveOptions {
  canvas: HTMLCanvasElement;
  quality: DriveQuality;
  /** reduced motion: nothing moves on its own; the scene cuts from chapter to chapter */
  still: boolean;
  mapUrl: string;
  onSlow?: () => void;
  onReady?: () => void;
}

export interface DriveHandle {
  setLane(from: string, to: string | null): void;
  setPaused(paused: boolean): void;
  /** flash the high beams */
  flash(): void;
  /** turn the camera around the rig (radians) while the blueprint chapter is on screen */
  orbit(delta: number): void;
  /** a DOM element the engine pins to a point in the scene */
  setLabel(name: string, el: HTMLElement | null): void;
  destroy(): void;
}

interface Section { el: HTMLElement; key: string; top: number; height: number; sticky: boolean }

const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const NIGHT_FOG = new THREE.Color('#071528'), DAWN_FOG = new THREE.Color('#2f2a47');
const NIGHT_GLOW = new THREE.Color(0.014, 0.04, 0.095), DAWN_GLOW = new THREE.Color(0.55, 0.27, 0.15);

export function createDrive(opts: DriveOptions): DriveHandle {
  const { canvas, still } = opts;
  const low = opts.quality === 'low';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !low, alpha: false, powerPreference: 'high-performance' });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.setClearColor(NIGHT_FOG, 1);

  const scene = new THREE.Scene();
  const fog = new THREE.FogExp2(NIGHT_FOG.getHex(), 0.0042);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.3, 9000);

  const hemi = new THREE.HemisphereLight(0x3a5a8c, 0x0a1220, 1.1);
  const moon = new THREE.DirectionalLight(0xbfd4ff, 1.6); moon.position.set(-20, 25, 30);
  const fill = new THREE.DirectionalLight(0xff9d5c, 0.35); fill.position.set(15, 6, -25);
  const sun = new THREE.DirectionalLight(0xffb27a, 0);
  scene.add(hemi, moon, fill, sun);

  const sky = createSky();
  const world = new THREE.Group();
  const road = createRoad();
  const terrain = createTerrain();
  const scenery = createScenery(low);
  const gates = createGates();
  const truck = createTruck();
  // the road shader already paints the headlamp pool (and lights the lane paint with it)
  const pool = truck.group.getObjectByName('headlightPool');
  if (pool) pool.visible = false;
  world.add(terrain.mesh, road.mesh, scenery.group, gates.group, truck.group);
  const map = createMap(low);
  scene.add(sky, world, map.group);
  void map.load(opts.mapUrl).catch(() => {});
  document.fonts?.ready.then(() => gates.repaint()).catch(() => {});

  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (!low) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.5, 0.9);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  // ---------- layout ----------
  let W = 1, H = 1, aspect = 1;
  let sections: Section[] = [];
  const measure = () => {
    const y = window.scrollY;
    sections = Array.from(document.querySelectorAll<HTMLElement>('[data-shot]'))
      .filter((el) => SHOTS[el.dataset.shot!])
      .map((el) => { const r = el.getBoundingClientRect(); return { el, key: el.dataset.shot!, top: r.top + y, height: r.height, sticky: el.hasAttribute('data-scrub') }; });
  };
  const resize = () => {
    W = window.innerWidth; H = window.innerHeight; aspect = W / H;
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1 : W < 760 ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    composer?.setPixelRatio(dpr);
    composer?.setSize(W, H);
    camera.aspect = aspect;
    measure();
    dirty = 3;
  };

  // ---------- state ----------
  let dirty = 3;
  let paused = false, destroyed = false, raf = 0;
  let sY = window.scrollY, lastScroll = sY;
  let offset = 0, time = 0, headBoost = 0, intro = still ? 1 : 0;
  let orbitYaw = 0, orbitVel = 0;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  const labels = new Map<string, HTMLElement>();
  const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), tmp = new THREE.Vector3(), right = new THREE.Vector3(), up = new THREE.Vector3();
  let slowT = 0, slowAcc = 0, slowN = 0, readySent = false;

  /** The blended shot for a (smoothed) scroll position. */
  const shotAt = (y: number): { shot: Shot; travel: number } => {
    const mid = y + H * 0.5;
    let travel = 0;
    const prog = (s: Section) => clamp01(s.sticky ? (y - s.top) / Math.max(1, s.height - H) : (mid - s.top) / Math.max(1, s.height));
    const howS = sections.find((s) => s.key === 'how');
    if (howS) travel = prog(howS) * 5;
    if (!sections.length) return { shot: SHOTS.hero(0), travel };
    let i = 0;
    while (i < sections.length - 1 && mid >= sections[i + 1].top) i++;
    const s = sections[i];
    const m = Math.min(H * 0.38, s.height * 0.5);
    const cur = SHOTS[s.key](prog(s));
    const next = sections[i + 1], prev = sections[i - 1];
    let shot = cur;
    if (next && mid > s.top + s.height - m) {
      const m2 = Math.min(H * 0.38, next.height * 0.5);
      const t = (mid - (s.top + s.height - m)) / (m + m2);
      shot = blend(cur, SHOTS[next.key](prog(next)), still ? Math.round(t) : smoother(clamp01(t)));
    } else if (prev && mid < s.top + m) {
      const m0 = Math.min(H * 0.38, prev.height * 0.5);
      const t = (mid - (prev.top + prev.height - m0)) / (m0 + m);
      shot = blend(SHOTS[prev.key](prog(prev)), cur, still ? Math.round(t) : smoother(clamp01(t)));
    }
    return { shot, travel };
  };

  /** Blend two shots, swinging the camera around the rig instead of cutting through it. */
  const blend = (a: Shot, b: Shot, t: number): Shot => {
    if (t <= 0) return a;
    if (t >= 1) return b;
    const out = blendShots(a, b, t);
    const ra = Math.hypot(a.pos[0], a.pos[2]), rb = Math.hypot(b.pos[0], b.pos[2]);
    if (ra > 8 && rb > 8 && ra < 120 && rb < 120) {
      const aa = Math.atan2(a.pos[0], a.pos[2]);
      let d = Math.atan2(b.pos[0], b.pos[2]) - aa;
      if (d > Math.PI) d -= Math.PI * 2; else if (d < -Math.PI) d += Math.PI * 2;
      const ang = aa + d * t, r = ra + (rb - ra) * t;
      out.pos = [Math.sin(ang) * r, out.pos[1], Math.cos(ang) * r];
    }
    return out;
  };

  const project = (v: THREE.Vector3): [number, number, boolean] => {
    tmp.copy(v).project(camera);
    return [(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H, tmp.z < 1 && Math.abs(tmp.x) < 1.2 && Math.abs(tmp.y) < 1.2];
  };
  const placeLabel = (name: string, world: THREE.Vector3, show: number) => {
    const el = labels.get(name);
    if (!el) return;
    const [x, y, ok] = project(world);
    const o = ok ? clamp01(show) : 0;
    el.style.opacity = o.toFixed(3);
    el.style.visibility = o < 0.02 ? 'hidden' : 'visible';
    if (o >= 0.02) el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    // near the right edge the label hangs to the left of its point
    if (o >= 0.02) el.classList.toggle('flip', x > W * 0.6);
  };

  const frame = (now: number) => {
    raf = 0;
    if (destroyed) return;
    const dtRaw = Math.min(0.1, (now - last) / 1000);
    last = now;
    const dt = still ? 0 : dtRaw;
    // smoothed scroll: everything that follows the page eases after it
    const target = window.scrollY;
    const scrollVel = (target - lastScroll) / Math.max(dtRaw, 1e-3);
    lastScroll = target;
    sY = still ? target : sY + (target - sY) * (1 - Math.exp(-dtRaw * 7));
    if (Math.abs(target - sY) < 0.05) sY = target;
    const moving = Math.abs(target - sY) > 0.05;

    const { shot, travel } = shotAt(sY);
    time += dt;
    intro = Math.min(1, intro + dt / 2.4);
    pointer.sx += (pointer.x - pointer.sx) * (1 - Math.exp(-dtRaw * 3));
    pointer.sy += (pointer.y - pointer.sy) * (1 - Math.exp(-dtRaw * 3));
    headBoost = Math.max(0, headBoost - dt * 1.6);

    // ----- world state -----
    const day = shot.day;
    env.uDay.value = day;
    env.uTime.value = time;
    const sunEl = THREE.MathUtils.lerp(-0.2, 0.055, THREE.MathUtils.smoothstep(day, 0.2, 1));
    env.uSunDir.value.set(-0.16, sunEl, -1).normalize();
    env.uFogColor.value.copy(NIGHT_FOG).lerp(DAWN_FOG, day * day);
    if (shot.map > 0) env.uFogColor.value.lerp(NIGHT_FOG, shot.map);
    env.uFogDensity.value = THREE.MathUtils.lerp(0.0042 - day * 0.0012, 0.013, shot.map);
    env.uGlow.value.copy(NIGHT_GLOW).lerp(DAWN_GLOW, day);
    env.uVeil.value = smoother(clamp01(shot.map * 1.4));
    fog.color.copy(env.uFogColor.value); fog.density = env.uFogDensity.value;
    renderer.setClearColor(fog.color, 1);
    hemi.intensity = 1.1 + day * 0.9;
    hemi.color.setRGB(0.23 + day * 0.35, 0.35 + day * 0.2, 0.55 + day * 0.1);
    moon.intensity = 1.6 * (1 - day * 0.7);
    sun.position.copy(env.uSunDir.value).multiplyScalar(100).setY(18 + day * 10);
    sun.intensity = day * day * 2.6;
    fill.intensity = 0.35 + day * 0.5;
    renderer.toneMappingExposure = (1 - shot.dim * 0.45) * (0.25 + 0.75 * smoother(clamp01(intro * 1.6)));

    // road speed: time, plus the page's own scroll while the gates are up
    const speed = still ? 0 : shot.speed * (0.4 + 0.6 * smoother(intro)) + THREE.MathUtils.clamp(scrollVel * 0.004, -6, 14) * (1 - shot.gates);
    offset += speed * dt;
    const total = offset + travel * GATE_SPACING;
    const dTotal = total - lastTotal; lastTotal = total;
    const visSpeed = dt > 0 ? dTotal / dt : 0;

    const roadShow = shot.map < 0.97;
    world.visible = roadShow;
    if (roadShow) {
      road.uniforms.uOffset.value = total;
      road.uniforms.uLead.value = shot.lead;
      terrain.update(total);
      const flick = intro < 0.5 ? (Math.sin(intro * 90) > -0.2 ? 1 : 0.25) * smoother(clamp01(intro * 2.4)) : 1;
      const head = (1 + headBoost) * flick * (1 - shot.map);
      road.uniforms.uHead.value = head * (1 - 0.6 * day);
      truck.group.position.z = -shot.lead;
      truck.setHeadlights(head);
      truck.setXray(shot.xT, shot.xL);
      truck.setDaylight(day);
      truck.update(dt, visSpeed);
      truck.group.visible = shot.map < 0.9;
      scenery.update(total, dt, visSpeed, day, time, { road: 1, skyline: shot.skyline * (1 - shot.map), streak: (1 - shot.gates * 0.6) * (1 - shot.map) });
      gates.update(travel, shot.gates * (1 - shot.map), dt);
    }
    map.update(smoother(clamp01((shot.map - 0.25) / 0.75)), shot.net, dt, time, still);

    // ----- camera -----
    // narrow screens: step back so the rig still fits, and lift the scene into the top of the frame
    const portrait = aspect < 1.15;
    const k = Math.max(1, Math.pow(1.72 / Math.max(aspect, 0.4), 0.82) * (portrait ? 0.82 : 1));
    camTgt.set(shot.tgt[0], shot.tgt[1], shot.tgt[2]);
    camPos.set(shot.pos[0], shot.pos[1], shot.pos[2]);
    // drag-to-orbit in the blueprint chapter
    const orbitW = clamp01(shot.xT) * (1 - shot.map);
    orbitYaw += orbitVel * dtRaw; orbitVel *= Math.exp(-dtRaw * 3.5);
    if (orbitW < 0.02) { orbitYaw *= Math.exp(-dtRaw * 4); }
    else if (!still) orbitYaw += dtRaw * 0.045 * orbitW;
    if (Math.abs(orbitYaw) > 1e-4 && orbitW > 0) camPos.sub(camTgt).applyAxisAngle(THREE.Object3D.DEFAULT_UP, orbitYaw * orbitW).add(camTgt);
    // the opening move: the camera settles in from further back
    camPos.sub(camTgt).multiplyScalar(k * (1 + 0.32 * (1 - smoother(intro)))).add(camTgt);
    camPos.y = Math.max(camPos.y, 0.9);
    camera.fov = shot.fov;
    camera.up.set(0, 1, 0);
    camera.position.copy(camPos);
    camera.lookAt(camTgt);
    // pointer parallax
    if (!still) {
      const dist = camPos.distanceTo(camTgt);
      right.setFromMatrixColumn(camera.matrixWorld, 0); up.setFromMatrixColumn(camera.matrixWorld, 1);
      camera.position.addScaledVector(right, pointer.sx * dist * 0.03).addScaledVector(up, -pointer.sy * dist * 0.018);
      // a breath of handheld drift
      camera.position.addScaledVector(up, Math.sin(time * 0.7) * dist * 0.0016).addScaledVector(right, Math.cos(time * 0.53) * dist * 0.0016);
      camera.lookAt(camTgt);
    }
    if (portrait) camera.setViewOffset(W, H, 0, H * 0.2, W, H);
    else camera.setViewOffset(W, H, -shot.side * W * 0.2, 0, W, H);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    sky.position.copy(camera.position);
    road.uniforms.uCam.value.copy(camera.position);
    terrain.uniforms.uCam.value.copy(camera.position);
    const pxH = H * renderer.getPixelRatio();
    scenery.resize(pxH, camera.fov); map.resize(pxH, camera.fov);

    // ----- labels pinned to the scene -----
    const laneShow = (shot.map - 0.8) * 5 * (1 - shot.net);
    placeLabel('lane-from', map.lanePts.from, map.lanePts.has ? laneShow : 0);
    placeLabel('lane-to', map.lanePts.to, map.lanePts.hasTo ? laneShow : 0);
    placeLabel('hub', ORIGIN, (shot.map - 0.8) * 5 * shot.net);
    const xs = (shot.xT - 0.75) * 4;
    truck.group.updateMatrixWorld();
    (['tractor', 'sleeper', 'trailer'] as const).forEach((n) => placeLabel(`fleet-${n}`, tmp2.copy(truck.anchors[n]).applyMatrix4(truck.group.matrixWorld), xs));

    if (composer) composer.render(dtRaw); else renderer.render(scene, camera);
    if (!readySent) { readySent = true; opts.onReady?.(); }

    // ----- watchdog: tell the page when this device can't keep up -----
    if (!still && intro >= 1) {
      slowT += dtRaw; slowAcc += dtRaw; slowN++;
      if (slowT > 2.5) {
        if ((slowAcc / slowN) * 1000 > 48) opts.onSlow?.();
        slowT = slowAcc = slowN = 0;
      }
    }
    if (still) { if (moving || dirty > 0) { dirty--; schedule(); } }
    else schedule();
  };
  const ORIGIN = new THREE.Vector3(0, 0.5, 0), tmp2 = new THREE.Vector3();
  let last = performance.now(), lastTotal = 0;
  const schedule = () => { if (!raf && !paused && !destroyed && !document.hidden) { raf = requestAnimationFrame(frame); } };
  const kick = () => { dirty = 3; last = performance.now(); schedule(); };

  const onPointer = (e: PointerEvent) => { if (e.pointerType === 'touch') return; pointer.x = (e.clientX / W) * 2 - 1; pointer.y = (e.clientY / H) * 2 - 1; };
  const onVis = () => { if (!document.hidden) kick(); };
  const ro = new ResizeObserver(() => { measure(); kick(); });
  ro.observe(document.body);
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVis);
  resize();
  schedule();

  return {
    setLane(from, to) { map.setLane(from, to); kick(); },
    setPaused(p) { paused = p; if (p) { cancelAnimationFrame(raf); raf = 0; } else kick(); },
    flash() { headBoost = 1.4; kick(); },
    orbit(delta) { orbitVel += delta * 9; orbitYaw += delta; kick(); },
    setLabel(name, el) { if (el) labels.set(name, el); else labels.delete(name); kick(); },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', kick);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVis);
      truck.dispose();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
      });
      composer?.dispose();
      renderer.dispose();
    },
  };
}
