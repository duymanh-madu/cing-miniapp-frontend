export const PLAZA_AVATARS = Object.freeze({
  boy: { model: 'cing-boy-v01.vrm', idle: 'cing-boy-idle.vrma', walk: 'cing-boy-walk.vrma', wave: 'cing-boy-wave.vrma', checkin: 'cing-boy-checkin.vrma', speed: 1.35, label: 'Boy' },
  girl: { model: 'cing-girl-v01.vrm', idle: 'cing-girl-idle.vrma', walk: 'cing-girl-walk.vrma', wave: 'cing-girl-wave.vrma', checkin: 'cing-girl-checkin.vrma', speed: 1.35, label: 'Girl' },
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
