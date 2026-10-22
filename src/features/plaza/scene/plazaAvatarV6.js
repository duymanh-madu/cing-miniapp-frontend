export const PLAZA_AVATARS = Object.freeze({
  boy: { model: 'v30/cing-boy-modular-v30.vrm', idle: 'cing-boy-idle.vrma', walk: 'v8/cing-boy-walk-v8.vrma', wave: 'v28/cing-boy-wave-idle-v28.vrma', checkin: 'cing-boy-checkin.vrma', speed: 1.50, walkAuthoredSpeed: 1.35, label: 'Boy' },
  girl: { model: 'v32/cing-girl-modular-v32.vrm', idle: 'cing-girl-idle.vrma', walk: 'v7/cing-girl-walk-v7.vrma', wave: 'cing-girl-wave.vrma', checkin: 'v7/cing-girl-checkin-v7.vrma', speed: 1.50, walkAuthoredSpeed: 1.35, label: 'Girl' },
});
export function nextAvatarMotion(current, moving, requested, finished) {
  if (moving) return 'walk';
  if (requested) return requested;
  if ((current === 'wave' || current === 'checkin') && !finished) return current;
  return 'idle';
}
export function girlExpression(time, gesture) {
  const phase = ((time % 4.3) + 4.3) % 4.3;
  return { blink: phase < .16 ? Math.sin(Math.PI * phase / .16) ** 2 : 0, happy: gesture === 'wave' || gesture === 'checkin' ? .18 : .035 };
}

// Authored foot speed is independent of the configured world travel speed.
export function plazaWalkPlaybackRate(config, speed) {
  return Math.min(1.25, speed / config.walkAuthoredSpeed);
}
