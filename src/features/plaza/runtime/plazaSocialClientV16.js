export const PLAZA_SOCIAL_ERRORS_V16={PLAZA_INVALID_MESSAGE:'Tin nhắn cần từ 1 đến 500 ký tự.',PLAZA_FRIEND_LIMIT:'Danh sách bạn bè đã đạt giới hạn.',PLAZA_INVALID_PROFILE:'Lời giới thiệu tối đa 200 ký tự.',PLAZA_INVALID_QUANTITY:'Nhập số lượng nguyên hợp lệ.',PLAZA_WALLET_FROZEN:'Cing Wallet hiện chưa thể sử dụng.',PLAZA_INSUFFICIENT_COIN:'Bạn chưa đủ Cing Coin.',PLAZA_INSUFFICIENT_WALLET:'Số dư Cing Wallet chưa đủ.',PLAZA_LOUDSPEAKER_REQUIRED:'Bạn cần một loa thế giới để gửi.',PLAZA_FRIEND_REQUIRED:'Hai người cần kết bạn trước khi nhắn riêng.',PLAZA_MEMBER_BLOCKED:'Không thể tương tác với tài khoản này.',PLAZA_CHAT_LOCKED:'Tài khoản đang bị khóa gửi tin nhắn.',PLAZA_PROFILE_STALE:'Hồ sơ đã thay đổi. Hãy tải lại trước khi lưu.',PLAZA_COMMAND_CONFLICT:'Yêu cầu này đã được dùng cho một thao tác khác.',PLAZA_RATE_LIMITED:'Chờ một chút rồi thao tác tiếp nhé.',PLAZA_INVALID_AVATAR:'Ảnh chưa hợp lệ. Hãy chọn một ảnh khác.',PLAZA_SOCIAL_UNAVAILABLE:'Chưa kết nối được. Hãy thử lại.',PLAZA_COMMERCE_UNAVAILABLE:'Siêu thị chưa mở thanh toán.'};
export function socialErrorV16(error){return PLAZA_SOCIAL_ERRORS_V16[error?.response?.data?.code||error?.code]||'Chưa nhận được xác nhận. Bạn có thể thử lại cùng yêu cầu.';}
export function mergeSocialMessagesV16(...groups){const map=new Map();for(const m of groups.flat())if(m?.messageId&&['pm','world'].includes(m.channel)&&typeof m.body==='string')map.set(m.messageId,m);return [...map.values()].sort((a,b)=>a.createdAt-b.createdAt||a.messageId.localeCompare(b.messageId)).slice(-200);}
export function selectChatChannelsV16({tab,roomId,regional=[],social=[],peerId,selfId}){
 const room=regional.filter(m=>roomId&&m.roomId===roomId).map(m=>({...m,channel:'room'}));
 const world=social.filter(m=>m.channel==='world');const pm=social.filter(m=>m.channel==='pm'&&(!peerId||m.peerId===peerId));
 return (tab==='room'?room:tab==='world'?world:tab==='pm'?pm:[...room,...world,...pm]).sort((a,b)=>a.createdAt-b.createdAt||a.messageId.localeCompare(b.messageId));
}
export function createSocialCommandsV16({post,id=()=>crypto.randomUUID()}){
 let pending=null;
 return {getPending:()=>pending,async run(operation,payload={}){
  const key=JSON.stringify({operation,...payload});if(pending&&pending.key!==key)throw Object.assign(new Error('Pending outcome'),{code:'PLAZA_OUTCOME_UNKNOWN'});
  if(!pending)pending={key,request:{operation,commandId:id(),...payload}};
  try{const response=await post(pending.request);pending=null;return response;}catch(error){const status=error?.response?.status;if(status>=400&&status<500&&status!==408&&status!==429)pending=null;throw error;}
 }};
}
