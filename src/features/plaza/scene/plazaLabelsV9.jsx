import React from 'react';
import {createRoot} from 'react-dom/client';
import * as THREE from 'three';
import TierBadge from '../../../membership/components/TierBadge.jsx';
import {injectTierBadgeStyles} from '../../../membership/components/TierBadgeStyles.js';
import {recentPlazaBubblesV9} from './plazaLabelScopeV9.js';
import '../pages/PlazaIdentityV9.css';
export function createPlazaLabelsV9(host){
 injectTierBadgeStyles();
 const layer=document.createElement('div');layer.className='plaza-v9-labels';layer.setAttribute('aria-hidden','true');host.appendChild(layer);
 const nodes=new Map();let messages=[],roomId=null;
 const projected=new THREE.Vector3(),offset=new THREE.Vector3(0,.18,0);
 function remove(id){const n=nodes.get(id);n.root.unmount();n.el.remove();nodes.delete(id);}
 return {
  setMessages(room,next){roomId=room;messages=next||[];},
  update(camera,anchors){
   const wanted=new Set(),bubbles=recentPlazaBubblesV9(messages,roomId,Date.now());
   for(const a of anchors.slice(0,30)){
    if(!a.memberId||!a.position)continue;wanted.add(a.memberId);
    let n=nodes.get(a.memberId);if(!n){const el=document.createElement('div');el.className='plaza-v9-nameplate';layer.appendChild(el);n={el,root:createRoot(el)};nodes.set(a.memberId,n);}
    const bubble=bubbles.get(a.memberId),name=String(a.displayName||'Cing iu').slice(0,80),key=JSON.stringify([name,a.selectedBadge,bubble?.messageId]);
    if(n.key!==key){n.key=key;n.root.render(<><div className="plaza-v9-speech" hidden={!bubble}>{bubble?.body}</div>{a.selectedBadge&&<div className="plaza-v9-title"><TierBadge tierKey={a.selectedBadge} isChampion={a.selectedBadge==='champion'} size="md" showLabel/></div>}<span className="plaza-v9-name">{name}</span></>);}
    projected.copy(a.position).add(offset).project(camera);
    const visible=projected.z>-1&&projected.z<1&&Math.abs(projected.x)<.98&&Math.abs(projected.y)<.98;
    n.el.hidden=!visible;
    if(visible){n.el.style.left=`${(projected.x*.5+.5)*100}%`;n.el.style.top=`${(-projected.y*.5+.5)*100}%`;n.el.style.zIndex=String(Math.round((1-projected.z)*1000));}
   }
   for(const id of nodes.keys())if(!wanted.has(id))remove(id);
  },
  dispose(){for(const id of [...nodes.keys()])remove(id);layer.remove();messages=[];}
 };
}
