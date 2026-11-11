import React,{useEffect,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {createPortal} from 'react-dom';
import apiClient from '@/infra/api/apiClient';
import useAuthStore from '@/stores/auth/authStore';
import {openAuthenticatedRuntimeSession} from '@/infra/auth/authenticatedRuntimeSession';
import {initializeCustomerIdentityEngine} from '@/runtime/customer/runtimeCustomerIdentityEngine';
import {usePlazaViewportV6} from '../runtime/usePlazaViewportV6.js';
import PlazaLoadingV11 from './PlazaLoadingV11.jsx';
import PlazaPageV1 from './PlazaPageV1';
export default function PlazaEntryPageV1(){
 const navigate=useNavigate();usePlazaViewportV6();
 const authenticated=useAuthStore(s=>s.authenticated);
 const featureEnabled=import.meta.env.VITE_CING_PLAZA_ENABLED==='true';
 const [legalEnabled,setLegalEnabled]=useState(false),[checking,setChecking]=useState(true),[error,setError]=useState(''),[epoch,setEpoch]=useState(0),[busy,setBusy]=useState(false);
 const close=()=>navigate('/game-center');
 useEffect(()=>{
  let cancelled=false,version=0,controller=null,timer=null,confirmed=false;
  setLegalEnabled(false);setChecking(true);setError('');
  if(!featureEnabled||!authenticated){setChecking(false);return()=>{cancelled=true;};}
  async function refresh(){
   const n=++version;controller?.abort();clearTimeout(timer);controller=new AbortController();
   timer=setTimeout(()=>{if(!cancelled&&n===version){version++;if(!confirmed)setError('PLAZA_CONFIG_UNAVAILABLE');setChecking(false);controller.abort();}},12000);
   try{const response=await apiClient.get('/app-config/public',{signal:controller.signal});if(cancelled||n!==version)return;
    if(typeof response?.data?.data?.customer_multiplayer_enabled!=='boolean')throw Error('INVALID_CONFIG');
    confirmed=true;setLegalEnabled(response.data.data.customer_multiplayer_enabled===true);setError('');setChecking(false);
   }catch{if(!cancelled&&n===version){if(!confirmed)setError('PLAZA_CONFIG_UNAVAILABLE');setChecking(false);}}
   finally{if(n===version)clearTimeout(timer);}
  }
  const show=()=>{if(document.visibilityState==='visible')void refresh();};void refresh();document.addEventListener('visibilitychange',show);
  return()=>{cancelled=true;version++;clearTimeout(timer);controller?.abort();document.removeEventListener('visibilitychange',show);};
 },[featureEnabled,authenticated,epoch]);
 async function retry(){if(busy)return;setBusy(true);try{if(!authenticated){const result=await openAuthenticatedRuntimeSession();if(result!=='authenticated'){setError('PLAZA_UNAUTHORIZED');return;}}setEpoch(v=>v+1);}finally{setBusy(false);}}
 async function reauthenticate(){if(busy)return;setBusy(true);try{await initializeCustomerIdentityEngine();if(useAuthStore.getState().authenticated)setEpoch(v=>v+1);}finally{setBusy(false);}}
 const gateError=error||(!authenticated?'PLAZA_UNAUTHORIZED':'');
 return createPortal(gateError?<main className="cing-plaza plaza-v7"><PlazaLoadingV11 key={epoch} error onRetry={retry} onReauthenticate={reauthenticate} retryDisabled={busy} onClose={close} message={gateError==='PLAZA_UNAUTHORIZED'?'Hãy xác thực lại tài khoản Zalo để vào Plaza.':'Chưa kiểm tra được trạng thái Plaza. Hãy thử lại.'} diagnostic={{version:26,stage:'config',code:gateError}}/></main>:<PlazaPageV1 key={epoch} checking={featureEnabled&&authenticated&&checking} enabled={featureEnabled&&authenticated&&legalEnabled} onClose={close} onReauthenticate={reauthenticate}/>,document.body);
}
