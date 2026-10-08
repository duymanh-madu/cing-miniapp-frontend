export const WALK_SPEED = 1.35;
export const BODY_RADIUS = 0.23;

export function isSolidObstacle(materialNames) {
  // Foliage is merged across distant beds in this GLB. Its bounding box spans
  // empty walkways, so it must not become an invisible wall around the player.
  return !materialNames.every(name => /foliage|leaf|flower|petal|pollen|soil|branch|medallion|mortar/i.test(name));
}

export function inputVector(keys) {
  let x = Number(keys.has('right')) - Number(keys.has('left'));
  let z = Number(keys.has('forward')) - Number(keys.has('back'));
  const length = Math.hypot(x, z);
  if (length > 1) { x /= length; z /= length; }
  return { x, z };
}

export function nextMotion(current, moving, waveRequested, waveFinished) {
  if (moving) return 'walk';
  if (waveRequested) return 'wave';
  if (current === 'wave' && !waveFinished) return 'wave';
  return 'idle';
}

export function overlapsBody(x, z, floorY, box, radius = BODY_RADIUS) {
  // Small steps are traversable; furniture and walls remain solid.
  if (box.maxY <= floorY + 0.24 || box.minY >= floorY + 1.45) return false;
  const dx = x - Math.max(box.minX, Math.min(box.maxX, x));
  const dz = z - Math.max(box.minZ, Math.min(box.maxZ, z));
  return dx * dx + dz * dz < radius * radius;
}

export function createObstacleIndex(boxes, cellSize = 2) {
  const cells = new Map();
  for (const box of boxes) {
    for (let x = Math.floor(box.minX / cellSize); x <= Math.floor(box.maxX / cellSize); x++) {
      for (let z = Math.floor(box.minZ / cellSize); z <= Math.floor(box.maxZ / cellSize); z++) {
        const key = `${x}:${z}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(box);
      }
    }
  }
  return (x, z, y) => {
    const seen = new Set();
    for (let cx = Math.floor((x - BODY_RADIUS) / cellSize); cx <= Math.floor((x + BODY_RADIUS) / cellSize); cx++) {
      for (let cz = Math.floor((z - BODY_RADIUS) / cellSize); cz <= Math.floor((z + BODY_RADIUS) / cellSize); cz++) {
        for (const box of cells.get(`${cx}:${cz}`) || []) {
          if (!seen.has(box) && overlapsBody(x, z, y, box)) return true;
          seen.add(box);
        }
      }
    }
    return false;
  };
}
