export function installAppInteractionGuard(doc = document, win = window) {
  const editable = target => Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"],[contenteditable="plaintext-only"]'));
  let edge=false;
  const start = event => {
    edge = event.touches?.length === 1 && event.touches[0].clientX < 24;
    if(edge && !editable(event.target) && event.cancelable)event.preventDefault();
  };
  const move = event => {if(edge && event.cancelable)event.preventDefault();};
  const end = () => {edge=false;};
  const selection = event => {if(!editable(event.target))event.preventDefault();};
  const clear = () => {
    const selected=win.getSelection?.();
    if(selected?.rangeCount && !editable(selected.anchorNode?.parentElement))selected.removeAllRanges();
  };
  const options={capture:true,passive:false};
  doc.addEventListener('touchstart',start,options);doc.addEventListener('touchmove',move,options);
  doc.addEventListener('touchend',end,true);doc.addEventListener('touchcancel',end,true);
  for(const name of ['contextmenu','selectstart','copy','cut','dragstart'])doc.addEventListener(name,selection,true);
  doc.addEventListener('selectionchange',clear);
  return()=>{
    doc.removeEventListener('touchstart',start,options);doc.removeEventListener('touchmove',move,options);
    doc.removeEventListener('touchend',end,true);doc.removeEventListener('touchcancel',end,true);
    for(const name of ['contextmenu','selectstart','copy','cut','dragstart'])doc.removeEventListener(name,selection,true);
    doc.removeEventListener('selectionchange',clear);
  };
}
