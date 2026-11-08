// Presentation ownership comes only from the backend session, never a shell phone.
export function currentCustomerPhoneV42(value){const d=String(value||'').replace(/\D/g,'');const p=d.startsWith('84')?'0'+d.slice(2):d;return /^0\d{9}$/.test(p)?p:'';}
const placeholders=new Set(['khách','khach','khách hàng','khach hang','guest','hội viên','hoi vien','cing iu']);
function name(value){const s=typeof value==='string'?value.trim():'';return s&&!placeholders.has(s.toLowerCase())?s:'';}
export function currentCustomerIdentityV42(auth,membership=null){
 const profile=auth?.profile,phone=currentCustomerPhoneV42(profile?.phone),id=typeof profile?.id==='string'?profile.id.trim():'';
 if(auth?.authenticated!==true||(typeof auth.accessToken!=='string'||!auth.accessToken.trim())||!id||!phone)return {ready:false,id:'',phone:'',profile:null,displayName:'',membership:null};
 const owned=membership&&currentCustomerPhoneV42(membership.phone)===phone?membership:null;
 // Explicit custom names are authored by the user. Generic defaults in other stores
 // cannot mask the matching CRM member name or introduce another account's data.
 const custom=[profile.display_name,profile.displayName].find(v=>typeof v==='string'&&v.trim());
 const displayName=custom?.trim()||name(owned?.name)||name(profile.name)||name(profile.zalo_name)||name(profile.fullName)||'Hội viên';
 return {ready:true,id,phone,profile,displayName,membership:owned};
}

// Compatibility stores project this owner; they cannot create a second identity.
export function projectRuntimeCustomerIdentityV42(auth,current={},incoming={}) {
 const owner=currentCustomerIdentityV42(auth);
 const next={...current,...incoming};
 if(!owner.ready)return {...next,credentialPhone:incoming.credentialPhone||current.credentialPhone||incoming.phone||current.phone||'',customerId:'',phone:'',fullName:'',avatar:'',memberActivated:false,loyaltyPoints:0,cumulativeSpending:0};
 return {...next,requiresFreshPhoneProof:false,customerId:owner.id,phone:owner.phone,fullName:owner.displayName,avatar:owner.profile.display_avatar||owner.profile.avatar||'',memberActivated:true,...(current.customerId!==owner.id?{loyaltyPoints:0,cumulativeSpending:0}:{})};
}
