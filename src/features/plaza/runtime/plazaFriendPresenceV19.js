// The server owns online/lastSeenAt. Undefined is unknown, never assumed offline.
export function friendPresenceLabelV19(friend, now=Date.now()) {
  if (friend?.online === true) return 'Đang online';
  if (friend?.online !== false) return 'Chưa rõ hoạt động';
  const lastSeenAt=Date.parse(friend.lastSeenAt || '');
  if (!Number.isFinite(lastSeenAt) || lastSeenAt > now) return 'Offline';
  const minutes=Math.floor((now-lastSeenAt)/60000);
  if(minutes<1)return 'Vừa offline';
  if(minutes<60)return `Offline ${minutes} phút`;
  const hours=Math.floor(minutes/60);
  if(hours<24)return `Offline ${hours} giờ`;
  return `Offline ${Math.floor(hours/24)} ngày`;
}
export function sortFriendsV19(friends=[]) {
  const weight=f=>f.online===true?0:f.online===false?1:2;
  return [...friends].sort((a,b)=>weight(a)-weight(b)||String(a.displayName||'').localeCompare(String(b.displayName||''),'vi'));
}
