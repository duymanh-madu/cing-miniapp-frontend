import React,{useEffect,useState} from 'react';
export default function PlazaLoadingV11({error=false,onRetry,onClose,onReauthenticate,percent,message,diagnostic,timeoutMs=20000,retryDisabled=false}) {
 const [expired,setExpired]=useState(false),[attempt,setAttempt]=useState(0),[working,setWorking]=useState(false),[actionError,setActionError]=useState(''),[copied,setCopied]=useState(false),[reportVisible,setReportVisible]=useState(false);
 useEffect(()=>{setExpired(false);if(error)return;const timer=setTimeout(()=>setExpired(true),timeoutMs);return()=>clearTimeout(timer);},[error,timeoutMs,attempt]);
 const failed=error||expired;
 async function act(work){if(working||retryDisabled)return;setWorking(true);setActionError('');try{await work();setExpired(false);setAttempt(v=>v+1);}catch(e){const text=String(e?.message||'');setActionError(/[À-ỹĐđ]/u.test(text)&&!/(?:https?:|PLAZA_|AUTH_|Bearer)/i.test(text)?text.slice(0,200):'Chưa hoàn tất kết nối. Hãy thử lại.');}finally{setWorking(false);}}
 const retry=()=>act(()=>onRetry?onRetry():window.location.reload());
 const report=JSON.stringify(diagnostic||{version:26,stage:'loading',timeout:expired});
 async function copy(){try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(report);setCopied(true);}catch{setReportVisible(true);}}
 return <div className="plaza-v11-loading" role={failed?'alert':'status'}><div className="plaza-v11-loading-mark">Cing<span>Plaza</span></div>{failed?<p>{message||'Kết nối đang chậm hơn dự kiến. Bạn có thể thử lại.'}</p>:<><span className="plaza-v11-loading-line"><i style={{width:`${Math.max(6,Math.min(100,percent||6))}%`}}/></span><p>{message||'Đang mở Cing Plaza…'}</p></>}
 <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}><button type="button" disabled={retryDisabled||working} onClick={retry}>Thử lại</button><button type="button" onClick={()=>onClose?onClose():window.history.back()}>Quay lại</button></div>
 {failed&&<>{onReauthenticate&&<button type="button" disabled={retryDisabled||working} onClick={()=>act(onReauthenticate)}>{working?'Đang xác thực…':'Xác thực lại tài khoản Zalo'}</button>}<button type="button" onClick={copy}>{copied?'Đã sao chép':'Sao chép thông tin hỗ trợ'}</button>{reportVisible&&<textarea aria-label="Thông tin hỗ trợ" readOnly value={report} onFocus={e=>e.target.select()}/>}</>}{actionError&&<p role="alert">{actionError}</p>}
 </div>;
}
