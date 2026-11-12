import { PMREMGenerator } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// A generated render target has no CPU pixels to upload after context restoration.
export function createPlazaEnvironmentV27(renderer, {
  createGenerator = () => new PMREMGenerator(renderer),
  createRoom = () => new RoomEnvironment(),
} = {}) {
  let target = null, disposed = false;
  function restore() {
    if (disposed) return;
    const generator = createGenerator();
    let room, next;
    try {
      room = createRoom();
      next = generator.fromScene(room, 0.04);
    } finally {
      room?.dispose(); generator.dispose();
    }
    const previous = target;
    target = next;
    previous?.dispose();
  }
  restore();
  return {
    get texture() { return target?.texture || null; },
    restore,
    dispose() { if (disposed) return; disposed = true; target?.dispose(); target = null; },
  };
}
