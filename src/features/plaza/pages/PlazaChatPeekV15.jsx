import React from 'react';
import {Megaphone, MessageCircle} from 'lucide-react';
import {latestRegionalMessageV15} from './plazaSocialV15.js';
import PlazaTitleV10 from './PlazaTitleV10.jsx';
export default function PlazaChatPeekV15({roomId, messages, worldMessages=[], onOpen}) {
  const world=worldMessages.filter(m=>m.channel==='world').at(-1);
  const regional = latestRegionalMessageV15(roomId, messages);
  return <button type="button" className="plaza-v15-chat-peek" aria-label="Mở khung trò chuyện" onClick={onOpen}>
    <span><Megaphone size={14}/><small>Thế giới</small><b>{world?<><span className="plaza-v18-peek-author">
      {world.author?.selectedBadge&&<PlazaTitleV10
        titleKey={world.author.selectedBadge}
        size="micro"
      />}
      <strong>{world.author?.displayName||'Cing iu'}:</strong>
    </span> {world.body}</>:'Loa thế giới'}</b></span>
    <span><MessageCircle size={14}/><small>Khu vực</small><b>{regional?<><span className="plaza-v18-peek-author">
      {regional.author?.selectedBadge&&<PlazaTitleV10
        titleKey={regional.author.selectedBadge}
        size="micro"
      />}
      <strong>{regional.author?.displayName||'Cing iu'}:</strong>
    </span> {regional.body}</>:'Gửi một lời chào…'}</b></span>
  </button>;
}
