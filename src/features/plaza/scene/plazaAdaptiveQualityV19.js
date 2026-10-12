/** Conservative dynamic pixel-density governor for mobile WebGL.
 * Never changes textures, shadows, model detail, gameplay or backend authority.
 * Requires sustained low FPS; restores sharpness only after sustained recovery.
 */
export function createPlazaAdaptiveQualityV19(initial,maxAllowed){
 let ratio=Math.max(1,Math.min(Number(initial)||1.5,Number(maxAllowed)||1.5));
 const ceiling=Math.max(ratio,Math.min(Number(maxAllowed)||ratio,1.85));
 const floor=Math.min(ratio,1.25);
 let low=0,good=0,lastChange=-Infinity;
 return {
  get ratio(){return ratio;},
  sample(fps,now){
   if(!Number.isFinite(fps)||!Number.isFinite(now)||fps<=0)return null;
   if(fps<42){low++;good=0;}
   else if(fps>=57){good++;low=0;}
   else {low=0;good=0;}
   if(now-lastChange<8000)return null;
   if(low>=4&&ratio>floor){ratio=Math.max(floor,Math.round((ratio-.10)*100)/100);low=0;lastChange=now;return ratio;}
   if(good>=9&&ratio<ceiling){ratio=Math.min(ceiling,Math.round((ratio+.10)*100)/100);good=0;lastChange=now;return ratio;}
   return null;
  },
  reset(){low=0;good=0;}
 };
}
