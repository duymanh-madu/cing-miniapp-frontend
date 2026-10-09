import React from 'react';
export default function PlazaLoadingV11({error=false,onRetry,percent}) {
 return <div className="plaza-v11-loading" role={error?'alert':'status'}><div className="plaza-v11-loading-mark">Cing<span>Plaza</span></div>{error?<><p>Chưa mở được không gian. Hãy thử lại nhé.</p><button onClick={onRetry}>Thử lại</button></>:<><span className="plaza-v11-loading-line"><i style={{width:`${Math.max(6,Math.min(100,percent||6))}%`}}/></span><p>Hẹn gặp bạn tại Plaza</p></>}</div>;
}
