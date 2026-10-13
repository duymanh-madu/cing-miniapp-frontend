// Movement goes directly to the scene. React observes membership/identity and UI state.
const uiMemberKeys=['memberId','presenceId','character','displayName','selectedBadge','seatId','identityRevision','background'];
function sameRoster(a=[],b=[]){return a.length===b.length&&a.every((x,i)=>uiMemberKeys.every(k=>Object.is(x[k],b[i][k])));}
export function createPlazaUiStoreV19(client){
 let cached=client.getSnapshot();
 function getSnapshot(){const next=client.getSnapshot();if(next===cached)return cached;
  const keys=new Set([...Object.keys(cached),...Object.keys(next)]);keys.delete('members');keys.delete('correction');
  if(!sameRoster(cached.members,next.members)||[...keys].some(k=>!Object.is(cached[k],next[k])))cached=next;
  return cached;
 }
 return {getSnapshot,subscribe(listener){return client.subscribe(()=>{const before=cached;getSnapshot();if(cached!==before)listener();});}};
}
