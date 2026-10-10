import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import apiClient from '@/infra/api/apiClient';
import {createSocialCommandsV16,mergeSocialMessagesV16,socialErrorV16} from './plazaSocialClientV16.js';
function data(response){if(response?.data?.success!==true)throw Object.assign(new Error('Unavailable'),{code:response?.data?.code||'PLAZA_SOCIAL_UNAVAILABLE'});return response.data.data;}
export function usePlazaSocialV16({enabled,memberId,connected,stream=[],revision=0}){
 const [overview,setOverview]=useState(null),[feed,setFeed]=useState([]),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const alive=useRef(false),action=useRef(false),version=useRef(0),feedVersion=useRef(0);
 const commands=useMemo(()=>createSocialCommandsV16({post:async request=>data(await apiClient.post('/plaza/social/command',request))}),[memberId]);
 const refresh=useCallback(async()=>{const n=++version.current;try{const result=data(await apiClient.get('/plaza/social/overview'));if(alive.current&&n===version.current){setOverview(result);setError('');}return result;}catch(e){if(alive.current&&n===version.current)setError(socialErrorV16(e));throw e;}},[memberId]);
 const refreshFeed=useCallback(async()=>{const epoch=feedVersion.current;const result=data(await apiClient.get('/plaza/social/feed'));if(alive.current&&epoch===feedVersion.current)setFeed(old=>mergeSocialMessagesV16(old,result.world||[],result.pm||[]));},[memberId]);
 useEffect(()=>{alive.current=enabled;setOverview(null);setFeed([]);setError('');if(!enabled)return()=>{};void refresh().catch(()=>{});void refreshFeed().catch(()=>{});const show=()=>{if(document.visibilityState==='visible'){void refresh().catch(()=>{});void refreshFeed().catch(()=>{});}};document.addEventListener('visibilitychange',show);return()=>{alive.current=false;version.current++;feedVersion.current++;document.removeEventListener('visibilitychange',show);};},[enabled,memberId,refresh,refreshFeed]);
 useEffect(()=>{if(enabled&&connected){void refreshFeed().catch(()=>{});}},[connected,enabled,refreshFeed]);
 useEffect(()=>{if(!enabled||!revision)return;const timer=setTimeout(()=>void refresh().catch(()=>{}),150);return()=>clearTimeout(timer);},[enabled,revision,refresh]);
 const messages=useMemo(()=>mergeSocialMessagesV16(feed,stream),[feed,stream]);
 const run=useCallback(async(operation,payload={})=>{if(action.current)return false;action.current=true;setBusy(true);setError('');try{const receipt=await commands.run(operation,payload);if(receipt.message){const m=receipt.message;setFeed(old=>mergeSocialMessagesV16(old,[{messageId:m.id,sequence:Number(m.seq),channel:m.channel,createdAt:Date.parse(m.created_at),body:m.body,peerId:m.recipient_id,author:{memberId:m.author_id,displayName:m.author_name,selectedBadge:m.author_badge}}]));}await refresh().catch(()=>{});return true;}catch(e){if(alive.current)setError(socialErrorV16(e));return false;}finally{action.current=false;if(alive.current)setBusy(false);}},[commands,refresh]);
 const getProfile=useCallback(async id=>data(await apiClient.get('/plaza/social/profile/'+encodeURIComponent(id))),[]);
 const upload=useCallback(async(file,avatarCommandId)=>{
  const response=await apiClient.put('/plaza/social/avatar/'+avatarCommandId,file,{headers:{'Content-Type':'image/jpeg'}});return data(response);
 },[]);
 return {overview,messages,busy,error,refresh,run,getProfile,upload,pending:commands.getPending()};
}
