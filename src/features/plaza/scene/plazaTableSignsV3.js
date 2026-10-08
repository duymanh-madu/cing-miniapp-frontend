import * as THREE from 'three';
import definitions from './plazaTablesV3.json';
export function createPlazaTableSignsV3(scene){
 const signs=new Map();
 for(const d of definitions){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false}));sprite.position.set(d.x,d.y+.9,d.z);sprite.scale.set(1.8,.56,1);sprite.visible=false;sprite.userData.plazaCollision=false;scene.add(sprite);signs.set(d.tableId,{sprite,canvas,texture,text:null});}
 return {update(tables=[]){for(const t of tables){const s=signs.get(t.tableId);if(!s)continue;const n=t.seats.filter(p=>p.role==='player').length;const text=t.gameName?`♟ ${t.gameName} · ${t.match?.phase==='active'?'Đang đấu':t.match?.phase==='finished'?'Đã kết thúc':`Chờ PK ${n}/2`}`:null;if(s.text===text)continue;s.text=text;s.sprite.visible=Boolean(text);if(text){const c=s.canvas.getContext('2d');c.clearRect(0,0,512,160);c.fillStyle='rgba(39,30,23,.92)';c.beginPath();c.roundRect(0,20,512,120,22);c.fill();c.fillStyle='#fff1cb';c.font='600 29px sans-serif';c.textAlign='center';c.fillText(text,256,91,480);s.texture.needsUpdate=true;}}}};
}
