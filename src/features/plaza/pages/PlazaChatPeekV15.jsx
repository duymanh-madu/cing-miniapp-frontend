import React from 'react';
import {Megaphone, MessageCircle} from 'lucide-react';
import {latestRegionalMessageV15} from './plazaSocialV15.js';
export default function PlazaChatPeekV15({roomId, messages, worldMessages=[], onOpen}) {
  const world=worldMessages.filter(m=>m.channel==='world').at(-1);
  const regional = latestRegionalMessageV15(roomId, messages);
  return <button type="button" className="plaza-v15-chat-peek" aria-label="Mở khung trò chuyện" onClick={onOpen}>
    <span><Megaphone size={14}/><small>Thế giới</small><b>{world?<><strong>{world.author?.displayName||'Cing iu'}:</strong> {world.body}</>:'Loa thế giới'}</b></span>
    <span><MessageCircle size={14}/><small>Khu vực</small><b>{regional?<><strong>{regional.author?.displayName||'Cing iu'}:</strong> {regional.body}</>:'Gửi một lời chào…'}</b></span>
  </button>;
}
