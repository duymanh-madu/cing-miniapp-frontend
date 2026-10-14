export function installPlazaRoomTouchGuardV19(root) {
 function editable(target){return Boolean(target?.closest?.('input,textarea,select,[contenteditable="true"]'));}
 function touch(event){
  if(editable(event.target))return;
  // Keep scene gestures inside Plaza; do not disable chat input or vertical scrolling.
  event.stopPropagation();
  const t=event.touches?.[0],rect=root.getBoundingClientRect();
  if(event.type==='touchstart'&&t&&(t.clientX-rect.left<24||rect.right-t.clientX<24)&&event.cancelable)event.preventDefault();
 }
 function menu(event){if(!editable(event.target))event.preventDefault();}
 const options={passive:false};
 for(const name of ['touchstart','touchmove','touchend'])root.addEventListener(name,touch,options);
 root.addEventListener('contextmenu',menu);root.addEventListener('selectstart',menu);
 function clearSelection(){const selection=globalThis.getSelection?.();if(selection?.rangeCount&&!editable(selection.anchorNode?.parentElement)&&root.contains(selection.anchorNode))selection.removeAllRanges();}
 globalThis.document?.addEventListener('selectionchange',clearSelection);
 return()=>{for(const name of ['touchstart','touchmove','touchend'])root.removeEventListener(name,touch,options);root.removeEventListener('contextmenu',menu);root.removeEventListener('selectstart',menu);globalThis.document?.removeEventListener('selectionchange',clearSelection);};
}
