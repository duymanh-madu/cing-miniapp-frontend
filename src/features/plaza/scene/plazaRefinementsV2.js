import * as THREE from 'three';

// The original QR plaques are exported under this Blender object name.
export function refinePlazaMap(map) {
  const plaques = [], supports = [], rims = [], replaced = new Set();
  map.traverse(o => {
    if (/^V15_Table_Menu_Book(?:[._]?\d+)?$/.test(o.name)) plaques.push(o);
    if (/^V15_Chair_Curved_Back_Support(?:[._]?\d+)?$/.test(o.name)) supports.push(o);
    if (/^V15_Chair_Oval_Black_Wood_Rim(?:[._]?\d+)?$/.test(o.name)) rims.push(o);
  });
  plaques.forEach(o => o.removeFromParent());
  const ellipse = new class extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      const a = t * Math.PI * 2;
      return target.set(.232 * Math.cos(a), 1.13 + .32 * Math.sin(a), -.25);
    }
  }();
  const rimGeometry = new THREE.TubeGeometry(ellipse, 80, .026, 10, true);
  const geometries = new Map();
  for (const o of supports) {
    o.geometry.computeBoundingBox();
    const side = o.geometry.boundingBox.getCenter(new THREE.Vector3()).x < 0 ? -1 : 1;
    if (!geometries.has(side)) {
      // A vertical tangent meets the oval at its widest point. The final arc
      // follows the rim itself, so the rail cannot stop short of the back.
      const stem = new THREE.CubicBezierCurve3(
        new THREE.Vector3(side * .19, .46, -.16),
        new THREE.Vector3(side * .228, .70, -.23),
        new THREE.Vector3(side * .232, 1.00, -.25),
        new THREE.Vector3(side * .232, 1.13, -.25));
      const curve = new class extends THREE.Curve {
        getPoint(t, target = new THREE.Vector3()) {
          if (t <= .8) return stem.getPoint(t / .8, target);
          const a = (t - .8) / .2 * .32;
          return target.set(side * .232 * Math.cos(a), 1.13 + .32 * Math.sin(a), -.25);
        }
      }();
      geometries.set(side, new THREE.TubeGeometry(curve, 40, .026, 10, false));
    }
    replaced.add(o.geometry); o.geometry = geometries.get(side);
  }
  rims.forEach(o => { replaced.add(o.geometry); o.geometry = rimGeometry; });
  map.updateMatrixWorld(true);
  // Dispose only geometries that are no longer referenced anywhere in the map.
  const used = new Set(); map.traverse(o => { if (o.geometry) used.add(o.geometry); });
  plaques.forEach(o => { if (o.geometry) replaced.add(o.geometry); });
  replaced.forEach(g => { if (!used.has(g)) g.dispose(); });
  if (!rims.length) rimGeometry.dispose();
  return { plaquesRemoved: plaques.length, chairSupports: supports.length, chairBacks: rims.length };
}

export function joystickVector(clientX, clientY, rect) {
  const radius = Math.min(rect.width, rect.height) * .34;
  let x = (clientX - rect.left - rect.width / 2) / radius;
  let z = -(clientY - rect.top - rect.height / 2) / radius;
  const length = Math.hypot(x, z);
  if (length < .12) return { x: 0, z: 0 };
  if (length > 1) { x /= length; z /= length; }
  return { x, z };
}

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
export function vietnamHour(date = new Date()) {
  const p = Object.fromEntries(clock.formatToParts(date).map(p => [p.type, p.value]));
  return Number(p.hour) + Number(p.minute) / 60;
}
const skies = [
  [0, '#172437', '#b3c9eb', .62, .32, .82, .30, 'Đêm'],
  [5, '#343b53', '#bccbec', .68, .45, .85, .35, 'Rạng sáng'],
  [6.5, '#efd5bc', '#ffe1b6', .85, 1.4, .94, .57, 'Buổi sáng'],
  [9, '#e4edf1', '#fff0d5', .8, 2, .95, .65, 'Ban ngày'],
  [16, '#e8e8dc', '#ffe7c2', .8, 1.8, .95, .62, 'Buổi chiều'],
  [18, '#cba68e', '#ffc18b', .75, 1.1, .9, .50, 'Hoàng hôn'],
  [19, '#27364c', '#b3c9eb', .62, .32, .82, .30, 'Buổi tối'],
  [24, '#172437', '#b3c9eb', .62, .32, .82, .30, 'Đêm'],
];
export function timePalette(hour) {
  hour = ((hour % 24) + 24) % 24;
  const i = skies.findIndex((s, i) => i && hour < s[0]);
  const a = skies[i - 1], b = skies[i], t = (hour - a[0]) / (b[0] - a[0]);
  const blend = col => new THREE.Color(a[col]).lerp(new THREE.Color(b[col]), t);
  return { background: blend(1), light: blend(2), hemisphere: THREE.MathUtils.lerp(a[3], b[3], t), sun: THREE.MathUtils.lerp(a[4], b[4], t), exposure: THREE.MathUtils.lerp(a[5], b[5], t), environment: THREE.MathUtils.lerp(a[6], b[6], t), label: a[7] };
}

// A bounded search runs only on a tap, never every animation frame.
// Edges are checked at intermediate positions, including diagonals.
export function findTapPath(start, target, walkable, { step = .32, limit = 9000, canTraverse = () => true } = {}) {
  const key = (x, z) => `${x},${z}`;
  const tx = Math.round((target.x - start.x) / step), tz = Math.round((target.z - start.z) / step);
  const pos = (x, z) => ({ x: start.x + x * step, z: start.z + z * step });
  const edge = (a, b) => {
    let previous=a;
    for (let i = 1; i <= 3; i++) {const next={x:a.x+(b.x-a.x)*i/3,z:a.z+(b.z-a.z)*i/3};if(!walkable(next.x,next.z)||!canTraverse(previous,next))return false;previous=next;}
    return true;
  };
  if (!walkable(target.x, target.z)) return null;
  const open = [{ x: 0, z: 0, g: 0, f: Math.hypot(tx, tz), parent: null }], best = new Map([[key(0, 0), 0]]);
  let count = 0;
  while (open.length && count++ < limit) {
    let idx = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[idx].f) idx = i;
    const n = open.splice(idx, 1)[0];
    if (n.g !== best.get(key(n.x, n.z))) continue;
    const p = pos(n.x, n.z);
    if (Math.hypot(p.x - target.x, p.z - target.z) <= step * 1.5 && edge(p, target)) {
      const path = [target]; for (let q = n; q.parent; q = q.parent) path.unshift(pos(q.x, q.z));
      const smooth = []; let cursor = start, index = 0;
      while (index < path.length) {
        let furthest = index;
        for (let j = index; j < path.length; j++) {
          const b = path[j], samples = Math.max(3, Math.ceil(Math.hypot(b.x-cursor.x, b.z-cursor.z) / .1));
          let clear = true,previous=cursor;
          for (let k = 1; k <= samples; k++) {const next={x:cursor.x+(b.x-cursor.x)*k/samples,z:cursor.z+(b.z-cursor.z)*k/samples};if(!walkable(next.x,next.z)||!canTraverse(previous,next)){clear=false;break;}previous=next;}
          if (clear) furthest = j;
        }
        cursor = path[furthest]; smooth.push(cursor); index = furthest + 1;
      }
      return smooth;
    }
    for (const [dx, dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
      const x = n.x + dx, z = n.z + dz;
      if (Math.abs(x) > 140 || Math.abs(z) > 140) continue;
      const g = n.g + Math.hypot(dx, dz), k = key(x, z);
      if ((best.get(k) ?? Infinity) <= g || !edge(p, pos(x, z))) continue;
      best.set(k, g); open.push({ x, z, g, f: g + Math.hypot(tx - x, tz - z), parent: n });
    }
  }
  return null;
}
