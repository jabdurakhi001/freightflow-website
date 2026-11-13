import * as THREE from 'three';

/** Shared fog + time-of-day uniforms, referenced (not copied) by every custom material. */
export const env = {
  uFogColor: { value: new THREE.Color('#071528') },
  uFogDensity: { value: 0.006 },
  uDay: { value: 0 },
  uTime: { value: 0 },
  uSunDir: { value: new THREE.Vector3(0, 0, -1) },
  uGlow: { value: new THREE.Color('#12305c') },
  /** 1 while the map is up: the sky gives way to plain night */
  uVeil: { value: 0 },
};

export const FOG_PARS = /* glsl */ `
  uniform vec3 uFogColor; uniform float uFogDensity;
  float fogAmt(float d) { float f = d * uFogDensity; return 1.0 - exp(-f * f); }
`;

export function createSky() {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: { uDay: env.uDay, uTime: env.uTime, uSunDir: env.uSunDir, uVeil: env.uVeil, uFogColor: env.uFogColor },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vDir; uniform float uDay, uTime, uVeil; uniform vec3 uSunDir, uFogColor;
      float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        // night
        vec3 nZen = vec3(0.002, 0.006, 0.02), nHor = vec3(0.014, 0.04, 0.095);
        vec3 night = mix(nHor, nZen, pow(smoothstep(-0.02, 0.75, h), 0.55));
        // dawn: the logo's blue → violet → orange, laid on its side
        vec3 dZen = vec3(0.035, 0.09, 0.22), dMid = vec3(0.23, 0.15, 0.30), dHor = vec3(0.95, 0.46, 0.22);
        float az = max(dot(normalize(vec3(d.x, 0.0, d.z)), normalize(vec3(uSunDir.x, 0.0, uSunDir.z))), 0.0);
        float toward = pow(az, 2.0);
        vec3 low = mix(mix(dMid, vec3(0.10, 0.13, 0.27), 1.0 - toward), dHor, toward * smoothstep(0.32, -0.02, h));
        vec3 dawn = mix(low, dZen, smoothstep(0.0, 0.62, h));
        vec3 col = mix(night, dawn, smoothstep(0.0, 1.0, uDay));
        // sun disc and bloom around it
        float sd = max(dot(d, normalize(uSunDir)), 0.0);
        float rise = smoothstep(0.35, 1.0, uDay);
        col += vec3(1.0, 0.62, 0.32) * pow(sd, 22.0) * 0.32 * rise;
        col += vec3(1.0, 0.86, 0.66) * pow(sd, 900.0) * 3.0 * rise;
        // first light along the horizon long before the sun
        col += vec3(0.95, 0.42, 0.22) * pow(az, 6.0) * smoothstep(0.16, -0.01, h) * smoothstep(0.04, 0.5, uDay) * 0.5;
        // stars
        vec3 sp = d * 210.0, g = floor(sp);
        float s = hash(g);
        float dotty = smoothstep(0.2, 0.02, length(fract(sp) - 0.5));
        float tw = 0.75 + 0.25 * sin(uTime * 1.7 + s * 90.0);
        float star = smoothstep(0.93, 1.0, s) * dotty * smoothstep(0.02, 0.3, h) * tw;
        col += vec3(0.85, 0.9, 1.0) * star * (1.0 - smoothstep(0.1, 0.7, uDay)) * 1.4;
        // below the horizon: settle into the fog tone
        col = mix(col, col * 0.55, smoothstep(0.0, -0.12, d.y));
        col = mix(col, uFogColor, uVeil);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(4000, 48, 24), mat);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  return mesh;
}
