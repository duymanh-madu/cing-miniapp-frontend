
export function transformAvatarPointersV17({
  before,after,rect,zoom,offset,size
}){
  if(
    !Array.isArray(before)||
    !Array.isArray(after)||
    before.length!==after.length||
    ![1,2].includes(before.length)||
    !rect||
    !Number.isFinite(rect.left)||
    !Number.isFinite(rect.top)||
    !Number.isFinite(rect.width)||
    !Number.isFinite(rect.height)||
    rect.width<=0||
    rect.height<=0||
    !Number.isFinite(size)||
    size<=0||
    !Number.isFinite(zoom)||
    zoom<=0||
    !Number.isFinite(offset?.x)||
    !Number.isFinite(offset?.y)
  ){
    throw new Error("PLAZA_AVATAR_GESTURE_INVALID");
  }

  const convert=list=>list.map(p=>({
    x:(p.x-rect.left)*size/rect.width,
    y:(p.y-rect.top)*size/rect.height
  }));

  const a=convert(before);
  const b=convert(after);

  for(const point of [...a,...b]){
    if(!Number.isFinite(point.x)||
       !Number.isFinite(point.y)){
      throw new Error("PLAZA_AVATAR_POINTER_INVALID");
    }
  }

  const currentZoom=Math.max(1,Math.min(3,zoom));

  if(a.length===1){
    return {
      zoom:currentZoom,
      offset:{
        x:offset.x+b[0].x-a[0].x,
        y:offset.y+b[0].y-a[0].y
      }
    };
  }

  const middle=p=>({
    x:(p[0].x+p[1].x)/2,
    y:(p[0].y+p[1].y)/2
  });

  const distance=p=>Math.hypot(
    p[0].x-p[1].x,
    p[0].y-p[1].y
  );

  const previous=middle(a);
  const next=middle(b);

  const initialDistance=distance(a);

  const nextZoom=initialDistance<8
    ?currentZoom
    :Math.max(
      1,
      Math.min(
        3,
        currentZoom*distance(b)/initialDistance
      )
    );

  const ratio=nextZoom/currentZoom;
  const center=size/2;

  return {
    zoom:nextZoom,
    offset:{
      x:next.x-center-
        ratio*(previous.x-center-offset.x),
      y:next.y-center-
        ratio*(previous.y-center-offset.y)
    }
  };
}
