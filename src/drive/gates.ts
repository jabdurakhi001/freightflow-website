import * as THREE from 'three';

export const GATE_SPACING = 34;
const LABELS = ['QUOTE', 'AI MATCH', 'DISPATCHER', 'TRACKED', 'DELIVERED'];
/** index of the step a person does: it gets the accent colour */
const HUMAN = 2;

function paintTexture(n: number, label: string, human: boolean) {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = human ? '#ff9d5c' : '#e9edf3';
  g.textAlign = 'center';
  g.font = '600 250px "Bricolage Grotesque", "Hanken Grotesk", system-ui, sans-serif';
  g.fillText(`0${n + 1}`, 256, 300);
  g.font = '600 62px "Hanken Grotesk", system-ui, sans-serif';
  try { (g as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '8px'; } catch { /* older browsers */ }
  g.fillText(label, 260, 400);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/**
 * Five checkpoints on the road for "how it works". The page's scroll position moves them past
 * the truck: each one is a strip of light across the lanes, a frame over them, and its number
 * painted on the asphalt of the passing lane.
 */
export function createGates() {
  const group = new THREE.Group();
  const gates: { g: THREE.Group; mats: (THREE.MeshBasicMaterial)[]; flash: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const human = i === HUMAN;
    const color = new THREE.Color(human ? '#ff8a3d' : '#c9d6ea');
    const glow = new THREE.MeshBasicMaterial({ color: color.clone(), transparent: true, opacity: 0, fog: false, toneMapped: false });
    const strip = new THREE.MeshBasicMaterial({ color: color.clone(), transparent: true, opacity: 0, fog: false, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
    const paint = new THREE.MeshBasicMaterial({ map: paintTexture(i, LABELS[i], human), transparent: true, opacity: 0, fog: false, depthWrite: false });
    const g = new THREE.Group();
    const x0 = -6.2, x1 = 2.5, w = x1 - x0, cx = (x0 + x1) / 2;
    const post = new THREE.BoxGeometry(0.16, 6.4, 0.16);
    const a = new THREE.Mesh(post, glow), b = new THREE.Mesh(post, glow);
    a.position.set(x0, 3.2, 0); b.position.set(x1, 3.2, 0);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(w + 0.16, 0.16, 0.16), glow);
    beam.position.set(cx, 6.4, 0);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.5).rotateX(-Math.PI / 2), strip);
    line.position.set(cx, 0.03, 0);
    const wash = new THREE.Mesh(new THREE.PlaneGeometry(w, 9).rotateX(-Math.PI / 2), strip);
    wash.position.set(cx, 0.025, 0);
    wash.scale.z = 1;
    (wash.material as THREE.MeshBasicMaterial) = strip.clone();
    const label = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 3.3).rotateX(-Math.PI / 2), paint);
    label.position.set(-3.7, 0.04, -3.4);
    g.add(a, b, beam, line, wash, label);
    group.add(g);
    gates.push({ g, mats: [glow, strip, wash.material as THREE.MeshBasicMaterial, paint], flash: 0 });
  }
  group.visible = false;

  /** `travel` = scroll progress through the chapter × 5; `show` fades the whole set. */
  const update = (travel: number, show: number, dt: number) => {
    group.visible = show > 0.01;
    if (!group.visible) return;
    gates.forEach((gt, i) => {
      const z = -((i + 0.5) - travel) * GATE_SPACING;
      gt.g.position.z = z;
      // crossing the cab: flash
      const cross = Math.exp(-Math.pow((z + 6) / 7, 2));
      gt.flash = Math.max(cross, gt.flash - dt * 1.5);
      const passed = z > 2 ? 0.45 : 1;
      const fade = show * THREE.MathUtils.smoothstep(z, -150, -100) * (1 - THREE.MathUtils.smoothstep(z, 70, 110));
      gt.mats[0].opacity = fade * passed;
      gt.mats[0].color.setScalar(1).multiply(i === HUMAN ? ORANGE : COOL).multiplyScalar(1.1 + gt.flash * 2.2);
      gt.mats[1].opacity = fade * (0.55 + gt.flash) * passed;
      gt.mats[2].opacity = fade * (0.02 + gt.flash * 0.1);
      gt.mats[3].opacity = fade * (0.55 + 0.45 * cross) * (z > 2 ? 0.6 : 1);
    });
  };
  const repaint = () => gates.forEach((gt, i) => { const m = gt.mats[3]; m.map?.dispose(); m.map = paintTexture(i, LABELS[i], i === HUMAN); m.needsUpdate = true; });
  return { group, update, repaint };
}
const ORANGE = new THREE.Color('#ff8a3d'), COOL = new THREE.Color('#c9d6ea');
