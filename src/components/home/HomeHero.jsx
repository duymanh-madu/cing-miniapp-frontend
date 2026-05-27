import { useState } from 'react';
import NotificationBell from '@/features/notification/components/NotificationBell';
import RealtimeStatusBadge from '../header/RealtimeStatusBadge';
import useAuthStore from '@/stores/auth/authStore';
import useRealtimeCustomerStore from '@/stores/customer/customerRuntimeStore';

const IS_ZALO = typeof window !== 'undefined' && (window.__ZALO_MINI_APP__ || navigator.userAgent.includes('ZaloApp'));
const DEV_PASSWORD = 'manh90';
const TEST_PROFILE = { id:'0984966336', phone:'0984966336', name:'Duy Manh', displayName:'Duy Manh', avatar:null };

function HomeHero() {
  const authProfile     = useAuthStore(s => s.profile);
  const customerProfile = useRealtimeCustomerStore(s => s.profile);
  const setSession      = useAuthStore(s => s.setSession);
  const authenticated   = useAuthStore(s => s.authenticated);
  const displayName     = authProfile?.name || authProfile?.displayName || customerProfile?.name || 'Khách';
  const hour            = new Date().getHours();
  const greeting        = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const [showDevModal, setShowDevModal] = useState(false);
  const [devInput, setDevInput]         = useState('');
  const [devError, setDevError]         = useState('');

  const handleDevSubmit = () => {
    if (devInput === DEV_PASSWORD) {
      setSession({ accessToken: 'test-token', refreshToken: null, profile: TEST_PROFILE });
      sessionStorage.setItem('dev_membership_phone', TEST_PROFILE.phone);
      setShowDevModal(false); setDevInput(''); setDevError('');
    } else { setDevError('Sai mat khau!'); }
  };

  const handleTestLogout = () => {
    useAuthStore.getState().clearSession();
    sessionStorage.removeItem('dev_membership_phone');
  };

  return (
    <>
      <section className='relative overflow-hidden rounded-[34px] bg-gradient-to-br from-[#f28c28] via-orange-400 to-orange-500 p-6 text-white shadow-[0_25px_60px_rgba(242,140,40,0.35)]'>
        <div className='absolute -right-10 -top-10 h-[180px] w-[180px] rounded-full bg-white/10' />
        <div className='absolute -bottom-10 -left-10 h-[120px] w-[120px] rounded-full bg-white/10' />
        <div className='relative z-10' style={{ display:'flex', flexDirection:'column', minHeight:160 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <img src='/logo-cing.png' alt='Cing Hu Tang'
              style={{ height:54, objectFit:'contain', filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }} />
            <NotificationBell />
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', textAlign:'center', paddingBottom:4 }}>
            <p className='text-sm font-medium text-white/80'>{greeting}</p>
            <h1 className='mt-1 text-[28px] font-black leading-tight'>{displayName}</h1>
          </div>
          <div><RealtimeStatusBadge /></div>
          {IS_ZALO ? null : (
            <div style={{ marginTop:10, textAlign:'center' }}>
              {authenticated ? (
                <button onClick={handleTestLogout} style={{ background:'rgba(0,0,0,0.2)', border:'1px solid rgba(255,255,255,0.2)', color:'rgba(255,255,255,0.7)', borderRadius:10, padding:'6px 16px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  Dang xuat test
                </button>
              ) : (
                <button onClick={() => setShowDevModal(true)} style={{ background:'rgba(255,255,255,0.25)', border:'1px solid rgba(255,255,255,0.4)', color:'white', borderRadius:10, padding:'6px 16px', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                  Test Login (Dev)
                </button>
              )}
            </div>
          )}
        </div>
      </section>
      {showDevModal ? (
        <>
          <div onClick={() => { setShowDevModal(false); setDevError(''); }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999 }}/>
          <div style={{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'white', borderRadius:20, padding:24, width:280, zIndex:10000, boxSizing:'border-box' }}>
            <p style={{ fontSize:16, fontWeight:800, color:'#1a1a1a', margin:'0 0 4px' }}>Dev Login</p>
            <p style={{ fontSize:12, color:'#999', margin:'0 0 16px' }}>Nhap mat khau de test</p>
            <input type='password' placeholder='Mat khau...' value={devInput} onChange={e => setDevInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleDevSubmit()} autoFocus
              style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #e0e0e0', fontSize:14, outline:'none', boxSizing:'border-box', marginBottom:8 }}/>
            {devError ? <p style={{ fontSize:12, color:'#e53935', margin:'0 0 8px' }}>{devError}</p> : null}
            <button onClick={handleDevSubmit} style={{ width:'100%', padding:11, borderRadius:10, border:'none', background:'#D4531C', color:'white', fontSize:14, fontWeight:800, cursor:'pointer' }}>Dang nhap</button>
          </div>
        </>
      ) : null}
    </>
  );
}
export default HomeHero;
