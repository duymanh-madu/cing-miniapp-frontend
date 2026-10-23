const PALETTES = [
  ['#56d5ff','#228be9','#1550a8'],['#b49aff','#8660ef','#5031a5'],
  ['#ffd879','#ffab32','#c66815'],['#7ff0bc','#31c98a','#13835d'],
  ['#ff9ac1','#ee5c93','#aa2c67'],['#ffae8c','#fb774a','#b43e26'],
];
const COLORS = PALETTES.map(([light,base,dark])=>Object.freeze({'--block-light':light,'--block-base':base,'--block-dark':dark}));
export function piecePalette(shapeId = '') {
  let hash=0;for(const char of String(shapeId)) hash=(hash*31+char.charCodeAt(0))>>>0;
  return COLORS[hash%COLORS.length];
}
export function celebrationForEvent(event) {
  if(event?.type==='rank_overtake') return {icon:'🚀',label:event.count>1?`Bứt phá! Vượt ${event.count} người`:`Bạn vừa vượt ${event.name || 'một đối thủ'}!`,voice:'Bứt phá!',priority:4};
  if(event?.type!=='piece_placed' || !(event.lineCount>0)) return null;
  if(event.perfectClear) return {icon:'🌟',label:'SẠCH BÀN!',voice:'Xuất sắc!',priority:5};
  if(event.lineCount>=3) return {icon:'💥',label:`TUYỆT ĐỈNH! ${event.lineCount} hàng`,voice:'Tuyệt đỉnh!',priority:4};
  if(event.comboAdvanced && event.combo>=3) return {icon:'🔥',label:`COMBO ×${event.combo}`,voice:event.combo%2?'Quá đỉnh!':'Tuyệt vời!',priority:3};
  if(event.lineCount>=2) return {icon:'⚡',label:'NƯỚC ĐI ĐẸP!',voice:'Đẹp lắm!',priority:2};
  return {icon:'✨',label:'ĐẸP LẮM!',voice:null,priority:1};
}
export function createBlockPuzzleVoice({ getHost = ()=>globalThis.window, now = Date.now } = {}) {
  let lastTime=-Infinity;let lastPriority=0;
  return {
    play(plan, preferences) {
      if(!plan?.voice || !preferences.voice || !preferences.sound || preferences.volume<=0 || globalThis.document?.hidden) return false;
      const host=getHost();if(!host?.speechSynthesis || !host.SpeechSynthesisUtterance) return false;
      if(now()-lastTime<6000 && plan.priority<=lastPriority) return false;
      try {
        const utterance=new host.SpeechSynthesisUtterance(plan.voice);
        utterance.lang='vi-VN';utterance.rate=1.08;utterance.volume=preferences.volume*.8;
        const voice=host.speechSynthesis.getVoices().find(item=>item.lang?.startsWith('vi'));
        if(voice) utterance.voice=voice;
        host.speechSynthesis.cancel();host.speechSynthesis.speak(utterance);
        lastTime=now();lastPriority=plan.priority;return true;
      } catch { return false; }
    },
    stop() {try {getHost()?.speechSynthesis?.cancel();} catch {}}
  };
}
export const blockPuzzleVoice = createBlockPuzzleVoice();
