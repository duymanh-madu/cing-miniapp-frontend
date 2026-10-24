// Load the official bridge ahead of gameplay, never await native calls on the move path.
let nativeVibrate=null, loading=null, failed=false, lastPulse=-Infinity;
export function prepareBlockPuzzleHaptics() {
  if (loading || !/Zalo/i.test(globalThis.navigator?.userAgent || '')) return loading;
  loading=import('zmp-sdk/apis').then(sdk=>{nativeVibrate=sdk.vibrate;}).catch(()=>{failed=true;});
  return loading;
}
export function nativeBlockPuzzleHaptic(event) {
  if (!nativeVibrate || failed || Date.now()-lastPulse<65) return false;
  lastPulse=Date.now();
  try {
    Promise.resolve(nativeVibrate({type:'oneShot',milliseconds:event.perfectClear?35:event.lineCount>0?22:8})).catch(()=>{failed=true;});
    return true;
  } catch { failed=true;return false; }
}
