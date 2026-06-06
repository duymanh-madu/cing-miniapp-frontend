import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import ChessLeaderboard from "./ChessLeaderboard";

// Bộ emoji trân châu đen độc quyền — SVG data URIs

const GIFTS = [
  { id:"cafe_nau",    name:"Cà phê nâu",              icon:"☕", points:5,   charm:5,   grad:"linear-gradient(135deg,rgba(101,67,33,0.3),rgba(101,67,33,0.08))",  color:"#c8a060" },
  { id:"chanh_tuyet", name:"Chanh tuyết bạc hà",      icon:"🥤", points:10,  charm:10,  grad:"linear-gradient(135deg,rgba(100,200,150,0.2),rgba(100,200,150,0.05))", color:"#60e090" },
  { id:"olong_khoi",  name:"Ô long khói rang",         icon:"🍵", points:20,  charm:20,  grad:"linear-gradient(135deg,rgba(80,60,40,0.3),rgba(80,60,40,0.08))",   color:"#c09060" },
  { id:"tra_sen",     name:"Trà sen vàng",             icon:"🪷", points:50,  charm:50,  grad:"linear-gradient(135deg,rgba(255,200,50,0.2),rgba(255,200,50,0.05))", color:"#ffd060" },
  { id:"sua_tuoi",    name:"Sữa tươi nướng TCDD",     icon:"🧋", points:100, charm:100, grad:"linear-gradient(135deg,rgba(212,83,28,0.25),rgba(212,83,28,0.06))", color:"#D4531C" },
];

const PEARL_EMOJIS = [
  { id:'laugh',  label:'Cười vỡ bụng',      color:'#c8f0ff' },
  { id:'king',   label:'Nước đi của vua',    color:'#FFD700' },
  { id:'cry',    label:'Thua đau lòng',      color:'#64b5f6' },
  { id:'love',   label:'Yêu nước đi này',    color:'#ff6b9d' },
  { id:'cold',   label:'Ông không quan tâm', color:'#a8edff' },
  { id:'dizzy',  label:'Choáng toàn tập',    color:'#c8f0ff' },
  { id:'rage',   label:'Điên tiết rồi',      color:'#ff4444' },
  { id:'cool',   label:'Đại cao thủ',        color:'#00ff88' },
  { id:'think',  label:'Mưu sâu kế hiểm',   color:'#64b5f6' },
  { id:'rip',    label:'GG thua trắng tay',  color:'#c8f0ff' },
];

// Vẽ pearl emoji lên canvas và trả về data URL
function drawPearlEmoji(id, size=144) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const s = c.getContext('2d');
  const S = size;

  function bg(c1,c2){
    const g=s.createRadialGradient(S*.37,S*.3,S*.02,S*.5,S*.5,S*.5);
    g.addColorStop(0,c1);g.addColorStop(.45,'#0d0d1e');g.addColorStop(1,c2);
    s.beginPath();s.arc(S/2,S/2,S*.46,0,Math.PI*2);s.fillStyle=g;s.fill();
    s.beginPath();s.arc(S/2,S/2,S*.46,0,Math.PI*2);
    s.strokeStyle='rgba(168,237,255,0.12)';s.lineWidth=1;s.stroke();
  }
  function shine(col){
    s.beginPath();s.ellipse(S*.36,S*.3,S*.14,S*.08,-.3,0,Math.PI*2);
    s.fillStyle=col||'rgba(255,255,255,0.2)';s.fill();
    s.beginPath();s.ellipse(S*.3,S*.26,S*.05,S*.03,-.3,0,Math.PI*2);
    s.fillStyle='rgba(255,255,255,0.32)';s.fill();
  }
  function eye(cx,cy,iris){
    s.beginPath();s.ellipse(cx*S,cy*S,S*.08,S*.09,0,0,Math.PI*2);s.fillStyle='Top 050508';s.fill();
    s.beginPath();s.ellipse(cx*S,cy*S,S*.055,S*.065,0,0,Math.PI*2);s.fillStyle=iris;s.fill();
    s.beginPath();s.ellipse((cx-.02)*S,(cy-.025)*S,S*.022,S*.018,0,0,Math.PI*2);s.fillStyle='white';s.globalAlpha=.9;s.fill();s.globalAlpha=1;
  }
  function brow(x1,y1,x2,y2,col,w){
    s.beginPath();s.moveTo(x1*S,y1*S);s.lineTo(x2*S,y2*S);
    s.strokeStyle=col;s.lineWidth=w||2;s.lineCap='round';s.stroke();
  }
  function mouth(x1,y1,x2,y2,mx,my,fill,inner){
    s.beginPath();s.moveTo(x1*S,y1*S);s.quadraticCurveTo(mx*S,my*S,x2*S,y2*S);s.quadraticCurveTo(mx*S,(my-.08)*S,x1*S,y1*S);s.fillStyle=fill;s.fill();
    s.beginPath();s.moveTo(x1*S,y1*S);s.quadraticCurveTo(mx*S,(my-.04)*S,x2*S,y2*S);s.fillStyle=inner;s.fill();
  }
  function heart(cx,cy,size,col){
    const r=size*S;s.save();s.translate(cx*S,cy*S);
    s.beginPath();s.moveTo(0,-r*.3);s.bezierCurveTo(r*.5,-r*1.,r*1.1,-r*.3,0,r*.7);s.bezierCurveTo(-r*1.1,-r*.3,-r*.5,-r*1.,0,-r*.3);
    s.fillStyle=col;s.fill();s.restore();
  }
  function bigTear(cx,cy,col){
    s.beginPath();s.moveTo(cx*S,(cy-.02)*S);
    s.bezierCurveTo((cx-.04)*S,(cy+.04)*S,(cx-.05)*S,(cy+.1)*S,cx*S,(cy+.14)*S);
    s.bezierCurveTo((cx+.05)*S,(cy+.1)*S,(cx+.04)*S,(cy+.04)*S,cx*S,(cy-.02)*S);
    s.fillStyle=col;s.globalAlpha=.75;s.fill();s.globalAlpha=1;
  }
  function spiral(cx,cy,col){
    s.beginPath();s.arc(cx*S,cy*S,S*.1,0,Math.PI*2);s.fillStyle='Top 050508';s.fill();
    for(let i=0;i<3;i++){s.beginPath();s.arc(cx*S,cy*S,S*(.03+i*.025),0,Math.PI*1.7);s.strokeStyle=col;s.lineWidth=1.5;s.globalAlpha=.8-i*.2;s.stroke();s.globalAlpha=1;}
  }
  function xEye(cx,cy,col){
    [[1,1],[-1,1]].forEach(([a,b])=>{s.beginPath();s.moveTo((cx-.07*a)*S,(cy-.07*b)*S);s.lineTo((cx+.07*a)*S,(cy+.07*b)*S);s.strokeStyle=col;s.lineWidth=2.5;s.lineCap='round';s.stroke();});
  }
  function eyeAngry(cx,cy,col){
    s.beginPath();s.ellipse(cx*S,cy*S,S*.08,S*.085,0,0,Math.PI*2);s.fillStyle='#2a0000';s.fill();
    s.beginPath();s.ellipse(cx*S,cy*S,S*.055,S*.06,0,0,Math.PI*2);s.fillStyle=col;s.fill();
  }
  function sunglasses(lens,frame){
    [.3,.7].forEach(cx=>{
      s.beginPath();s.ellipse(cx*S,.47*S,S*.12,S*.09,0,0,Math.PI*2);s.fillStyle=lens;s.fill();s.strokeStyle=frame;s.lineWidth=2;s.stroke();
    });
    s.beginPath();s.moveTo(.42*S,.47*S);s.lineTo(.58*S,.47*S);s.strokeStyle=frame;s.lineWidth=2;s.stroke();
    [.18,.82].forEach(x=>{s.beginPath();s.moveTo(x*S,.45*S);s.lineTo(x*S,.38*S);s.strokeStyle=frame;s.lineWidth=2;s.lineCap='round';s.stroke();});
  }
  function star(cx,cy,sz,col){
    const n=5,r1=sz*S,r2=r1*.4;s.beginPath();
    for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=Math.PI*i/n-Math.PI/2;i?s.lineTo(cx*S+r*Math.cos(a),cy*S+r*Math.sin(a)):s.moveTo(cx*S+r*Math.cos(a),cy*S+r*Math.sin(a));}
    s.closePath();s.fillStyle=col;s.fill();
  }
  function smoke(col){
    [.3,.5,.7].forEach(cx=>{s.beginPath();s.moveTo(cx*S,.15*S);s.bezierCurveTo((cx-.04)*S,.09*S,(cx+.04)*S,.05*S,cx*S,.01*S);s.strokeStyle=col;s.lineWidth=2.5;s.lineCap='round';s.globalAlpha=.7;s.stroke();s.globalAlpha=1;});
  }
  function tombstone(cx,cy,sz,col){
    s.beginPath();s.moveTo((cx-sz/2)*S,(cy-sz*.7+sz)*S);s.lineTo((cx-sz/2)*S,(cy-sz*.7+sz*.4)*S);s.arc(cx*S,(cy-sz*.7+sz*.4)*S,sz/2*S,Math.PI,0);s.lineTo((cx+sz/2)*S,(cy-sz*.7+sz)*S);s.closePath();
    s.fillStyle='#1a1a3e';s.fill();s.strokeStyle=col;s.lineWidth=1;s.stroke();
    s.font=`${S*.065}px sans-serif`;s.fillStyle=col;s.textAlign='center';s.textBaseline='middle';s.fillText('RIP',cx*S,(cy-sz*.1)*S);
  }

  const draws = {
    laugh(){
      bg('#1a1a3e','#05050d');shine();
      s.beginPath();s.arc(.3*S,.47*S,.11*S,0,Math.PI);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      s.beginPath();s.arc(.7*S,.47*S,.11*S,0,Math.PI);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      s.beginPath();s.ellipse(.2*S,.58*S,S*.1,S*.06,0,0,Math.PI*2);s.fillStyle='rgba(255,120,160,0.5)';s.fill();
      s.beginPath();s.ellipse(.8*S,.58*S,S*.1,S*.06,0,0,Math.PI*2);s.fillStyle='rgba(255,120,160,0.5)';s.fill();
      mouth(.26,.64,.74,.64,.5,.82,'#ffe4a0','#1a0800');
      // nước mắt 2 bên
      [[.22,.49,.14,.7],[.78,.49,.86,.7]].forEach(([x1,y1,x2,y2])=>{
        s.beginPath();s.moveTo(x1*S,y1*S);s.bezierCurveTo((x1+(x2>x1?.04:-.04))*S,(y1+.06)*S,(x2+(x2>x1?.02:-.02))*S,(y2-.08)*S,x2*S,y2*S);
        s.strokeStyle='#64b5f6';s.lineWidth=2.5;s.lineCap='round';s.stroke();
        s.beginPath();s.ellipse(x2*S,(y2+.02)*S,S*.025,S*.032,0,0,Math.PI*2);s.fillStyle='#64b5f6';s.globalAlpha=.8;s.fill();s.globalAlpha=1;
      });
    },
    king(){
      bg('#2a1a0e','#05050d');shine();
      // vương miện lộng lẫy
      s.beginPath();s.moveTo(.14*S,.36*S);s.lineTo(.14*S,.22*S);s.lineTo(.25*S,.32*S);s.lineTo(.36*S,.14*S);s.lineTo(.5*S,.26*S);s.lineTo(.64*S,.14*S);s.lineTo(.75*S,.32*S);s.lineTo(.86*S,.22*S);s.lineTo(.86*S,.36*S);s.closePath();
      const gk=s.createLinearGradient(0,.14*S,0,.36*S);gk.addColorStop(0,'#FFF3a0');gk.addColorStop(.3,'#FFD700');gk.addColorStop(.7,'#e6a800');gk.addColorStop(1,'#8B6914');
      s.fillStyle=gk;s.fill();s.strokeStyle='rgba(255,255,200,0.6)';s.lineWidth=1;s.stroke();
      s.beginPath();s.rect(.14*S,.34*S,.72*S,.05*S);const gb=s.createLinearGradient(0,.34*S,0,.39*S);gb.addColorStop(0,'#FFD700');gb.addColorStop(1,'#8B6914');s.fillStyle=gb;s.fill();
      [[.5,.13,.045,'#FF6B35'],[.36,.13,.032,'#ff3366'],[.64,.13,.032,'#ff3366'],[.25,.27,.025,'#00d4ff'],[.75,.27,.025,'#00d4ff']].forEach(([x,y,r,c])=>{
        s.beginPath();s.moveTo(x*S,(y-r)*S);s.lineTo((x+r*.8)*S,y*S);s.lineTo(x*S,(y+r)*S);s.lineTo((x-r*.8)*S,y*S);s.closePath();s.fillStyle=c;s.fill();s.strokeStyle='rgba(255,255,255,0.5)';s.lineWidth=.8;s.stroke();
      });
      for(let i=0;i<5;i++){s.beginPath();s.arc((.22+i*.14)*S,.36*S,2.5,0,Math.PI*2);s.fillStyle='#FFF3a0';s.fill();}
      eye(.32,.54,'#1a3a7a');eye(.68,.54,'#1a3a7a');
      brow(.22,.47,.38,.44,'#FFD700',2.2);brow(.62,.44,.78,.47,'#FFD700',2.2);
      s.beginPath();s.moveTo(.3*S,.7*S);s.quadraticCurveTo(.5*S,.78*S,.7*S,.7*S);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
    },
    cry(){
      bg('#0a1a3e','#05050d');shine();
      brow(.22,.38,.38,.44,'#c8f0ff',2.5);brow(.62,.44,.78,.38,'#c8f0ff',2.5);
      s.beginPath();s.arc(.32*S,.5*S,.1*S,Math.PI,0);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      s.beginPath();s.arc(.68*S,.5*S,.1*S,Math.PI,0);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      bigTear(.28,.55,'#64b5f6');bigTear(.72,.55,'#64b5f6');
      s.beginPath();s.moveTo(.28*S,.72*S);s.quadraticCurveTo(.4*S,.68*S,.5*S,.71*S);s.quadraticCurveTo(.6*S,.74*S,.72*S,.7*S);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
    },
    love(){
      bg('#2e0a2e','#05050d');shine();
      heart(.32,.49,.14,'#ff6b9d');heart(.68,.49,.14,'#ff6b9d');
      s.beginPath();s.ellipse(.18*S,.6*S,S*.1,S*.065,0,0,Math.PI*2);s.fillStyle='rgba(255,80,140,0.5)';s.fill();
      s.beginPath();s.ellipse(.82*S,.6*S,S*.1,S*.065,0,0,Math.PI*2);s.fillStyle='rgba(255,80,140,0.5)';s.fill();
      mouth(.26,.68,.74,.68,.5,.82,'#ffe4a0','#2a0015');
    },
    cold(){
      bg('#0a0a1a','#05050d');
      s.beginPath();s.ellipse(S*.36,S*.3,S*.14,S*.08,-.3,0,Math.PI*2);s.fillStyle='rgba(255,255,255,0.06)';s.fill();
      [.32,.68].forEach(cx=>{
        s.beginPath();s.ellipse(cx*S,.46*S,S*.075,S*.08,0,0,Math.PI*2);s.fillStyle='Top 050508';s.fill();
        s.beginPath();s.rect((cx-.09)*S,.38*S,S*.18,S*.06);s.fillStyle='#0d0d1e';s.fill();
        s.beginPath();s.ellipse(cx*S,.47*S,S*.04,S*.045,0,0,Math.PI*2);s.fillStyle='#1a2030';s.fill();
        s.beginPath();s.ellipse((cx-.015)*S,.455*S,S*.015,S*.012,0,0,Math.PI*2);s.fillStyle='rgba(200,240,255,0.4)';s.fill();
        s.beginPath();s.moveTo((cx-.075)*S,.41*S);s.lineTo((cx+.075)*S,.41*S);s.strokeStyle='rgba(200,240,255,0.35)';s.lineWidth=1.5;s.lineCap='round';s.stroke();
      });
      s.beginPath();s.moveTo(.23*S,.36*S);s.lineTo(.41*S,.36*S);s.strokeStyle='rgba(200,240,255,0.3)';s.lineWidth=2;s.lineCap='round';s.stroke();
      s.beginPath();s.moveTo(.59*S,.36*S);s.lineTo(.77*S,.36*S);s.strokeStyle='rgba(200,240,255,0.3)';s.lineWidth=2;s.lineCap='round';s.stroke();
      s.beginPath();s.moveTo(.28*S,.68*S);s.lineTo(.72*S,.68*S);s.strokeStyle='rgba(200,240,255,0.4)';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      [.4,.5,.6].forEach(x=>{s.beginPath();s.arc(x*S,.78*S,2.5,0,Math.PI*2);s.fillStyle='rgba(200,240,255,0.3)';s.fill();});
    },
    dizzy(){
      bg('#1a0a2e','#05050d');shine();
      spiral(.32,.47,'#c8f0ff');spiral(.68,.47,'#c8f0ff');
      s.beginPath();s.ellipse(.5*S,.7*S,.1*S,.08*S,0,0,Math.PI*2);s.fillStyle='#1a0800';s.fill();
      s.beginPath();s.ellipse(.5*S,.69*S,.08*S,.05*S,0,0,Math.PI*2);s.fillStyle='#e74c3c';s.fill();
      [0,1,2].forEach(i=>{const a=-Math.PI/2+i*Math.PI*2/3;star(.5+.44*Math.cos(a),.18+.12*Math.sin(a),.04,'#FFD700');});
    },
    rage(){
      bg('#2e0a0a','#05050d');shine('rgba(255,80,80,0.12)');smoke('#ff6b35');
      s.beginPath();s.moveTo(.2*S,.42*S);s.lineTo(.38*S,.38*S);s.lineTo(.46*S,.42*S);s.strokeStyle='#ffb3b3';s.lineWidth=3;s.lineJoin='round';s.stroke();
      s.beginPath();s.moveTo(.8*S,.42*S);s.lineTo(.62*S,.38*S);s.lineTo(.54*S,.42*S);s.strokeStyle='#ffb3b3';s.lineWidth=3;s.lineJoin='round';s.stroke();
      eyeAngry(.32,.5,'#ff4444');eyeAngry(.68,.5,'#ff4444');
      s.beginPath();s.moveTo(.28*S,.68*S);s.quadraticCurveTo(.5*S,.62*S,.72*S,.68*S);s.strokeStyle='#ffb3b3';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      for(let i=0;i<5;i++){const x=(.31+i*.09)*S;s.beginPath();s.moveTo(x,.67*S);s.lineTo(x,.62*S);s.strokeStyle='#ffb3b3';s.lineWidth=1.2;s.stroke();}
    },
    cool(){
      bg('#0a0a1e','#05050d');shine();
      s.beginPath();s.moveTo(.15*S,.48*S);s.quadraticCurveTo(.18*S,.2*S,.5*S,.18*S);s.quadraticCurveTo(.82*S,.2*S,.85*S,.48*S);s.fillStyle='#0a0a1e';s.fill();
      sunglasses('#001a0a','#00ff88');
      s.beginPath();s.moveTo(.36*S,.71*S);s.quadraticCurveTo(.5*S,.78*S,.66*S,.7*S);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      star(.82,.52,.045,'#FFD700');
    },
    think(){
      bg('#0a1a2e','#05050d');shine();
      // mắt nhìn lên
      [.32,.68].forEach(cx=>{
        s.beginPath();s.ellipse(cx*S,.51*S,S*.09,S*.1,0,0,Math.PI*2);s.fillStyle='Top 050508';s.fill();
        s.beginPath();s.ellipse((cx-.04)*S,.45*S,S*.055,S*.065,0,0,Math.PI*2);s.fillStyle='#0a2a6a';s.fill();
        s.beginPath();s.ellipse((cx-.06)*S,.435*S,S*.022,S*.018,0,0,Math.PI*2);s.fillStyle='white';s.globalAlpha=.9;s.fill();s.globalAlpha=1;
      });
      brow(.22,.4,.38,.44,'#c8f0ff',2);brow(.62,.42,.78,.4,'#c8f0ff',1.5);
      s.beginPath();s.moveTo(.5*S,.82*S);s.quadraticCurveTo(.3*S,.78*S,.28*S,.62*S);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      s.beginPath();s.arc(.72*S,.22*S,S*.1,0,Math.PI*2);s.fillStyle='#1a2a4a';s.fill();s.strokeStyle='#c8f0ff';s.lineWidth=1;s.stroke();
      s.font=`${S*.1}px sans-serif`;s.fillStyle='#c8f0ff';s.textAlign='center';s.textBaseline='middle';s.fillText('?',.72*S,.22*S);
    },
    rip(){
      bg('#0a0a1e','#05050d');shine();
      s.beginPath();s.ellipse(.5*S,.18*S,.14*S,.05*S,0,0,Math.PI*2);s.strokeStyle='rgba(200,240,255,0.6)';s.lineWidth=2;s.stroke();
      xEye(.32,.47,'#c8f0ff');xEye(.68,.47,'#c8f0ff');
      s.beginPath();s.moveTo(.3*S,.68*S);s.quadraticCurveTo(.5*S,.61*S,.7*S,.68*S);s.strokeStyle='#c8f0ff';s.lineWidth=2.5;s.lineCap='round';s.stroke();
      tombstone(.78,.62,.14,'#c8f0ff');
    },
  };
  draws[id]?.();
  return c.toDataURL();
}

const GAME_SERVER = import.meta.env.VITE_GAME_SERVER_URL || "https://cing-backend-production.up.railway.app";

// SVG quân cờ Staunton style — đẹp, có chiều sâu
function ChessPiece({ type, color }) {
  const w = color === "w";
  const fill   = w ? "#FFFDE7" : "#1a1208";
  const stroke = w ? "Top 555"    : "Top 000";
  const hi     = w ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.08)";

  const pieces = {
    p: ( // Tốt
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
          <path d="M22.5 19c-3.5 0-6 2-6 4.5v1c0 1.5 1 3 3 3h6c2 0 3-1.5 3-3v-1c0-2.5-2.5-4.5-6-4.5z"/>
          <path d="M15 36h15M16 32.5h13" strokeWidth="2"/>
          <path d="M16.5 32.5c0-1.5 1.5-2.5 6-2.5s6 1 6 2.5" fill={fill}/>
        </g>
        <path d="M22.5 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" fill={hi}/>
      </svg>
    ),
    r: ( // Xe
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12z" strokeLinecap="butt"/>
          <path d="M11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
          <path d="M34 14l-3 3H14l-3-3"/>
          <path d="M31 17v12.5H14V17" strokeLinecap="butt"/>
          <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
          <path d="M11 14h23" strokeLinejoin="miter"/>
        </g>
        <rect x="13" y="10" width="2" height="3" fill={hi} rx="0.5"/>
        <rect x="21.5" y="10" width="2" height="3" fill={hi} rx="0.5"/>
        <rect x="30" y="10" width="2" height="3" fill={hi} rx="0.5"/>
      </svg>
    ),
    n: ( // Mã
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
          <path d="M24 18c.38 5.12-5 9.5-9.5 9.5-4.67 0-9.44-4.33-9.5-9.5.13-2.38 1.28-3.26 2.5-4 2.5-1.5 5.88-.5 7.5 2"/>
          <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z" fill={stroke} stroke={stroke}/>
          <path d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 6.9 4.05 1.5 1.9 1.5 3.9.8 5.5-.5 2-2.5 3.5-5 4.5-2 .8-5 1-7.8 1-3.8 0-7.7-1.5-8.5-4.5a5.5 5.5 0 0 1 2-5.5" fill={fill}/>
        </g>
        <path d="M24 12c2 1 5 3 6 5" stroke={hi} strokeWidth="1" fill="none"/>
      </svg>
    ),
    b: ( // Tượng
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <g fill={fill} strokeLinecap="butt">
            <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.354.49-2.323.47-3-.5 1.354-1.94 3-2 3-2z"/>
            <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
            <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
          </g>
          <path d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5" strokeLinejoin="miter"/>
        </g>
        <path d="M22.5 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill={hi}/>
      </svg>
    ),
    q: ( // Hậu
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6" cy="12" r="2.75"/>
          <circle cx="14" cy="9" r="2.75"/>
          <circle cx="22.5" cy="8" r="2.75"/>
          <circle cx="31" cy="9" r="2.75"/>
          <circle cx="39" cy="12" r="2.75"/>
          <path d="M9 26c8.5-8.5 15.5-8.5 27 0l2.5-12.5L31 25l-.3-14.1-8.2 13.7-8.2-13.7L14 25 6.5 13.5 9 26z" strokeLinecap="butt"/>
          <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z" strokeLinecap="butt"/>
          <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0"/>
        </g>
      </svg>
    ),
    k: ( // Vua
      <svg viewBox="0 0 45 45" width="100%" height="100%">
        <g fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.5 11.63V6M20 8h5" strokeWidth="1.5"/>
          <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill={fill}/>
          <path d="M12.5 37c5.5 3.5 14.5 3.5 20 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-3.5-6 1c-.5 4.5 6 7 6 7v13" strokeLinecap="butt"/>
          <path d="M12.5 30c5.5-3 14.5-3 20 0M12.5 33.5c5.5-3 14.5-3 20 0M12.5 37c5.5-3 14.5-3 20 0"/>
        </g>
        <path d="M22.5 7c1 0 2 1 2 2s-1 2-2 2-2-1-2-2 1-2 2-2z" fill={hi}/>
      </svg>
    ),
  };

  return pieces[type] || null;
}

// Màu quân cờ
const LIGHT_SQ = "#F0D9B5";
const DARK_SQ  = "#B58863";
const LIGHT_HL = "#F6F669";
const DARK_HL  = "#BACA2B";
const LIGHT_MV = "#CDD16E";
const DARK_MV  = "#AABA4B";

// Unicode quân cờ đẹp
const PIECES = {
  wK:"♔", wQ:"♕", wR:"♖", wB:"♗", wN:"♘", wP:"♙",
  bK:"♚", bQ:"♛", bR:"♜", bB:"♝", bN:"♞", bP:"♟",
};

const PIECE_COLORS = { w:"#FFFDE7", b:"Top 212121" };
const PIECE_SHADOW = { w:"rgba(0,0,0,0.5)", b:"rgba(255,255,255,0.15)" };

export default function ChessGame({ onExit, onFindMatch }) {
  const navigate = useNavigate();
  const profile  = useAuthStore(s => s.profile);
  const runtimeIdentity = useRuntimeCustomerIdentityStore(s => s.identity);
  
  const userId = (() => {
    for (const src of [runtimeIdentity?.phone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return ""; // Không dùng UUID — phải là phone
  })();
  const userName = runtimeIdentity?.fullName || profile?.name || profile?.zalo_name || profile?.displayName || "Cing iu";
  const userAvatar = runtimeIdentity?.avatar || profile?.avatar || "";

  const sockRef  = useRef(null);
  const [phase,  setPhase]  = useState("lobby"); // lobby | searching | playing | gameover
  const [chess,  setChess]  = useState(new Chess());
  const [myColor,setMyColor]= useState("w");
  const [gameId, setGameId] = useState(null);
  const [opponent,setOpponent]=useState(null);
  const [selected,setSelected]=useState(null);
  const [legalMoves,setLegalMoves]=useState([]);
  const [lastMove,setLastMove]=useState(null);
  const [inCheck,setInCheck]=useState(false);
  const [gameOver,setGameOver]=useState(null);
  const [searchTime,setSearchTime]=useState(0);
  const [msg,setMsg]=useState("");
  const [showLB,setShowLB]=useState(false);
  const timerRef    = useRef(null);
  const moveTimerRef  = useRef(null);
  const myReserveRef  = useRef(60);
  const gameIdRef     = useRef(null);
  const userIdRef     = useRef(null);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput,    setChatInput]    = useState("");
  const [showChat,     setShowChat]     = useState(false);
  const [showEmoji,    setShowEmoji]    = useState(false);
  const [showTip,      setShowTip]      = useState(false);
  const [floatEmoji,   setFloatEmoji]   = useState(null); // {emoji, fromMe}
  const [tipResult,    setTipResult]    = useState(null); // {amount, fromMe}
  const [unreadCount,  setUnreadCount]  = useState(0);
  const chatEndRef = useRef(null);


  const [myReserve,  setMyReserve]  = useState(60);
  const [oppReserve, setOppReserve] = useState(60);
  const [moveTimer,  setMoveTimer]  = useState(30);

  // Socket connection
  useEffect(() => {
    const s = io(`${GAME_SERVER}/chess`, {
      transports:["websocket"],
      reconnection:true,
    });
    sockRef.current = s;

    s.on("chess:searching", () => {
      setPhase("searching");
      setSearchTime(0);
    });

    s.on("chess:matched", (data) => {
      clearInterval(timerRef.current);
      clearInterval(moveTimerRef.current);
      // Trừ lượt chơi đúng lúc — khi đã tìm được đối thủ
      const phone = userIdRef.current;
      if (phone) {
        fetch((import.meta.env.VITE_API_BASE_URL||"https://cing-backend-production.up.railway.app/api")+"/game/use-play",
          { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ user_id: phone, game_name: "Kỳ thủ cờ vua" }) }
        ).catch(()=>{});
      }
      const c = new Chess();
      setChess(c);
      setMyColor(data.myColor);
      setGameId(data.gameId);
      setOpponent(data.myColor === "w" ? data.black : data.white);
      setSelected(null);
      setLegalMoves([]);
      setLastMove(null);
      setInCheck(false);
      setGameOver(null);
      // Reset timer cho ván mới
      myReserveRef.current = 60;
      gameIdRef.current = data.gameId;
      setMyReserve(60);
      setOppReserve(60);
      setMoveTimer(30);
      setPhase("playing");
    });

    s.on("chess:moved", (data) => {
      setChess(prev => {
        const c = new Chess(data.fen);
        return c;
      });
      setLastMove(data.lastMove);
      setInCheck(data.inCheck);
      setSelected(null);
      setLegalMoves([]);
    });

    s.on("chess:gameover", (data) => {
      setGameOver(data);
      setPhase("gameover");
      clearInterval(timerRef.current);
      clearInterval(moveTimerRef.current);
      // Save score
      try {
        const sources = [
          useRuntimeCustomerIdentityStore?.getState()?.identity?.phone,
          profile?.phone,
        ];
        let uid = "";
        for (const src of sources) {
          if (!src || src === "pending") continue;
          const n = src.replace(/\D/g,"").replace(/^84/,"0");
          if (n.length >= 9) { uid = n; break; }
        }
        if (!uid) uid = profile?.id || "";
        if (uid) {
          const won  = data?.winner === userId;
          const draw = !data?.winner;
          const score = won ? 3 : draw ? 1 : 0;
          fetch((import.meta.env.VITE_API_BASE_URL || "https://cing-backend-production.up.railway.app/api") + "/game/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              game_key: "chess", user_id: uid, score,
              player_name: profile?.name || userName,
              avatar: profile?.avatar || userAvatar,
            }),
          }).catch(() => {});
        }
      } catch(e) {}
    });

    s.on("chess:timeout", () => {
      clearInterval(timerRef.current);
      setPhase("lobby");
      setMsg("Không tìm được đối thủ. Thử lại sau!");
      setTimeout(() => setMsg(""), 4000);
    });

    s.on("chess:cancelled", () => {
      clearInterval(timerRef.current);
      setPhase("lobby");
    });

    s.on("chess:error", ({ message }) => setMsg(message));

    s.on("chess:emoji", ({ userId: fromId, emoji }) => {
      setFloatEmoji({ emoji, fromMe: fromId === userIdRef.current });
      setTimeout(() => setFloatEmoji(null), 2500);
    });

    s.on("chess:tip_received", ({ fromUserId, toUserId, amount, giftId, giftName, giftIcon, charm }) => {
      const fromMe = fromUserId === userIdRef.current;
      setTipResult({ amount, charm, fromMe, giftId, giftName, giftIcon });
      setTimeout(() => setTipResult(null), 4000);
    });

    // Chat
    s.on("chess:chat", (data) => {
      setChatMessages(prev => [...prev, data]);
      setUnreadCount(prev => showChat ? 0 : prev + 1);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior:"smooth" }), 50);
    });




    return () => { s.disconnect(); clearInterval(timerRef.current); };
  }, []);

  // Search timer
  useEffect(() => {
    if (phase === "searching") {
      timerRef.current = setInterval(() => setSearchTime(t => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Move timer 30s + reserve 60s
  useEffect(() => {
    if (phase !== "playing") return;
    const myTurn = chess.turn() === myColor;
    clearInterval(moveTimerRef.current);
    setMoveTimer(30);

    if (myTurn) {
      let move = 30;
      moveTimerRef.current = setInterval(() => {
        if (move > 1) {
          move--;
          setMoveTimer(move);
        } else {
          // Hết 30s → dùng reserve
          myReserveRef.current = myReserveRef.current - 1;
          setMyReserve(myReserveRef.current);
          if (myReserveRef.current <= 0) {
            // Hết reserve → thua
            clearInterval(moveTimerRef.current);
            sockRef.current?.emit("chess:resign", {
              gameId: gameIdRef.current,
              userId: userIdRef.current || userId,
            });
          }
        }
      }, 1000);
    }
    return () => clearInterval(moveTimerRef.current);
  }, [chess, phase, myColor]);

  // Sync refs
  userIdRef.current = userId;

  // Send chat
  const sendChat = () => {
    if (!chatInput.trim() || !gameIdRef.current) return;
    sockRef.current?.emit("chess:chat", {
      gameId: gameIdRef.current,
      userId: userIdRef.current,
      name: userName,
      message: chatInput.trim(),
    });
    setChatInput("");
  };



  const sendEmoji = (emoji) => {
    if (!gameIdRef.current) return;
    sockRef.current?.emit("chess:emoji", { gameId: gameIdRef.current, userId: userIdRef.current, emoji });
    setShowEmoji(false);
  };

  const sendTip = (gift) => {
    if (!gameIdRef.current) return;
    const opponentId = opponent?.userId || opponent?.id || "";
    sockRef.current?.emit("chess:tip", {
      gameId:     gameIdRef.current,
      fromUserId: userIdRef.current,
      toUserId:   opponentId,
      amount:     gift.points,
      charm:      gift.charm,
      giftId:     gift.id,
      giftName:   gift.name,
      giftIcon:   gift.icon,
    });
    setShowTip(false);
  };

  const findMatch = useCallback(() => {
    // Nếu có callback từ parent — check lượt chơi trước
    if (onFindMatch && !onFindMatch()) return; // onFindMatch trả false = hết lượt
    if (!userId) return;
    // Lấy tên mới nhất từ runtime store tại thời điểm bấm
    const rtName = useRuntimeCustomerIdentityStore.getState().identity?.fullName;
    const rtAvatar = useRuntimeCustomerIdentityStore.getState().identity?.avatar;
    const name = rtName || userName;
    const avatar = rtAvatar || userAvatar;
    sockRef.current?.emit("chess:find", { userId, name, avatar });
  }, [userId, userName, userAvatar]);

  const cancelSearch = useCallback(() => {
    sockRef.current?.emit("chess:cancel", { userId });
  }, [userId]);

  const resign = useCallback(() => {
    if (window.confirm("Bạn chắc chắn muốn đầu hàng?")) {
      sockRef.current?.emit("chess:resign", { gameId, userId });
    }
  }, [gameId, userId]);

  // Click ô cờ
  const handleSquareClick = useCallback((sq) => {
    if (phase !== "playing") return;
    if (chess.turn() !== myColor) return; // không phải lượt mình

    if (selected) {
      // Thử di chuyển — kể cả ô có quân đối phương (ăn quân)
      if (legalMoves.includes(sq)) {
        const piece = chess.get(selected);
        const isPromotion = piece?.type === "p" &&
          ((myColor === "w" && sq[1] === "8") || (myColor === "b" && sq[1] === "1"));

        const move = isPromotion
          ? { from: selected, to: sq, promotion: "q" }
          : { from: selected, to: sq };

        sockRef.current?.emit("chess:move", { gameId, move, userId });
        setSelected(null);
        setLegalMoves([]);
        return;
      }
      // Nếu click vào quân mình khác → đổi selection
      const clickedPiece = chess.get(sq);
      if (clickedPiece && clickedPiece.color === myColor) {
        const moves = chess.moves({ square: sq, verbose: true }).map(m => m.to);
        setSelected(sq);
        setLegalMoves(moves);
        return;
      }
      // Click vào ô trống không hợp lệ → bỏ selection
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    const piece = chess.get(sq);
    if (!piece || piece.color !== myColor) return;

    const moves = chess.moves({ square: sq, verbose: true }).map(m => m.to);
    setSelected(sq);
    setLegalMoves(moves);
  }, [phase, chess, myColor, selected, legalMoves, gameId, userId]);

  // Render bàn cờ
  const renderBoard = () => {
    const board  = chess.board();
    const files  = ["a","b","c","d","e","f","g","h"];
    const ranks  = myColor === "w" ? [7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7];
    const fOrder = myColor === "w" ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

    return (
      <div style={{ position:"relative" }}>
        {/* Bàn cờ */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(8,1fr)",
          gridTemplateRows:"repeat(8,1fr)",
          width:"min(94vw,440px)", aspectRatio:"1/1",
          borderRadius:4, overflow:"hidden",
          boxShadow:"0 12px 40px rgba(0,0,0,0.8), 0 0 0 8px #6B4C11, 0 0 0 10px #8B6914",
          border:"none",
        }}>
          {ranks.map(r => fOrder.map(f => {
            const sq    = files[f] + (r+1);
            const piece = board[7-r]?.[f];
            const isLight  = (f+r)%2 === 0;
            const isSel    = selected === sq;
            const isLegal  = legalMoves.includes(sq);
            const isLast   = lastMove && (lastMove.from===sq || lastMove.to===sq);
            const isKingChk= inCheck && piece?.type==="k" && piece?.color===chess.turn() && piece?.color===myColor;

            let bg = isLight ? LIGHT_SQ : DARK_SQ;
            if (isSel)     bg = isLight ? LIGHT_HL  : DARK_HL;
            if (isLast)    bg = isLight ? LIGHT_MV  : DARK_MV;
            if (isKingChk) bg = "#FF4444";

            const pieceKey = piece ? (piece.color + piece.type.toUpperCase()) : null;

            return (
              <div key={sq} onClick={() => handleSquareClick(sq)}
                style={{ background:bg, display:"flex", alignItems:"center",
                  justifyContent:"center", position:"relative", cursor:"pointer",
                  transition:"background 0.1s" }}>

                {/* Quân cờ — Unicode rõ nét, đúng màu */}
                {pieceKey && (
                  <div style={{
                    position:"absolute", inset:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"min(6.5vw,32px)",
                    color: piece.color==="w" ? "#fffff0" : "#1a1208",
                    textShadow: piece.color==="w"
                      ? "0 0 2px #000, 0 1px 3px rgba(0,0,0,1), 1px 1px 0 #000, -1px -1px 0 #333"
                      : "0 1px 2px rgba(255,255,255,0.2)",
                    userSelect:"none", lineHeight:1,
                    filter: piece.color==="w"
                      ? "drop-shadow(0 2px 2px rgba(0,0,0,1))"
                      : "drop-shadow(0 1px 2px rgba(0,0,0,0.7))",
                    zIndex:2, pointerEvents:"none",
                    WebkitFontSmoothing:"antialiased",
                  }}>
                    {{"wK":"♔","wQ":"♕","wR":"♖","wB":"♗","wN":"♘","wP":"♙",
                      "bK":"♚","bQ":"♛","bR":"♜","bB":"♝","bN":"♞","bP":"♟"}[pieceKey]}
                  </div>
                )}

                {/* Nước đi hợp lệ */}
                {isLegal && !piece && (
                  <div style={{
                    width:"32%", height:"32%", borderRadius:"50%",
                    background:"rgba(0,0,0,0.2)", zIndex:3,
                  }}/>
                )}
                {isLegal && piece && (
                  <div style={{
                    position:"absolute", inset:0, borderRadius:0,
                    border:"3px solid rgba(0,0,0,0.3)",
                    background:"rgba(0,0,0,0.1)", zIndex:3,
                  }}/>
                )}

                {/* Tọa độ */}
                {f===0 && (
                  <span style={{ position:"absolute", top:2, left:3, fontSize:9,
                    fontWeight:700, color:isLight?DARK_SQ:LIGHT_SQ, opacity:0.7, zIndex:1 }}>
                    {r+1}
                  </span>
                )}
                {r===0 && (
                  <span style={{ position:"absolute", bottom:2, right:3, fontSize:9,
                    fontWeight:700, color:isLight?DARK_SQ:LIGHT_SQ, opacity:0.7, zIndex:1 }}>
                    {files[f]}
                  </span>
                )}
              </div>
            );
          }))}
        </div>
      </div>
    );
  };

  const isMyTurn = chess.turn() === myColor;

  // ── LOBBY ──
  if (phase === "lobby") return (
    <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1a0a,#1a0a0a)",
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ fontSize:60, marginBottom:8 }}>♟️</div>
      <h1 style={{ color:"#FFD700", fontSize:24, fontWeight:900, margin:"0 0 4px",
        textShadow:"0 0 20px rgba(255,215,0,0.5)" }}>CỜ VUA</h1>
      <p style={{ color:"Top 888", fontSize:13, margin:"0 0 32px" }}>Đối kháng 1v1 realtime</p>

      {msg && <div style={{ background:"rgba(255,152,0,0.15)", border:"1px solid #FF9800",
        color:"#FF9800", borderRadius:12, padding:"10px 16px",
        marginBottom:16, fontSize:13, textAlign:"center" }}>{msg}</div>}

      <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:16,
        padding:"20px", marginBottom:24, width:"100%", maxWidth:320,
        border:"1px solid rgba(255,255,255,0.1)" }}>
        <p style={{ color:"Top 888", fontSize:11, fontWeight:700, letterSpacing:2,
          margin:"0 0 12px", textTransform:"uppercase" }}>Luật chơi</p>
        {[
          "♟ Tìm đối thủ tối đa 60 giây",
          "🎯 Bạn chỉ mất lượt chơi khi vào ván",
          "⚔️ Trận đấu bắt đầu khi 2 người vào",
          "♔ Chiếu hết đối thủ để thắng",
          "⏱ Mỗi nước đi tối đa 30 giây",
          "⏳ Mỗi người có 60s quỹ thời gian dự trữ — kích hoạt khi hết 30s, hết quỹ là thua",
          "📊 BXH theo số trận thắng & chuỗi thắng",
        ].map((r,i) => <p key={i} style={{ color:"#aaa", fontSize:12, margin:"0 0 6px" }}>{r}</p>)}
      </div>

      <button onClick={findMatch} style={{ background:"linear-gradient(135deg,#D4531C,#FF6B35)",
        border:"none", color:"white", borderRadius:16, padding:"16px 48px",
        fontSize:17, fontWeight:900, cursor:"pointer", width:"100%", maxWidth:320,
        boxShadow:"0 4px 20px rgba(212,83,28,0.4)" }}>
        ♟ Tìm đối thủ
      </button>
      <button onClick={() => setShowLB(true)} style={{ background:"rgba(255,215,0,0.08)",
        border:"1px solid rgba(255,215,0,0.2)", color:"#FFD700",
        borderRadius:12, padding:"12px", fontSize:13, fontWeight:700,
        cursor:"pointer", width:"100%", maxWidth:320, marginTop:10 }}>
        🏆 Bảng xếp hạng Kỳ thủ
      </button>
      <button onClick={onExit} style={{ background:"none", border:"none",
        color:"Top 666", marginTop:14, fontSize:13, cursor:"pointer" }}>← Quay lại</button>
      {showLB && <ChessLeaderboard onClose={() => setShowLB(false)} />}
    </div>
  );

  // ── SEARCHING ──
  if (phase === "searching") return (
    <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1a0a,#1a0a0a)",
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ fontSize:60, marginBottom:20,
        animation:"spin 3s linear infinite",
        display:"inline-block" }}>♟️</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <h2 style={{ color:"white", fontSize:20, fontWeight:900, margin:"0 0 8px" }}>Đang tìm đối thủ...</h2>
      <p style={{ color:"Top 888", fontSize:14, margin:"0 0 24px" }}>
        {searchTime < 60 ? `${searchTime}s / 60s` : "Sắp hết thời gian..."}
      </p>
      {/* Progress bar */}
      <div style={{ width:"100%", maxWidth:280, height:6,
        background:"rgba(255,255,255,0.1)", borderRadius:3, marginBottom:32, overflow:"hidden" }}>
        <div style={{ height:"100%", borderRadius:3,
          background:"linear-gradient(90deg,#D4531C,#FFD700)",
          width:`${(searchTime/60)*100}%`, transition:"width 1s linear" }}/>
      </div>
      <button onClick={cancelSearch} style={{ background:"rgba(255,255,255,0.08)",
        border:"1px solid rgba(255,255,255,0.2)", color:"Top 888",
        borderRadius:12, padding:"12px 32px", fontSize:14, cursor:"pointer" }}>
        Hủy tìm kiếm
      </button>
    </div>
  );

  // ── PLAYING ──
  if (phase === "playing") return (
    <div style={{ background:"#0a0604", position:"fixed", inset:0, zIndex:200,
      display:"flex", flexDirection:"column", alignItems:"center",
      paddingTop:"env(safe-area-inset-top, 0px)" }}>

      {/* Branding */}
      <div style={{ width:"100%", textAlign:"center", padding:"4px 0 2px", background:"#0a0604" }}>
        <p style={{ color:"#FFD700", fontSize:13, fontWeight:900, margin:0, letterSpacing:1 }}>Cing Hu Tang Kinh Bắc</p>
        <p style={{ color:"#FFD700", fontSize:10, fontWeight:500, margin:0, opacity:0.6 }}>Kỳ thủ cờ vua</p>
      </div>

      {/* Đối thủ (trên) */}
      <div style={{ width:"100%", maxWidth:480, padding:"10px 16px",
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
        background: !isMyTurn ? "rgba(255,215,0,0.08)" : "rgba(255,255,255,0.03)",
        borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width:44, height:44, borderRadius:22, overflow:"hidden", flexShrink:0,
          border:`3px solid ${!isMyTurn?"#FFD700":"rgba(255,255,255,0.15)"}`,
          boxShadow: !isMyTurn?"0 0 12px rgba(255,215,0,0.4)":"none" }}>
          {opponent?.avatar
            ? <img src={opponent.avatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#333,#555)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:18,fontWeight:900}}>
                {(opponent?.name||"?")[0]?.toUpperCase()}
              </div>}
        </div>
        <div style={{ flex:1, cursor: opponent?.userId ? "pointer" : "default" }}
          onClick={() => opponent?.userId && navigate(`/profile/${opponent.userId}`)}>
          <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 2px",
            textDecoration: opponent?.userId ? "underline" : "none",
            textDecorationColor:"rgba(255,255,255,.2)" }}>
            {opponent?.name||"Đối thủ"}
          </p>
          <p style={{ color: myColor==="w"?"#aaa":"#FFD700", fontSize:11, margin:0, fontWeight:600 }}>
            {myColor==="w"?"♚ Quân Đen":"♔ Quân Trắng"}
          </p>
        </div>
        {!isMyTurn
          ? <div style={{ background:"rgba(255,215,0,0.15)", border:"1px solid #FFD700", borderRadius:10, padding:"5px 12px" }}>
              <p style={{ color:"#FFD700", fontSize:11, fontWeight:900, margin:0 }}>⏳ Đang đi...</p>
            </div>
          : <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"5px 12px" }}>
              <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11, fontWeight:600, margin:0 }}>Chờ...</p>
            </div>}
      </div>

      {/* Check warning */}
      {inCheck && isMyTurn && (
        <div style={{ background:"rgba(255,68,68,0.2)", border:"1px solid #FF4444",
          color:"#FF4444", padding:"5px 20px", fontSize:12, fontWeight:800,
          width:"100%", maxWidth:480, textAlign:"center", flexShrink:0 }}>
          ⚠️ Vua đang bị chiếu!
        </div>
      )}

      {/* Bàn cờ — flex:1 để fill hết phần giữa */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", width:"100%", padding:"4px 0" }}>
        {renderBoard()}
      </div>

      {/* Mình (dưới) */}
      <div style={{ width:"100%", maxWidth:480, padding:"10px 16px",
        display:"flex", alignItems:"center", gap:12, flexShrink:0,
        background: isMyTurn ? "rgba(212,83,28,0.1)" : "rgba(255,255,255,0.03)",
        borderTop:"1px solid rgba(255,255,255,0.08)",
        paddingBottom:"calc(env(safe-area-inset-bottom, 0px) + 10px)" }}>
        <div style={{ width:44, height:44, borderRadius:22, overflow:"hidden", flexShrink:0,
          border:`3px solid ${isMyTurn?"#D4531C":"rgba(255,255,255,0.15)"}`,
          boxShadow: isMyTurn?"0 0 12px rgba(212,83,28,0.5)":"none" }}>
          {userAvatar
            ? <img src={userAvatar} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#D4531C,#FF6B35)",
                display:"flex",alignItems:"center",justifyContent:"center",
                color:"white",fontSize:18,fontWeight:900}}>
                {(userName||"?")[0]?.toUpperCase()}
              </div>}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ color:"white", fontSize:14, fontWeight:800, margin:"0 0 2px" }}>{userName} <span style={{color:"#D4531C",fontSize:11}}>(bạn)</span></p>
          <p style={{ color: myColor==="w"?"#FFD700":"#aaa", fontSize:11, margin:0, fontWeight:600 }}>
            {myColor==="w"?"♔ Quân Trắng":"♚ Quân Đen"}
          </p>
        </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:3 }}>
            {isMyTurn
              ? <div style={{ background:"rgba(212,83,28,0.2)", border:"1px solid #D4531C", borderRadius:10, padding:"4px 10px" }}>
                  <p style={{ color:"#D4531C", fontSize:11, fontWeight:900, margin:0 }}>
                    🎯 {moveTimer > 0 ? `${moveTimer}s` : `⚠️${myReserve}s`}
                  </p>
                </div>
              : <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:10, padding:"4px 10px" }}>
                  <p style={{ color:"rgba(255,255,255,0.3)", fontSize:11, margin:0 }}>Chờ...</p>
                </div>}
            <p style={{ color: myReserve < 15 ? "#FF4444" : "rgba(255,255,255,0.4)", fontSize:10, margin:0 }}>
              🕐 {myReserve}s dự trữ
            </p>
          </div>
        <button onClick={resign} style={{ background:"rgba(244,67,54,0.12)",
          border:"1px solid rgba(244,67,54,0.4)", color:"#f44336",
          borderRadius:10, padding:"7px 14px", fontSize:11, cursor:"pointer", fontWeight:800 }}>
          🏳 Đầu hàng
        </button>
      </div>

      {msg && <p style={{ color:"#FF9800", fontSize:12, position:"absolute", bottom:80, textAlign:"center" }}>{msg}</p>}



      {/* Portals */}
      {createPortal(<>

        {/* Float emoji — tối màn hình + pearl emoji to giữa bàn cờ */}
        {floatEmoji && (
          <div style={{ position:"fixed", inset:0, zIndex:9990, background:"rgba(0,0,0,0.55)",
            display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none",
            animation:"fadeOverlay 2s ease-out forwards" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12,
              animation:"popEmoji 2s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
              <img src={drawPearlEmoji(floatEmoji.emoji, 320)} alt=""
                style={{ width:160, height:160, borderRadius:"50%",
                  filter:"drop-shadow(0 0 30px rgba(200,240,255,0.6))" }}/>
              <p style={{ color:"#c8f0ff", fontSize:14, fontWeight:700, margin:0,
                textShadow:"0 0 20px rgba(200,240,255,0.8)" }}>
                {PEARL_EMOJIS.find(e=>e.id===floatEmoji.emoji)?.label || ""}
              </p>
            </div>
          </div>
        )}

        {/* Tip notification — lộng lẫy */}
        {tipResult && (
          <div style={{ position:"fixed", inset:0, zIndex:9990, background:"rgba(0,0,0,0.7)",
            display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none",
            animation:"fadeOverlay 3s ease-out forwards" }}>
            <div style={{ position:"relative", display:"flex", flexDirection:"column", alignItems:"center", gap:16,
              animation:"popEmoji 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards" }}>
              {/* Rays */}
              {[...Array(12)].map((_,i) => (
                <div key={i} style={{
                  position:"absolute", width:2, height:tipResult.fromMe?60:80,
                  background:`linear-gradient(to top, transparent, ${tipResult.fromMe?"#FFD700":"#00ff88"})`,
                  transformOrigin:"bottom center",
                  transform:`rotate(${i*30}deg) translateY(-${tipResult.fromMe?90:110}px)`,
                  opacity:0.5, borderRadius:1,
                }}/>
              ))}
              {/* Main badge */}
              <div style={{
                background: tipResult.fromMe
                  ? "linear-gradient(135deg,#8B6914,#FFD700,#FFF3a0,#FFD700,#8B6914)"
                  : "linear-gradient(135deg,#006b3c,#00c864,#80ffb8,#00c864,#006b3c)",
                borderRadius:20, padding:"20px 32px", textAlign:"center",
                boxShadow: tipResult.fromMe
                  ? "0 0 40px rgba(255,215,0,0.8), 0 0 80px rgba(255,215,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)"
                  : "0 0 40px rgba(0,200,100,0.8), 0 0 80px rgba(0,200,100,0.3), inset 0 1px 0 rgba(255,255,255,0.3)",
                border: `2px solid ${tipResult.fromMe?"rgba(255,255,200,0.6)":"rgba(150,255,200,0.6)"}`,
                minWidth:220,
              }}>
                <p style={{ fontSize:40, margin:"0 0 8px" }}>💎</p>
                <p style={{ color: tipResult.fromMe?"#1a0a00":"Top 003820", fontSize:20, fontWeight:900, margin:"0 0 4px",
                  textShadow:"0 1px 0 rgba(255,255,255,0.3)" }}>
                  {tipResult.fromMe ? `Bạn đã tặng ${tipResult.giftIcon||""} ${tipResult.giftName||tipResult.amount+" điểm"}` : `${tipResult.giftIcon||""} ${tipResult.giftName||tipResult.amount+" điểm"}`}
                </p>
                <p style={{ color: tipResult.fromMe?"rgba(26,10,0,0.7)":"rgba(0,56,32,0.8)", fontSize:12, fontWeight:700, margin:0 }}>
                  {tipResult.fromMe ? "Đã gửi đến đối thủ" : "Đối thủ vừa tặng bạn"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Emoji picker — pearl SVG grid */}
        {showEmoji && (
          <div onClick={() => setShowEmoji(false)}
            style={{ position:"fixed", inset:0, zIndex:9991, background:"rgba(0,0,0,0.6)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:"#0a0814", borderRadius:20, padding:"16px",
                border:"1px solid rgba(200,240,255,0.15)", boxShadow:"0 8px 40px rgba(0,0,0,0.9)" }}>
              <p style={{ color:"#FFD700", fontSize:12, fontWeight:800, margin:"0 0 12px", textAlign:"center", letterSpacing:1 }}>
                Chọn biểu cảm
              </p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8 }}>
                {PEARL_EMOJIS.map(e => (
                  <button key={e.id} onClick={() => sendEmoji(e.id)}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:0,
                      display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                    <img src={drawPearlEmoji(e.id, 144)} alt={e.label}
                      style={{ width:52, height:52, borderRadius:"50%",
                        border:`2px solid ${e.color}22`,
                        transition:"transform 0.12s, border-color 0.12s" }}
                      onMouseOver={ev=>{ev.target.style.transform='scale(1.15)';ev.target.style.borderColor=e.color+'88';}}
                      onMouseOut={ev=>{ev.target.style.transform='scale(1)';ev.target.style.borderColor=e.color+'22';}}
                    />
                    <span style={{ color:"rgba(200,240,255,0.5)", fontSize:8, lineHeight:1.2, textAlign:"center", maxWidth:52 }}>
                      {e.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tip picker */}
        {showTip && (
          <div onClick={() => setShowTip(false)}
            style={{ position:"fixed", inset:0, zIndex:9991, background:"rgba(0,0,0,0.7)",
              display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div onClick={e => e.stopPropagation()}
              style={{ background:"#0a0814", borderRadius:20, padding:"20px",
                border:"1px solid rgba(255,215,0,0.2)", boxShadow:"0 8px 40px rgba(0,0,0,0.9)", minWidth:260 }}>
              <p style={{ color:"#FFD700", fontSize:14, fontWeight:900, margin:"0 0 4px", textAlign:"center" }}>
                🎁 Tặng vật phẩm cho đối thủ
              </p>
              <p style={{ color:"rgba(255,150,0,0.7)", fontSize:10, margin:"0 0 14px", textAlign:"center", lineHeight:1.5 }}>
                Dùng điểm tích lũy · Đối thủ nhận điểm quyến rũ
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {GIFTS.map(g => (
                  <button key={g.id} onClick={() => sendTip(g)}
                    style={{ background:g.grad, border:`1px solid ${g.color}33`,
                      borderRadius:12, padding:"12px 16px", color:"white", fontSize:13,
                      fontWeight:700, cursor:"pointer", textAlign:"left",
                      display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:24 }}>{g.icon}</span>
                      <span>
                        <span style={{ display:"block", fontSize:13, fontWeight:800 }}>{g.name}</span>
                        <span style={{ display:"block", fontSize:10, color:"rgba(255,255,255,.45)", marginTop:2 }}>✦ {g.charm} điểm quyến rũ cho đối thủ</span>
                      </span>
                    </span>
                    <span style={{ color:g.color, fontSize:12, fontWeight:800, flexShrink:0 }}>{g.points} điểm →</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setShowTip(false)}
                style={{ width:"100%", marginTop:12, background:"none", border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:10, color:"rgba(255,255,255,0.3)", cursor:"pointer", fontSize:12, padding:"8px" }}>
                Huỷ
              </button>
            </div>
          </div>
        )}
        {showChat && (
            <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:9998,
              background:"rgba(10,6,4,0.97)", borderRadius:"20px 20px 0 0",
              border:"1px solid rgba(255,215,0,0.2)", height:"40vh", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"12px 16px 8px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ color:"#FFD700", fontSize:13, fontWeight:800, margin:0 }}>💬 Chat trong ván</p>
                <button onClick={() => setShowChat(false)} style={{ background:"none", border:"none", color:"Top 666", fontSize:18, cursor:"pointer" }}>✕</button>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"8px 12px" }}>
                {chatMessages.length === 0 && (
                  <p style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textAlign:"center", marginTop:20 }}>Chưa có tin nhắn</p>
                )}
                {chatMessages.map((m, i) => (
                  <div key={i} style={{ marginBottom:8, display:"flex", flexDirection:"column",
                    alignItems: m.userId === userIdRef.current ? "flex-end" : "flex-start" }}>
                    <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, margin:"0 0 2px" }}>{m.name}</p>
                    <div style={{ background: m.userId === userIdRef.current ? "#D4531C" : "rgba(255,255,255,0.1)",
                      borderRadius:12, padding:"6px 12px", maxWidth:"75%" }}>
                      <p style={{ color:"white", fontSize:13, margin:0 }}>{m.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>
              <div style={{ padding:"8px 12px 24px", display:"flex", gap:8, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Nhập tin nhắn..." maxLength={100}
                  style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)",
                    borderRadius:10, padding:"8px 12px", color:"white", fontSize:13, outline:"none" }}/>
                <button onClick={sendChat} disabled={!chatInput.trim()}
                  style={{ background: chatInput.trim() ? "#D4531C" : "rgba(255,255,255,0.1)",
                    border:"none", borderRadius:10, padding:"8px 14px", color:"white",
                    fontSize:13, fontWeight:700, cursor:"pointer" }}>Gửi</button>
              </div>
            </div>
          )}
      </>, document.body)}

      {/* Action buttons — nằm ngang dưới bàn cờ */}
      <div style={{ position:"relative", display:"flex", gap:10, justifyContent:"center", padding:"8px 0 16px", zIndex:200, pointerEvents:"all" }}>
        <button onClick={() => { setShowEmoji(v => !v); setShowTip(false); setShowChat(false); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: showEmoji?"#FF9632":"rgba(255,150,50,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          😄
        </button>
        <button onClick={() => { setShowTip(v => !v); setShowEmoji(false); setShowChat(false); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: showTip?"#FFD700":"rgba(255,215,0,0.85)",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          💎
        </button>
        <button onClick={() => { setShowChat(v => !v); setShowEmoji(false); setShowTip(false); setUnreadCount(0); }}
          style={{ width:44, height:44, borderRadius:22, border:"none", cursor:"pointer",
            background: showChat?"#D4531C":"rgba(255,255,255,0.15)", position:"relative",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
            boxShadow:"0 4px 12px rgba(0,0,0,0.4)" }}>
          💬
          {unreadCount > 0 && (
            <div style={{ position:"absolute", top:-4, right:-4, background:"#ff4444", color:"white",
              borderRadius:10, width:18, height:18, display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:10, fontWeight:900 }}>{unreadCount}</div>
          )}
        </button>
      </div>


    </div>
  );

  // ── GAME OVER ──
  if (phase === "gameover") {
    const won  = gameOver?.winner === userId;
    const draw = !gameOver?.winner;
    const reasonText = {
      checkmate:    "Chiếu hết",
      resign:       "Đầu hàng",
      disconnect:   "Đối thủ thoát",
      stalemate:    "Hòa - Pat",
      repetition:   "Hòa - Lặp nước",
      insufficient: "Hòa - Thiếu quân",
    }[gameOver?.reason] || gameOver?.reason;

    return (
      <div style={{ background:"linear-gradient(135deg,#1a0a0a,#2d1a0a,#1a0a0a)",
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:20 }}>
        <div style={{ fontSize:64, marginBottom:12 }}>
          {won?"🏆":draw?"🤝":"💀"}
        </div>
        <h2 style={{ color: won?"#FFD700":draw?"Top 888":"#f44336",
          fontSize:26, fontWeight:900, margin:"0 0 6px" }}>
          {won?"Chiến thắng!":draw?"Hòa cờ!":"Thất bại!"}
        </h2>
        <p style={{ color:"Top 666", fontSize:14, margin:"0 0 8px" }}>{reasonText}</p>
        {won && <p style={{ color:"#4CAF50", fontSize:13, margin:"0 0 24px",
          fontWeight:700 }}></p>}
        {!won && !draw && <p style={{ color:"Top 888", fontSize:13, margin:"0 0 24px" }}>
          Cố gắng hơn ở ván tiếp theo!</p>}

        <div style={{ display:"flex", flexDirection:"column", gap:10,
          width:"100%", maxWidth:280 }}>
          <button onClick={findMatch} style={{ background:"linear-gradient(135deg,#D4531C,#FF6B35)",
            border:"none", color:"white", borderRadius:14, padding:"14px",
            fontSize:15, fontWeight:900, cursor:"pointer" }}>
            ♟ Tìm ván mới
          </button>
          <button onClick={onExit} style={{ background:"none",
            border:"1px solid #333", color:"Top 888",
            borderRadius:14, padding:"12px", fontSize:14, cursor:"pointer" }}>
            ← Thoát
          </button>
        </div>
      </div>
    );
  }

  return null;
}
