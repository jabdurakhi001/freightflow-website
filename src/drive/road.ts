import * as THREE from 'three';
import { env, FOG_PARS } from './sky';

/** Lane layout (x, metres). The truck's lane is centred on x = 0. */
export const ROAD = { right: 4.6, edgeR: 2.05, dash: -1.85, edgeL: -5.75, medianA: -6.6, medianB: -11.4, oEdgeA: -11.75, oDash: -15.3, oEdgeB: -18.9, left: -21.4, centre: -8.4 };

const NOISE = /* glsl */ `
  float hash21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vnoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), f.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), f.x), f.y); }
  float fbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p = p * 2.03 + 7.1; a *= 0.5; } return s; }
`;

export function createRoad() {
  const uniforms = {
    ...env,
    uOffset: { value: 0 }, uHead: { value: 1 }, uLead: { value: 0 }, uCam: { value: new THREE.Vector3() }, uGates: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vW;
      void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vW;
      uniform float uOffset, uHead, uLead, uDay, uGates; uniform vec3 uCam, uGlow, uSunDir;
      ${FOG_PARS}
      ${NOISE}
      float band(float x, float c, float w) { float aa = fwidth(x) * 1.2; return 1.0 - smoothstep(w - aa, w + aa, abs(x - c)); }
      void main() {
        float x = vW.x, z = vW.z - uOffset;
        float dist = length(vW - uCam);
        float n = vnoise(vec2(x * 9.0, z * 2.2)) * 0.6 + vnoise(vec2(x * 40.0, z * 40.0)) * 0.4;
        float median = step(${ROAD.medianB.toFixed(2)}, x) * step(x, ${ROAD.medianA.toFixed(2)});
        vec3 asphalt = mix(vec3(0.018, 0.022, 0.032), vec3(0.036, 0.042, 0.056), n);
        asphalt = mix(asphalt, vec3(0.012, 0.02, 0.022) * (0.7 + n), median);
        // tyre-polished wheel tracks
        asphalt *= 1.0 - 0.18 * (band(x, 1.0, 0.35) + band(x, -1.0, 0.35)) * (1.0 - median);
        // paint
        float dash = step(fract(z / 12.0), 0.27);
        float white = band(x, ${ROAD.edgeR.toFixed(2)}, 0.075) + band(x, ${ROAD.dash.toFixed(2)}, 0.075) * dash
                    + band(x, ${ROAD.oDash.toFixed(2)}, 0.075) * dash + band(x, ${ROAD.oEdgeB.toFixed(2)}, 0.075);
        float yellow = band(x, ${ROAD.edgeL.toFixed(2)}, 0.075) + band(x, ${ROAD.oEdgeA.toFixed(2)}, 0.075);
        float wear = 0.7 + 0.3 * vnoise(vec2(x * 30.0, z * 1.3));
        // light on the road: headlamps ahead, tail lamps behind, street lamps on the median
        vec2 hp = vec2(x, vW.z + uLead + 26.0) / vec2(4.2, 17.0);
        float head = exp(-dot(hp, hp)) * uHead;
        vec2 tp = vec2(x, vW.z + uLead - 13.0) / vec2(2.2, 3.5);
        float tail = exp(-dot(tp, tp)) * 0.22;
        float lz = mod(z + 40.0, 80.0) - 40.0;
        vec2 lp = vec2(x + 7.0, lz) / vec2(11.0, 13.0);
        float lamp = exp(-dot(lp, lp)) * (1.0 - smoothstep(0.35, 0.8, uDay));
        float ambient = 0.3 + 1.0 * uDay;
        vec3 lightCol = vec3(1.0, 0.93, 0.8) * head * 0.9 + vec3(1.0, 0.1, 0.06) * tail + vec3(1.0, 0.72, 0.42) * lamp * 0.5;
        vec3 col = asphalt * (ambient + lightCol * 9.0);
        vec3 paint = (vec3(0.82, 0.84, 0.86) * white + vec3(0.95, 0.66, 0.16) * yellow) * wear;
        col += paint * (0.10 + 0.5 * uDay + head * 1.6 + lamp * 0.5 + tail * vec3(1.0, 0.2, 0.15));
        // wet sheen: the horizon's glow smeared along the road at grazing angles
        vec3 v = normalize(uCam - vW);
        float fres = pow(1.0 - clamp(v.y, 0.0, 1.0), 5.0);
        float toSun = pow(max(dot(normalize(-v.xz), normalize(uSunDir.xz)), 0.0), 3.0);
        col += uGlow * fres * (0.5 - 0.2 * uDay + toSun * 0.9 * uDay) * (0.6 + 0.4 * n) * (1.0 - median);
        col = mix(col, uFogColor, fogAmt(dist));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const geo = new THREE.PlaneGeometry(ROAD.right - ROAD.left, 2600, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set((ROAD.right + ROAD.left) / 2, 0, -700);
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

/** Rolling ground either side of the road, drawn as faint survey lines over dark land. */
export function createTerrain() {
  const CELL = 12, SEG = 150;
  const uniforms = { ...env, uOffset: { value: 0 }, uCam: { value: new THREE.Vector3() } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vW; varying vec2 vT; varying float vH;
      uniform float uOffset;
      ${NOISE}
      float height(vec2 t) {
        float away = smoothstep(16.0, 190.0, abs(t.x - (${ROAD.centre.toFixed(1)})));
        float h = fbm(t * 0.006) * 70.0 + fbm(t * 0.021 + 3.0) * 14.0;
        return (h - 22.0) * away * away - 0.35;
      }
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vT = vec2(w.x, w.z - uOffset);
        w.y = max(height(vT), -0.35);
        vH = w.y; vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vW; varying vec2 vT; varying float vH;
      uniform float uDay; uniform vec3 uCam, uSunDir, uGlow;
      ${FOG_PARS}
      void main() {
        float dist = length(vW - uCam);
        vec3 nrm = normalize(cross(dFdx(vW), dFdy(vW)));
        if (nrm.y < 0.0) nrm = -nrm;
        float sun = max(dot(nrm, normalize(uSunDir + vec3(0.0, 0.35, 0.0))), 0.0);
        vec3 land = mix(vec3(0.012, 0.022, 0.04), vec3(0.03, 0.05, 0.085), smoothstep(0.0, 40.0, vH));
        land += vec3(0.9, 0.42, 0.22) * sun * uDay * 0.2 + vec3(0.012, 0.016, 0.03) * uDay;
        vec2 g = abs(fract(vT / ${CELL.toFixed(1)} + 0.5) - 0.5) / fwidth(vT / ${CELL.toFixed(1)});
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        vec3 lineCol = mix(vec3(0.45, 0.6, 0.85), vec3(1.0, 0.68, 0.45), uDay * 0.7);
        vec3 col = land + lineCol * line * (0.06 + 0.10 * smoothstep(2.0, 45.0, vH)) * (1.0 - smoothstep(250.0, 620.0, dist));
        col = mix(col, uFogColor, fogAmt(dist * 0.8));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const geo = new THREE.PlaneGeometry(CELL * SEG, CELL * SEG, SEG, SEG);
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -0.02;
  mesh.frustumCulled = false;
  const update = (offset: number) => {
    uniforms.uOffset.value = offset;
    mesh.position.z = -350 + (offset % CELL);
    mesh.position.x = ROAD.centre;
  };
  return { mesh, uniforms, update };
}
