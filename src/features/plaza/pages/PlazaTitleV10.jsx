import React from 'react';
import {PLAZA_TITLES_V10} from './plazaTitleCatalogV10.js';
import './PlazaTitleV10.css';
import './PlazaPrestigeCollectionV18.css';

// Presentation only. All 14 title keys, ownership, pricing and selection
// remain controlled by the pre-existing Plaza authority/catalog.
const base='/cing-plaza/assets/v18/approved-image2/';
const featureLevel=Object.freeze({
  idol:1,hof_3:1,ngoi_sao:2,hof_2:2,minh_tinh:3,hof_1:3,
});
// Visual hierarchy only; underlying CRM tier / badge authority remains unchanged.
const ordinaryVisualRank=Object.freeze({
 member:0,loyal:0,silver:1,gold:2,partner:2,champion:2,diamond:3,loyal_partner:3,
});
export default function PlazaTitleV10({titleKey,size='overhead'}){
  const title=PLAZA_TITLES_V10[titleKey];
  if(!title)return null;
  const premium=featureLevel[titleKey]||0;
  const ordinaryRank=ordinaryVisualRank[titleKey]??-1;
  const scene=['identity','chat','micro','preview','overhead'].includes(size);
  return <span
    className={`plaza-prestige-v18 plaza-prestige-v18--${size} plaza-prestige-v18--level${premium} plaza-prestige-v18--ordinary${ordinaryRank}`}
    data-title-key={titleKey}
    aria-label={`${title.label}, ${title.stars} sao`}
  >
    {scene?<>
      <img className="plaza-prestige-v18__icon"
        src={`${base}${titleKey}_icon.png`} alt="" draggable="false" decoding="async"/>
      {size!=='preview'&&<span className="plaza-prestige-v18__name">{title.label}</span>}
    </>:<img className="plaza-prestige-v18__art"
      src={`${base}${titleKey}_store.png`} alt=""
      loading="lazy" decoding="async" draggable="false"/>}
  </span>;
}
