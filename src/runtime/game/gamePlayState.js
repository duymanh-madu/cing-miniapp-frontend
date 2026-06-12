let _isPlaying = false;
const listeners = new Set();

export function setGamePlaying(value) {
  _isPlaying = !!value;
  listeners.forEach(fn => fn(_isPlaying));
}

export function isGamePlaying() {
  return _isPlaying;
}

export function subscribeGamePlaying(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
