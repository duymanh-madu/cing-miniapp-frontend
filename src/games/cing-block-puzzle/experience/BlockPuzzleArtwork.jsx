import React from 'react';
// Original Cing spark character, rendered as vector artwork at every resolution.
export function CingSpark({ variant = 'star', className = '' }) {
  return <svg className={className} viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path d="M20 61 6 69l10-23M80 61l14 8-10-23" fill="#FFAD42" stroke="#713C96" strokeWidth="3" strokeLinejoin="round" />
    <path d="m50 5 14 23 26 7-17 23 1 28-24-10-24 10 1-28L10 35l26-7Z" fill="#F7AA35" stroke="#713C96" strokeWidth="3" strokeLinejoin="round"/>
    <path d="m50 12 12 22 22 4-17 20 1 20-18-8-18 8 1-20-17-20 22-4Z" fill="#FFDF72"/>
    <path d="m37 33 13-17 9 18-9-5Z" fill="#FFF8C1"/>
    {variant === 'rise' ? <path d="m35 49 15-13 15 13M50 37v25" stroke="#622E65" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/> : <>
      <path d="M34 47q5-8 10 0M57 47q5-8 10 0" stroke="#622E65" strokeWidth="4" strokeLinecap="round"/>
      <path d="M40 56q10 18 20 0Z" fill="#793E65"/><path d="M44 61h12" stroke="#FF9DB0" strokeWidth="4" strokeLinecap="round"/>
      <ellipse cx="29" cy="54" rx="6" ry="3" fill="#FF9C77"/><ellipse cx="72" cy="54" rx="6" ry="3" fill="#FF9C77"/>
    </>}
    <path d="m12 16 2 6 6 2-6 2-2 6-2-6-6-2 6-2ZM88 7l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#A3EFFF"/>
  </svg>;
}

export function CingGameEmblem({ kind='revive', className='' }) {
  return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
    {kind==='settings' ? <><path d="m27 7 10 0 2 7 6 3 7-1 5 9-5 5v6l5 5-5 9-7-1-6 3-2 7H27l-2-7-6-3-7 1-5-9 5-5v-6l-5-5 5-9 7 1 6-3Z" fill="currentColor"/><circle cx="32" cy="32" r="11" fill="#1A2D53"/></> : kind==='trophy' ? <><path d="M18 11h28v17c0 19-28 19-28 0Z" fill="#FFD77A" stroke="#C48532" strokeWidth="3"/><path d="M18 17H9v8q0 12 13 12M46 17h9v8q0 12-13 12" stroke="#EFAE4C" strokeWidth="5"/><path d="M32 41v11M21 55h22" stroke="#FFD77A" strokeWidth="6" strokeLinecap="round"/><path d="m32 17 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z" fill="#FFF7D2"/></> : <><rect x="12" y="5" width="40" height="54" rx="12" fill="#784663" stroke="#F6C374" strokeWidth="3"/><rect x="17" y="10" width="30" height="44" rx="8" fill="#FFC478"/><path d="M32 44S17 35 21 27c3-7 9-3 11 0 3-4 9-7 12 0 4 8-12 17-12 17Z" fill="#E16C75" stroke="#8D3D65" strokeWidth="2"/><path d="m23 17 2 5 5 1-5 2-2 5-1-5-5-2 5-1Z" fill="#FFF8CB"/></>}
  </svg>;
}
