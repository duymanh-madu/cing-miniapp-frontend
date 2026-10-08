import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import PlazaSceneV1 from '../scene/PlazaSceneV1.jsx';

function Preview() {
  const [mounted, setMounted] = useState(true);
  const [review, setReview] = useState(true);
  return <main style={{ maxWidth: 1100, margin: 'auto', padding: '20px 12px', fontFamily: 'system-ui', color: '#442b1b' }}>
    <h1 style={{ fontSize: 24 }}>Cing Plaza — xem trước trên máy</h1>
    <p style={{ fontSize: 14 }}>Kiểm tra map và chuyển động Girl/Boy. Trang này không kết nối phòng/chat và chưa đồng bộ chuyển động với người khác.</p>
    <button style={{ padding: '10px 16px', marginBottom: 16 }} onClick={() => setMounted(value => !value)}>{mounted ? 'Đóng cảnh để kiểm tra' : 'Mở lại cảnh'}</button>
    <button style={{ padding: '10px 16px', margin: '0 0 16px 8px' }} onClick={() => setReview(v=>!v)}>{review ? 'Xem UI production' : 'Về bản review'}</button>
    {mounted && <PlazaSceneV1 diagnostics={review} />}
  </main>;
}

if (!import.meta.env.DEV) {
  document.getElementById('root').textContent = 'Trang xem trước chỉ dùng khi chạy npm run dev.';
} else {
  createRoot(document.getElementById('root')).render(<Preview />);
}
