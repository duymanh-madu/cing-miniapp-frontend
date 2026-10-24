import React, { useEffect, useRef } from 'react';
import { piecePalette } from './blockPuzzleCelebration.js';

// A separate bounded presentation layer: cleared engine cells need not remain in the board.
// Overlapping clears survive the next placement. No state updates on animation frames.
export default function BlockPuzzleClearCanvas({ presentation, effects }) {
  const canvasRef = useRef(null);
  const driver = useRef(null);
  const lastSerial = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    let frame = 0, bursts = [], disposed = false;
    const reduced = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');
    const stop = () => { cancelAnimationFrame(frame); frame = 0; bursts = []; ctx.clearRect(0, 0, canvas.width, canvas.height); };
    const onVisibility = () => { if (document.hidden) stop(); };
    document.addEventListener('visibilitychange', onVisibility);
    const draw = (now) => {
      frame = 0;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
      if (canvas.width !== Math.round(w*dpr) || canvas.height !== Math.round(h*dpr)) { canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr); }
      ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
      bursts = bursts.filter(b => now - b.start < b.duration);
      for (const b of bursts) {
        const t = (now-b.start)/b.duration, cell = w/8;
        const alpha = Math.max(0,1-t);
        ctx.save();
        // Brilliant line core and a wider coloured halo, at the actual row/column.
        for (const [vertical, lines] of [[false,b.event.clearedRows || []],[true,b.event.clearedCols || []]]) for (const line of lines) {
          const center = (line+.5)*cell;
          ctx.save(); if (vertical) { ctx.translate(w,0); ctx.rotate(Math.PI/2); }
          const y = vertical ? w-center : center;
          ctx.globalAlpha = Math.max(0, 1-t*2.6);
          const glow = ctx.createLinearGradient(0,y-cell,0,y+cell);
          glow.addColorStop(0,'#56dbff00'); glow.addColorStop(.4,'#56dbff88'); glow.addColorStop(.5,'#fff9dfff'); glow.addColorStop(.6,'#b090ff88'); glow.addColorStop(1,'#56dbff00');
          ctx.fillStyle=glow; ctx.fillRect(0,y-cell,w,cell*2);
          ctx.fillStyle='#fffde9'; ctx.fillRect(0,y-2,w,4);
          ctx.restore();
        }
        for (const p of b.cells) {
          const x=(p.col+.5)*cell, y=(p.row+.5)*cell;
          ctx.globalAlpha = Math.max(0,1-t*3);
          ctx.fillStyle=p.color; ctx.fillRect(x-cell*.43,y-cell*.43,cell*.86,cell*.86);
          if (!b.calm) for(let j=0;j<3;j++) {
            const angle=(p.row*17+p.col*31+j*127)*Math.PI/180;
            const distance=(26+j*19)*t;
            const px=x+Math.cos(angle)*distance, py=y+Math.sin(angle)*distance+28*t*t;
            ctx.save();ctx.translate(px,py);ctx.rotate(angle+t*4);ctx.globalAlpha=alpha;
            ctx.fillStyle=j===0?'#fff9cd':p.color;
            const size=(j===0?3:5)*(1-t*.75);ctx.fillRect(-size,-size,size*2,size*2);ctx.restore();
          }
        }
        if (b.event.perfectClear && !b.calm) {
          ctx.globalAlpha=alpha*.7;ctx.strokeStyle='#ffe896';ctx.lineWidth=3*(1-t)+1;
          ctx.beginPath();ctx.arc(w/2,h/2,Math.max(1,w*.65*t),0,Math.PI*2);ctx.stroke();
        }
        ctx.restore();
      }
      if (bursts.length && !disposed) frame=requestAnimationFrame(draw);
    };
    driver.current = {
      push(p, calm) {
        if (!p?.visualCells?.length || document.hidden) return;
        bursts.push({ start:performance.now(), duration:calm||reduced?.matches?260:720, calm:calm||reduced?.matches, event:p.event,
          cells:p.visualCells.map(c=>({...c,color:piecePalette(c.shapeId)['--block-light']})) });
        bursts=bursts.slice(-3);
        if (!frame) frame=requestAnimationFrame(draw);
      }, stop,
    };
    return () => { disposed=true;stop();driver.current=null;document.removeEventListener('visibilitychange',onVisibility); };
  }, []);
  useEffect(() => {
    if (!presentation || lastSerial.current === presentation.serial) return;
    lastSerial.current=presentation.serial;
    driver.current?.push(presentation, effects === 'calm');
  }, [presentation, effects]);
  useEffect(() => { if (effects === 'calm') driver.current?.stop(); }, [effects]);
  return <canvas ref={canvasRef} className="cing-block-puzzle__clear-canvas" aria-hidden="true" />;
}
