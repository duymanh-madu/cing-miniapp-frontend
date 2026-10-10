import React,{useEffect,useRef,useState} from 'react';
import {X,Send,MessagesSquare,Globe,Mail,MessageCircle,Check,UserPlus,Megaphone} from 'lucide-react';
import PlazaTitleV10 from './PlazaTitleV10.jsx';
import {selectChatChannelsV16} from '../runtime/plazaSocialClientV16.js';
const channels=[['room','Khu vực',MessageCircle],['world','Loa thế giới',Globe],['pm','PM',Mail],['all','Tất cả',MessagesSquare]];
export default function PlazaChatV7({room,messages,draft,setDraft,submit,connected,busy,onClose,social,initialPeerId,onProfile}){
 const [tab,setTab]=useState(initialPeerId?'pm':'room'),[peerId,setPeerId]=useState(initialPeerId||''),[worldConfirm,setWorldConfirm]=useState(false),[allCompose,setAllCompose]=useState('room');const root=useRef(null),end=useRef(null),close=useRef(onClose);close.current=onClose;
 const overview=social?.overview,compose=tab==='all'?allCompose:tab,peers=overview?.friends.filter(v=>v.status==='accepted')||[];
 const stream=selectChatChannelsV16({tab,roomId:room?.roomId,regional:messages,social:social?.messages||[],peerId:tab==='pm'?peerId:null});
 const canSend=connected&&!busy&&!social?.busy&&draft.trim()&&(compose==='room'?Boolean(room):compose==='world'?overview?.commerceEnabled&&overview.loudspeakers>0:Boolean(peers.find(v=>v.peerId===peerId)));
 useEffect(()=>{if(initialPeerId){setPeerId(initialPeerId);setTab('pm');}},[initialPeerId]);
 useEffect(()=>{const previous=document.activeElement;root.current?.querySelector('button')?.focus({preventScroll:true});function key(e){if(e.key==='Escape')close.current();if(e.key==='Tab'){const elements=[...root.current.querySelectorAll('button:not(:disabled),textarea:not(:disabled),select:not(:disabled)')].filter(e=>e.offsetParent!==null);if(e.shiftKey&&document.activeElement===elements[0]){e.preventDefault();elements.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===elements.at(-1)){e.preventDefault();elements[0]?.focus();}}}document.addEventListener('keydown',key);return()=>{document.removeEventListener('keydown',key);previous?.focus?.({preventScroll:true});};},[]);
 useEffect(()=>{end.current?.scrollIntoView({block:'nearest'});},[stream.at(-1)?.messageId,tab,peerId]);
 async function send(event,confirmed=false){event?.preventDefault();if(!canSend)return;if(compose==='room'){await submit({preventDefault(){}});return;}if(compose==='world'&&!confirmed){setWorldConfirm(true);return;}const ok=await social.run(compose==='world'?'use_loudspeaker':'pm',{body:draft.trim(),...(compose==='pm'?{peerId}:{})});if(ok){setDraft('');setWorldConfirm(false);}}
 return <section ref={root} className="plaza-v7-chat plaza-v16-chat" role="dialog" aria-modal="true" aria-label="Trò chuyện Cing Plaza"><header><div><small>CÙNG CING IU</small><h2>{room?.name||'Sảnh Cing Plaza'}</h2></div><button aria-label="Đóng trò chuyện" onClick={onClose}><X/></button></header><div className="plaza-v7-tabs" role="tablist" aria-label="Kênh trò chuyện">{channels.map(([id,label,Icon],i)=><button key={id} id={'chat-tab-'+id} aria-controls="chat-channel" role="tab" aria-selected={tab===id} tabIndex={tab===id?0:-1} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:(i+(e.key==='ArrowRight'?1:3))%4;setTab(channels[next][0]);document.getElementById('chat-tab-'+channels[next][0])?.focus();}}} onClick={()=>setTab(id)}><Icon size={17}/><span>{label}</span></button>)}</div>
 {tab==='pm'&&<div className="plaza-v16-chat-peers"><select aria-label="Chọn bạn để nhắn riêng" value={peerId} onChange={e=>setPeerId(e.target.value)}><option value="">Chọn một người bạn</option>{peers.map(p=><option key={p.peerId} value={p.peerId}>{p.displayName}</option>)}</select>{(overview?.friends||[]).filter(p=>p.status==='pending'&&p.incoming).map(p=><div key={p.peerId}><button onClick={()=>onProfile(p.peerId)}><UserPlus size={14}/>{p.displayName}</button><button disabled={social.busy} onClick={()=>social.run('friend_accept',{peerId:p.peerId})}><Check size={14}/>Đồng ý</button></div>)}</div>}
 <div id="chat-channel" className="plaza-v7-chat-stream" role="tabpanel" aria-labelledby={'chat-tab-'+tab}>{stream.length===0&&<div className="plaza-v7-chat-empty">{tab==='room'&&!room?'Chat khu vực hiển thị khi bạn vào phòng.':tab==='pm'?'Chọn bạn bè để nhắn riêng, hoặc kết bạn từ danh sách người trong phòng.':tab==='world'?'Mỗi loa gửi một lời nhắn tới toàn server.':'Bắt đầu bằng một lời chào nhé.'}</div>}{stream.map(m=><article key={m.messageId} className={'plaza-v16-message plaza-v16-message--'+m.channel}><div><small className="plaza-v16-channel-mark">{m.channel==='world'?'LOA':m.channel==='pm'?'PM':'KHU VỰC'}</small><span className="plaza-v18-idrow plaza-v18-idrow--chat">
      {m.author?.selectedBadge&&<PlazaTitleV10
        titleKey={m.author.selectedBadge}
        size="chat"
      />}
      <button
        className="plaza-v16-chat-author"
        onClick={()=>onProfile?.(m.author?.memberId)}
        disabled={!m.author?.memberId}
      >
        <strong>{m.author?.displayName||'Cing iu'}</strong>
      </button>
      <span className="plaza-v18-vip-slot" aria-hidden="true"/>
    </span><time>{new Date(m.createdAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</time></div><p>{m.body}</p></article>)}<div ref={end}/></div>
 {tab==='all'&&<select className="plaza-v16-compose-channel" aria-label="Kênh gửi tin nhắn" value={allCompose} onChange={e=>setAllCompose(e.target.value)}><option value="room">Gửi vào khu vực hiện tại</option><option value="world">Gửi bằng một loa thế giới</option><option value="pm">Gửi PM tới người bạn đã chọn</option></select>}
 {tab==='all'&&compose==='pm'&&<select className="plaza-v16-compose-channel" aria-label="Người nhận PM" value={peerId} onChange={e=>setPeerId(e.target.value)}><option value="">Chọn bạn để nhắn riêng</option>{peers.map(p=><option key={p.peerId} value={p.peerId}>{p.displayName}</option>)}</select>}
 {compose==='world'&&<small className="plaza-v16-chat-stock"><Megaphone size={14}/>Bạn có {overview?.loudspeakers||0} loa · mỗi tin dùng 1 loa</small>}
 {social?.error&&<p role="alert" className="plaza-v16-chat-error">{social.error}</p>}
 <form onSubmit={send}><textarea aria-label="Tin nhắn" placeholder={compose==='room'?'Nhắn một lời với Cing iu…':compose==='world'?'Một lời gửi tới toàn Plaza…':'Tin nhắn chỉ hai người thấy…'} rows={1} maxLength={500} value={draft} readOnly={Boolean(social?.pending)} disabled={!connected||compose==='room'&&!room} onChange={e=>setDraft(e.target.value)}/><button aria-label="Gửi tin nhắn" disabled={!canSend}><Send size={21}/></button></form>
 {worldConfirm&&<div className="plaza-v16-overlay"><section className="plaza-v16-confirm" role="dialog" aria-label="Xác nhận dùng loa"><Megaphone size={30}/><h2>Gửi tới toàn Plaza?</h2><p>Thao tác này dùng 1 loa thế giới.</p><blockquote>{draft}</blockquote><button disabled={social.busy} onClick={()=>send(null,true)}>Dùng 1 loa & gửi</button><button disabled={social.busy||Boolean(social.pending)} onClick={()=>setWorldConfirm(false)}>Quay lại</button>{social.error&&<p role="alert">{social.error}</p>}</section></div>}</section>;
}
