import React, { lazy, Suspense, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import { Coins, Wallet, Megaphone, Shirt, Crown, Image, UserRound, Check, Plus, X } from 'lucide-react';
import PlazaTitleV10 from './PlazaTitleV10.jsx';
import { PLAZA_TITLES_V10 } from './plazaTitleCatalogV10.js';
import './PlazaInventoryV19.css';
import './PlazaV19PremiumV4.css';
import './PlazaV19Block06.css';

const Avatar = lazy(() => import('../scene/PlazaAvatarPreviewV16.jsx'));
const TYPES = [
  ['titles', 'Danh hiệu', Crown],
  ['outfits', 'Trang phục', Shirt],
  ['items', 'Vật phẩm', Megaphone],
  ['decor', 'Trang trí', Image],
];
const TITLE_GROUPS = {
  membership: ['member', 'loyal', 'silver', 'gold', 'diamond', 'partner', 'loyal_partner'],
  charm: ['idol', 'ngoi_sao', 'minh_tinh'],
  honor: ['champion', 'hof_1', 'hof_2', 'hof_3'],
};
const fmt = value => Number(value || 0).toLocaleString('vi-VN');
const integerInRange = (value, max) => Number.isSafeInteger(Number(value)) && Number(value) >= 1 && Number(value) <= max;

export default function PlazaInventoryV16({ mode, identity, character, social, onChooseBadge, onProfile }) {
  const [tab, setTab] = useState(mode === 'shop' ? 'items' : 'titles');
  const [group, setGroup] = useState('all');
  const [quantity, setQuantity] = useState('1');
  const [topup, setTopup] = useState('10');
  const [detail, setDetail] = useState(null);
  const [topupMode, setTopupMode] = useState(null);
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(null);

  const own = social.overview;
  const owned = new Set(identity?.ownedBadges || own?.profile?.ownedBadges || []);
  const selected = identity?.selectedBadge || own?.profile?.selectedBadge;
  const catalog = mode === 'shop' ? Object.keys(PLAZA_TITLES_V10) : [...owned];
  const titles = catalog.filter(key => group === 'all' || TITLE_GROUPS[group]?.includes(key));
  const financialBusy = social.busy || Boolean(social.pending);
  const enabled = Boolean(own?.commerceEnabled);

  async function pay() {
    if (!confirm || financialBusy) return;
    const pending = confirm;
    const ok = await social.run(pending.op, { quantity: pending.quantity });
    if (ok) setConfirm(null);
  }

  function requestLoudspeakerPurchase() {
    if (financialBusy || !enabled || !integerInRange(quantity, 1000)) return;
    const count = Number(quantity);
    setDetail(null);
    setConfirm({
      op:'buy_loudspeaker',
      quantity: count,
      label: `Mua ${count} loa với ${count * 3} Coin`,
    });
  }

  function requestTopup() {
    if (financialBusy || !enabled || !integerInRange(topup, 1000000)) return;
    const count = Number(topup);
    setTopupMode(null);
    setConfirm({
      op:'convert',
      quantity: count,
      label: `Nạp ${count} Coin từ ${fmt(count * 1000)}đ Cing Wallet`,
    });
  }

  const modal = (label, body, close) => (
    <div className="plaza-v16-overlay" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="plaza-v16-confirm plaza-v19-detail" role="dialog" aria-modal="true" aria-label={label}>
        <button type="button" className="plaza-v19-close" aria-label="Đóng" disabled={financialBusy} onClick={close}><X size={19}/></button>
        {body}
      </section>
    </div>
  );

  return (
    <section className="plaza-v16-inventory plaza-v19-inventory">
      <div className="plaza-v16-assets plaza-v19-assets">
        <span className="plaza-v19-balance"><Coins size={17}/><b>{fmt(own?.coinBalance)} Coin</b></span>
        <span className="plaza-v19-balance"><Wallet size={17}/><b>{fmt(own?.walletBalance)}đ</b></span>
        <button
          type="button"
          className="plaza-v19-topup-trigger"
          aria-label="Nạp tài sản"
          title="Nạp tài sản"
          disabled={financialBusy}
          onClick={() => setTopupMode('choose')}
        ><Plus size={16}/><span>Nạp</span></button>
        <button type="button" className="plaza-v19-profile-shortcut" onClick={onProfile}><UserRound size={16}/><span>Hồ sơ</span></button>
      </div>

      <div className="plaza-v16-inventory-body plaza-v19-inventory-body">
        <aside className="plaza-v19-avatar-stage plaza-v19-premium-stage" aria-label="Phong cách của bạn">
          <div className="plaza-v19-premium-character">
            <Suspense fallback={<div className="plaza-v16-preview">Đang tải nhân vật…</div>}>
              <Avatar character={character} titleKey={selected} interactiveZoom/>
            </Suspense>
          </div>
          <div className="plaza-v19-premium-rank">
            <span className="plaza-v19-premium-caption">Danh hiệu</span>
            <div className="plaza-v19-premium-title-art"><PlazaTitleV10 titleKey={selected} size="preview"/></div>
            <small>{selected ? 'Đang hiển thị' : 'Chưa chọn danh hiệu'}</small>
          </div>
        </aside>

        <div className="plaza-v16-catalog plaza-v19-catalog">
          <nav role="tablist" aria-label="Loại vật phẩm">
            {TYPES.map(([id, label, Icon]) => (
              <button type="button" role="tab" key={id} aria-selected={tab === id}
                onClick={() => { setTab(id); setDetail(null); }}>
                <Icon size={16}/><span>{label}</span>
              </button>
            ))}
          </nav>

          {tab === 'titles' ? (
            <>
              <div className="plaza-v16-filters">
                {[
                  ['all', 'Tất cả'],
                  ['membership', 'Thành viên'],
                  ['charm', 'Quyến rũ'],
                  ['honor', 'Vinh danh'],
                ].map(([id, label]) => (
                  <button type="button" key={id} aria-pressed={group === id} onClick={() => setGroup(id)}>{label}</button>
                ))}
              </div>
              <div className="plaza-v16-item-grid plaza-v18-title-grid plaza-v19-item-grid">
                {titles.map(key => (
                  <button type="button" key={key} className="plaza-v19-item-card"
                    aria-label={`Xem danh hiệu ${PLAZA_TITLES_V10[key]?.label || key}`}
                    aria-pressed={selected === key} onClick={() => setDetail({ type: 'title', key })}>
                    <span className="plaza-v19-card-art"><PlazaTitleV10 titleKey={key} size="wardrobe"/></span>
                    <small className="plaza-v19-card-meta">{selected === key ? 'Đang hiển thị' : owned.has(key) ? 'Đã sở hữu' : 'Chưa sở hữu'}</small>
                  </button>
                ))}
              </div>
              {!titles.length && <p className="plaza-v16-empty">Bạn chưa có danh hiệu trong nhóm này.</p>}
            </>
          ) : tab === 'items' ? (
            <div className="plaza-v16-item-grid plaza-v19-item-grid">
              <button type="button" className="plaza-v19-item-card" onClick={() => setDetail({ type: 'loudspeaker' })}>
                <span className="plaza-v19-card-art plaza-v19-card-item"><img className="plaza-v19-loa-art" src="/cing-plaza/assets/v19/loa-the-gioi-premium.webp" alt="" loading="lazy"/></span>
                <strong className="plaza-v19-card-name">Loa thế giới</strong>
                <small className="plaza-v19-card-meta plaza-v19-price">3 Coin / loa</small>
              </button>
            </div>
          ) : tab === 'outfits' ? (
            <div className="plaza-v16-item-grid plaza-v19-item-grid">
              <button type="button" className="plaza-v19-item-card" aria-pressed="true" onClick={() => setDetail({ type: 'outfit' })}>
                <span className="plaza-v19-card-art plaza-v19-card-item"><Shirt size={38}/></span>
                <strong className="plaza-v19-card-name">Trang phục mặc định</strong>
                <small className="plaza-v19-card-meta">Đang mặc</small>
              </button>
            </div>
          ) : (
            <div className="plaza-v16-empty"><Image size={34}/><h3>Trang trí hồ sơ</h3>
              <p>Khung ảnh, nền và hiệu ứng bạn sở hữu sẽ hiển thị tại đây.</p>
              <button type="button" onClick={onProfile}>Xem hồ sơ hiện tại</button>
            </div>
          )}

          {!own && <button type="button" onClick={() => social.refresh().catch(() => {})}>Tải tài sản</button>}
          {social.error && <p role="alert">{social.error}</p>}
        </div>
      </div>

      {detail?.type === 'title' && modal('Chi tiết danh hiệu', <>
        <div className="plaza-v19-detail-art"><PlazaTitleV10 titleKey={detail.key} size="wardrobe"/></div>
        <p>{selected === detail.key ? 'Bạn đang hiển thị danh hiệu này.' : owned.has(detail.key) ? 'Danh hiệu đã thuộc sở hữu của bạn.' : 'Danh hiệu này chưa thuộc sở hữu của bạn.'}</p>
        {owned.has(detail.key) && selected !== detail.key && <button type="button" disabled={social.busy}
          onClick={() => { const key = detail.key; onChooseBadge(key); setDetail(null); }}>Chọn hiển thị</button>}
      </>, () => setDetail(null))}

      {detail?.type === 'loudspeaker' && modal('Chi tiết Loa thế giới', <>
        <div className="plaza-v19-detail-art plaza-v19-item-details"><img className="plaza-v19-loa-art plaza-v19-loa-art--detail" src="/cing-plaza/assets/v19/loa-the-gioi-premium.webp" alt="Loa thế giới phong cách Kinh Bắc"/></div>
        <h2>Loa thế giới</h2>
        <p>Một lời nhắn gửi tới mọi Cing iu trên server.</p>
        <strong className="plaza-v19-detail-price">3 Coin / loa</strong>
        <small>Đang sở hữu: {fmt(own?.loudspeakers)} loa</small>
        {mode === 'shop' ? <div className="plaza-v16-purchase">
          <label>Số lượng<input inputMode="numeric" type="number" min="1" max="1000"
            value={quantity} onChange={event => setQuantity(event.target.value)}/></label>
          <button type="button" disabled={financialBusy || !enabled || !integerInRange(quantity, 1000)}
            onClick={requestLoudspeakerPurchase}>Mua loa</button>
        </div> : <p>Mở kênh Loa thế giới trong chat để sử dụng.</p>}
      </>, () => setDetail(null))}

      {detail?.type === 'outfit' && modal('Chi tiết trang phục', <>
        <div className="plaza-v19-detail-art plaza-v19-item-details"><Shirt size={66}/></div>
        <h2>Trang phục mặc định</h2>
        <p>Đang mặc · {character === 'girl' ? 'Nữ' : 'Nam'}</p>
      </>, () => setDetail(null))}

      {topupMode === 'choose' && modal('Chọn tài sản muốn nạp', <>
        <h2>Nạp tài sản</h2>
        <div className="plaza-v19-finance-choices">
          <button type="button" onClick={() => { setTopupMode(null); navigate('/wallet'); }}><Wallet size={23}/><span><strong>Nạp Cing Wallet</strong><small>Đến Ví Cing Wallet để nạp tiền</small></span></button>
          <button type="button" disabled={financialBusy || !enabled} onClick={() => setTopupMode('coin')}><Coins size={23}/><span><strong>Nạp Cing Coin</strong><small>Đổi từ số dư Wallet hiện có</small></span></button>
        </div>
      </>, () => setTopupMode(null))}
      {topupMode === 'coin' && modal('Nạp Cing Coin', <>
        <Coins size={30}/>
        <h2>Nạp Cing Coin</h2>
        <p>1 Coin = 1.000đ từ Cing Wallet</p>
        <label className="plaza-v19-topup-quantity">Số Coin muốn nạp
          <input aria-label="Số Coin muốn nạp" type="number" inputMode="numeric" min="1" max="1000000"
            value={topup} onChange={event => setTopup(event.target.value)}/>
        </label>
        <button type="button" disabled={financialBusy || !enabled || !integerInRange(topup, 1000000)}
          onClick={requestTopup}>Tiếp tục</button>
      </>, () => setTopupMode(null))}

      {confirm && modal('Xác nhận thanh toán', <>
        <Coins size={30}/><h2>Xác nhận</h2><p>{confirm.label}</p>
        <button type="button" disabled={financialBusy} onClick={pay}>{social.busy ? 'Đang xử lý…' : 'Xác nhận'}</button>
        <button type="button" disabled={financialBusy} onClick={() => setConfirm(null)}>Quay lại</button>
        {social.error && <p role="alert">{social.error}</p>}
      </>, () => { if (!financialBusy) setConfirm(null); })}
    </section>
  );
}
