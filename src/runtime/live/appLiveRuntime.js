import {getRuntimeSocket} from '@/runtime/socket/runtimeSocketClient';
import queryClient from '@/services/query/queryClient';
import {domainsForChange, invalidateLiveData, subscribeLiveData} from './appLiveData';
export function startAppLiveRuntime() {
  let socket=null;
  const visible = () => document.visibilityState !== 'hidden';
  const changed = (event,payload) => {
    if (!visible()) return;
    const domains = event === 'app.data.changed' && Array.isArray(payload?.domains)
      ? payload.domains.filter(value=>typeof value==='string') : domainsForChange(event);
    invalidateLiveData(domains);
    if(domains.some(domain=>["membership","wallet","rewards"].includes(domain)))window.dispatchEvent(new CustomEvent("cing:membership-invalidated"));
  };
  const mutation = event => {
    const domains=domainsForChange(event.detail?.url || '');
    invalidateLiveData(domains.length ? domains : ['*']);
  };
  const refresh = () => {if(visible()) invalidateLiveData(['*']);};
  const attach = () => {
    const next=getRuntimeSocket();
    if(next===socket)return;
    socket?.offAny(changed);socket?.off('connect',refresh);
    socket=next;socket?.onAny(changed);socket?.on('connect',refresh);
    if(socket?.connected)refresh();
  };
  // All active TanStack queries participate, including future query-based screens.
  let queryTimer;
  const offQueries=subscribeLiveData(['*'],()=>{
    if(queryTimer)return;
    queryTimer=setTimeout(()=>{queryTimer=null;void queryClient.invalidateQueries({refetchType:'active'});},200);
  });
  const discovery=setInterval(attach,1000), fallback=setInterval(refresh,20000);
  window.addEventListener('cing:mutation-committed',mutation);
  window.addEventListener('online',refresh);window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',refresh);
  attach();
  return()=>{
    clearInterval(discovery);clearInterval(fallback);clearTimeout(queryTimer);offQueries();
    socket?.offAny(changed);socket?.off('connect',refresh);
    window.removeEventListener('cing:mutation-committed',mutation);
    window.removeEventListener('online',refresh);window.removeEventListener('focus',refresh);
    document.removeEventListener('visibilitychange',refresh);
  };
}
