import React, {useEffect, useRef, useState} from 'react';
import {X, Crown, UserRound, ChevronLeft} from 'lucide-react';
import PlazaTitleV10 from './PlazaTitleV10.jsx';
import {selectRosterV15} from './plazaSocialV15.js';

export default function PlazaMembersV15({room, roster, selfId, onClose, onProfile}) {
  const [selectedId, setSelectedId] = useState(null);
  const root = useRef(null), close = useRef(onClose); close.current = onClose;
  const members = selectRosterV15(room, roster);
  const selected = members.find(m => m.memberId === selectedId);
  useEffect(() => {
    const previous = document.activeElement;
    root.current?.querySelector('button')?.focus({preventScroll:true});
    const keys = e => {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab') return;
      const buttons = [...root.current.querySelectorAll('button:not(:disabled)')];
      const first = buttons[0], last = buttons.at(-1);
      if (e.shiftKey && document.activeElement === first) {e.preventDefault();last?.focus();}
      else if (!e.shiftKey && document.activeElement === last) {e.preventDefault();first?.focus();}
    };
    document.addEventListener('keydown', keys);
    return () => {document.removeEventListener('keydown', keys);previous?.focus?.({preventScroll:true});};
  }, []);
  return <div className="plaza-v15-members-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <section ref={root} className="plaza-v15-members" role="dialog" aria-modal="true" aria-label="Người chơi trong phòng">
      <header><div><small>CÙNG CING IU</small><h2>Người trong phòng <span>{room.memberCount}/{room.capacity}</span></h2></div>
        <button aria-label="Đóng danh sách người chơi" onClick={onClose}><X size={20}/></button></header>
      <div className="plaza-v15-member-list" hidden={Boolean(selected)}>{members.map(m=><button key={m.memberId} aria-pressed={selectedId===m.memberId} onClick={()=>setSelectedId(m.memberId)}>
        <span className="plaza-v15-member-avatar">{m.character?<img src={`/cing-plaza/assets/v7/${m.character}-portrait.webp`} alt=""/>:<UserRound/>}</span>
        <span className="plaza-v15-member-info"><strong>{m.displayName || 'Cing iu'}{m.memberId===selfId&&<small> · Bạn</small>}</strong>
          {m.selectedBadge&&<PlazaTitleV10 titleKey={m.selectedBadge} size="chat"/>}
          <small>{m.isOwner?'Chủ phòng':m.background?'Đang tạm vắng':'Trong phòng'}</small></span>
        {m.isOwner&&<Crown size={17} aria-label="Chủ phòng"/>}
      </button>)}</div>
      {selected&&<div className="plaza-v15-member-card"><button className="plaza-v15-card-back" aria-label="Về danh sách" onClick={()=>setSelectedId(null)}><ChevronLeft size={18}/></button>
        {selected.character&&<img src={`/cing-plaza/assets/v7/${selected.character}-portrait.webp`} alt="Nhân vật"/>}
        <h3>{selected.displayName || 'Cing iu'}</h3>
        {selected.selectedBadge&&<PlazaTitleV10 titleKey={selected.selectedBadge} size="chat"/>}
        <div className="plaza-v16-roster-actions"><button onClick={()=>onProfile(selected.memberId)}>Hồ sơ · Kết bạn · Nhắn riêng</button></div><p>{selected.isOwner?'Chủ phòng · ':''}{selected.character==='boy'?'Nhân vật nam':selected.character==='girl'?'Nhân vật nữ':'Cing iu'}</p>
      </div>}
    </section>
  </div>;
}
