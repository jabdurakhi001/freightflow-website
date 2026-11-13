import * as THREE from 'three';
/** Stand-in rig (boxes) used only until the modelled truck is wired in. */
export function createTruck() {
  const group = new THREE.Group();
  const navy = new THREE.MeshStandardMaterial({ color: 0x0b2545, roughness: 0.4 });
  const white = new THREE.MeshStandardMaterial({ color: 0xf3f1ec, roughness: 0.6 });
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3.2, 6.5), navy); cab.position.set(0, 2.2, -7.6);
  const box = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.85, 16.15), white); box.position.set(0, 2.68, 2.8);
  group.add(cab, box);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  return {
    group, length: 21.8,
    anchors: { tractor: v(1.25, 2.2, -8.6), sleeper: v(0, 3.9, -6.2), trailer: v(1.3, 3.4, 3), telematics: v(0, 3.8, -7.4), trailerRear: v(0, 2.6, 10.9), headlights: v(0, 1.1, -10.9) },
    update(_dt: number, _speed: number) {}, setHeadlights(_l: number) {}, setXray(_a: number, _b: number) {}, setDaylight(_t: number) {}, dispose() {},
  };
}
