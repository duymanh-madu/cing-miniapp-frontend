const temporary=new Set(['PLAZA_REQUEST_TIMEOUT','PLAZA_DISCONNECTED','PLAZA_PROFILE_STALE','PLAZA_RATE_LIMITED','PLAZA_QUEUE_FULL','PLAZA_INTERNAL_ERROR','PLAZA_PROFILE_UNAVAILABLE','PLAZA_IDENTITY_UNAVAILABLE']);
export const retryPlazaProfileV26=(code,attempt)=>attempt<2&&temporary.has(code);
export function plazaEntryMessageV26(code){
 if(['PLAZA_INVALID_TOKEN','PLAZA_UNAUTHORIZED'].includes(code))return 'Phiên đăng nhập cần được kết nối lại. Hãy thử lại.';
 if(['PLAZA_MEMBER_NOT_FOUND','PLAZA_CUSTOMER_NOT_FOUND','PLAZA_MEMBER_IDENTITY_INVALID','PLAZA_IDENTITY_CHANGED'].includes(code))return 'Chưa đồng bộ được tài khoản Plaza. Hãy xác thực lại tài khoản Zalo.';
 if(code==='PLAZA_MEMBER_BLOCKED')return 'Tài khoản hiện chưa được phép tham gia Plaza.';
 if(code==='PLAZA_SESSION_REPLACED')return 'Tài khoản đã mở Plaza ở một phiên khác. Bạn có thể kết nối lại tại đây.';
 if(code==='PLAZA_UNAVAILABLE')return 'Plaza tạm thời chưa sẵn sàng. Hãy thử lại sau ít phút.';
 return 'Chưa kết nối được Plaza. Hãy thử lại, hoặc quay lại và mở lại Plaza.';
}
export function safePlazaEntryReportV26(snapshot={},stage='connection',code){
 const report={version:26,stage:['config','connection','profile','scene'].includes(stage)?stage:'connection'};
 if(['idle','connecting','connected','disconnected','resuming','connection-error','disposed'].includes(snapshot.status))report.status=snapshot.status;
 const value=code||snapshot.lastError;if(typeof value==='string'&&/^PLAZA_[A-Z0-9_]{1,64}$/.test(value))report.code=value;
 report.profile=snapshot.profile===undefined?'unread':snapshot.profile===null?'new':['boy','girl'].includes(snapshot.profile?.character)?'existing':'invalid';
 report.inRoom=!!snapshot.room;return report;
}
