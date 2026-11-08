import useAuthStore from '@/stores/auth/authStore';
import {currentCustomerIdentityV42} from '@/infra/auth/currentCustomerIdentityV42.js';
import {useMembership} from './useMembership.jsx';
export function useCurrentCustomerV42(overridePhone=""){
 const authenticated=useAuthStore(s=>s.authenticated),accessToken=useAuthStore(s=>s.accessToken),profile=useAuthStore(s=>s.profile);
 const query=useMembership(overridePhone);
 const customer=currentCustomerIdentityV42({authenticated,accessToken,profile},query.data);
 return {...customer,query};
}
