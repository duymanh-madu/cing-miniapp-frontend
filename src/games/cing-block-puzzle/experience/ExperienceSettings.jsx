import React, { useEffect, useRef } from 'react';
export default function ExperienceSettings({ preferences, onChange, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('button')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); }
      if (event.key !== 'Tab') return;
      const controls = [...dialog.querySelectorAll('button, input')];
      const first = controls[0]; const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener('keydown', onKey);
    return () => {
      dialog.removeEventListener('keydown', onKey);
      if (typeof dialog.close === 'function') dialog.close();
      previousFocus?.focus?.();
    };
  }, []);
  return <div className="cing-block-puzzle__settings-backdrop"><dialog ref={dialogRef} className="cing-block-puzzle__settings" onCancel={(event) => { event.preventDefault(); onClose(); }} aria-labelledby="block-settings-title">
    <header><div><small>CHƠI THEO CÁCH CỦA BẠN</small><h2 id="block-settings-title">Âm thanh & cảm giác</h2></div><button type="button" onClick={onClose} aria-label="Đóng cài đặt">×</button></header>
    <p>Tinh chỉnh ngay trong ván. Các lựa chọn được ghi nhớ trên thiết bị này.</p>
    {[['sound', 'Âm hiệu ứng', 'Tiếng đặt khối, xoá hàng và combo'], ['voice', 'Giọng cổ vũ', 'Lời khen cho nước đi nổi bật · tuỳ thiết bị'], ['music', 'Nhạc nền', 'Giai điệu Cing nhẹ nhàng'], ['vibration', 'Rung phản hồi', 'Chạm nhẹ khi đặt khối và xoá hàng']].map(([key, label, hint]) => <label className="cing-block-puzzle__setting-row" key={key}>
      <span><strong>{label}</strong><small>{hint}</small></span><input type="checkbox" role="switch" checked={preferences[key]} onChange={(event) => onChange({ [key]: event.target.checked })} />
    </label>)}
    <label className="cing-block-puzzle__volume"><span>Âm lượng <output>{Math.round(preferences.volume * 100)}%</output></span><input aria-label="Âm lượng" type="range" min="0" max="1" step="0.05" value={preferences.volume} onChange={(event) => onChange({ volume: Number(event.target.value) })} /></label>
    <fieldset><legend>Hiệu ứng hình ảnh</legend><div className="cing-block-puzzle__effect-options">{[['full', 'Sống động'], ['calm', 'Nhẹ nhàng']].map(([value, label]) => <label key={value}><input type="radio" name="block-effects" value={value} checked={preferences.effects === value} onChange={() => onChange({ effects: value })} />{label}</label>)}</div></fieldset>
    <p className="cing-block-puzzle__setting-note">Rung tuỳ khả năng thiết bị. Chế độ giảm chuyển động của hệ thống luôn được tôn trọng.</p>
    <button type="button" className="cing-block-puzzle__settings-done" onClick={onClose}>Tiếp tục chơi</button>
  </dialog></div>;
}
