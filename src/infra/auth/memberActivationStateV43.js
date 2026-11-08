import {currentCustomerIdentityV42} from './currentCustomerIdentityV42.js';
export function memberActivationStateV43(auth,{activationStatus,profileHydrated,phoneToken,miniAccessToken,bootGraceDone}={}){
 const ready=currentCustomerIdentityV42(auth).ready;
 const restoring=!ready&&!bootGraceDone&&(activationStatus==='checking'||!profileHydrated||!!(phoneToken&&miniAccessToken));
 return {ready,restoring};
}
