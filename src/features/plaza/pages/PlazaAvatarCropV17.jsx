import {transformAvatarPointersV17} from "../runtime/plazaAvatarGestureV17.js";
import React,{useCallback,useEffect,useRef,useState} from 'react';

const SIZE=300;
const OUTPUT=1024;
const MAX_BYTES=262144;

function clamp(value,min,max){
  return Math.max(min,Math.min(max,value));
}

function bounds(image,zoom){
  const scale=Math.max(SIZE/image.naturalWidth,SIZE/image.naturalHeight)*zoom;
  return {
    width:image.naturalWidth*scale,
    height:image.naturalHeight*scale
  };
}

function renderImage(canvas,image,zoom,offset,size){
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('Canvas unavailable');

  const dimensions=bounds(image,zoom);
  const multiplier=size/SIZE;

  const x=(SIZE-dimensions.width)/2+offset.x;
  const y=(SIZE-dimensions.height)/2+offset.y;

  ctx.clearRect(0,0,size,size);
  ctx.fillStyle='#f4eee3';
  ctx.fillRect(0,0,size,size);

  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality='high';

  ctx.drawImage(
    image,
    x*multiplier,
    y*multiplier,
    dimensions.width*multiplier,
    dimensions.height*multiplier
  );
}

function toJpeg(canvas,quality){
  return new Promise(resolve=>{
    canvas.toBlob(resolve,'image/jpeg',quality);
  });
}

export default function PlazaAvatarCropV17({
  file,
  onCancel,
  onConfirm
}){
  const canvas=useRef(null);
  const imageRef=useRef(null);
  const pointers=useRef(new Map());
  const gestureState=useRef({
    zoom:1,
    offset:{x:0,y:0}
  });

  const [ready,setReady]=useState(false);
  const [zoom,setZoom]=useState(1);
  const [offset,setOffset]=useState({x:0,y:0});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    gestureState.current={zoom,offset};
  },[zoom,offset]);

  useEffect(()=>{
    pointers.current.clear();
  },[file]);

  const constrain=useCallback((image,nextZoom,nextOffset)=>{
    const dimension=bounds(image,nextZoom);

    return {
      x:clamp(nextOffset.x,
        -(dimension.width-SIZE)/2,
        (dimension.width-SIZE)/2),
      y:clamp(nextOffset.y,
        -(dimension.height-SIZE)/2,
        (dimension.height-SIZE)/2)
    };
  },[]);

  useEffect(()=>{
    let active=true;
    const url=URL.createObjectURL(file);
    const image=new Image();

    setReady(false);
    setError('');

    image.onload=()=>{
      if(!active)return;

      if(
        image.naturalWidth<1||
        image.naturalHeight<1||
        image.naturalWidth*image.naturalHeight>40000000
      ){
        setError('Ảnh quá lớn hoặc không hợp lệ.');
        return;
      }

      imageRef.current=image;
      setZoom(1);
      setOffset({x:0,y:0});
      setReady(true);
    };

    image.onerror=()=>{
      if(active)setError('Không đọc được ảnh.');
    };

    image.src=url;

    return ()=>{
      active=false;
      image.onload=null;
      image.onerror=null;
      imageRef.current=null;
      URL.revokeObjectURL(url);
    };
  },[file]);

  useEffect(()=>{
    if(!ready||!imageRef.current||!canvas.current)return;

    renderImage(
      canvas.current,
      imageRef.current,
      zoom,
      offset,
      SIZE
    );
  },[ready,zoom,offset]);

  function movePointer(event){
    const active=pointers.current;

    if(
      !ready||
      busy||
      !imageRef.current||
      !active.has(event.pointerId)
    )return;

    const rect=event.currentTarget.getBoundingClientRect();
    if(!rect.width||!rect.height)return;

    const before=Array.from(active.values());

    active.set(event.pointerId,{
      x:event.clientX,
      y:event.clientY
    });

    const after=Array.from(active.values());

    const next=transformAvatarPointersV17({
      before,
      after,
      rect,
      zoom:gestureState.current.zoom,
      offset:gestureState.current.offset,
      size:SIZE
    });

    const nextOffset=constrain(
      imageRef.current,
      next.zoom,
      next.offset
    );

    gestureState.current={
      zoom:next.zoom,
      offset:nextOffset
    };

    setZoom(next.zoom);
    setOffset(nextOffset);
  }

  function releasePointer(event){
    pointers.current.delete(event.pointerId);
  }

  async function confirm(){
    if(!ready||!imageRef.current||busy)return;

    setBusy(true);
    setError('');

    try{
      const output=document.createElement('canvas');
      output.width=OUTPUT;
      output.height=OUTPUT;

      renderImage(
        output,
        imageRef.current,
        zoom,
        offset,
        OUTPUT
      );

      let blob=null;

      for(const quality of [.85,.75,.65,.55,.45,.35,.25]){
        blob=await toJpeg(output,quality);
        if(blob&&blob.size<=MAX_BYTES)break;
      }

      output.width=1;
      output.height=1;

      if(!blob||blob.size>MAX_BYTES){
        throw new Error('Ảnh sau khi xử lý vẫn vượt 256 KB.');
      }

      onConfirm(blob);
    }catch(e){
      setError(e.message||'Chưa thể xử lý ảnh.');
    }finally{
      setBusy(false);
    }
  }

  return <div className="plaza-v17-crop-backdrop">
    <section
      className="plaza-v17-crop-dialog"
      role="dialog"
      aria-modal="true"
      aria-label="Cắt ảnh đại diện"
    >
      <h3>Chỉnh ảnh đại diện</h3>
      <p>Kéo ảnh bằng một ngón tay; dùng hai ngón tay để phóng to hoặc thu nhỏ.</p>

      <div className="plaza-v17-crop-stage">
        <canvas
          ref={canvas}
          width={SIZE}
          height={SIZE}
          aria-label="Khung cắt ảnh vuông"
          style={{touchAction:"none",userSelect:"none"}}
          onPointerDown={event=>{
            if(!ready||busy)return;
          
            if(
              event.pointerType==="mouse"&&
              event.button!==0
            )return;
          
            const active=pointers.current;
          
            if(active.size>=2)return;
          
            active.set(event.pointerId,{
              x:event.clientX,
              y:event.clientY
            });
          
            event.currentTarget.setPointerCapture(
              event.pointerId
            );
          }}
          onPointerMove={movePointer}
          onPointerUp={releasePointer}
          onPointerCancel={releasePointer}
          onLostPointerCapture={releasePointer}
        />
        <div className="plaza-v17-crop-guide" style={{pointerEvents:"none"}}/>
      </div>

      <label>
        Thu phóng
        <input
          type="range"
          min="1"
          max="3"
          step="0.01"
          value={zoom}
          disabled={!ready||busy}
          onChange={event=>{
            const value=Number(event.target.value);
            setZoom(value);
            if(imageRef.current){
              setOffset(previous=>constrain(
                imageRef.current,value,previous
              ));
            }
          }}
        />
      </label>

      <small>Ảnh vuông 1024 × 1024 px · JPEG</small>

      {error&&<p role="alert">{error}</p>}

      <div className="plaza-v17-crop-actions">
        <button type="button" disabled={busy} onClick={onCancel}>
          Hủy
        </button>
        <button
          type="button"
          disabled={!ready||busy}
          onClick={confirm}
        >
          {busy?'Đang xử lý…':'Dùng ảnh này'}
        </button>
      </div>
    </section>
  </div>;
}
