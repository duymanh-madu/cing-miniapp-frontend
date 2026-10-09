export function recentPlazaBubblesV9(messages,roomId,now){
 const result=new Map();if(!roomId)return result;
 for(const m of messages||[]){if(m.roomId!==roomId||typeof m.author?.memberId!=='string'||typeof m.body!=='string'||!Number.isFinite(m.createdAt)||now-m.createdAt>7000||now-m.createdAt<0)continue;const previous=result.get(m.author.memberId);if(!previous||m.createdAt>=previous.createdAt)result.set(m.author.memberId,{...m,body:m.body.slice(0,160)});}
 return result;
}
