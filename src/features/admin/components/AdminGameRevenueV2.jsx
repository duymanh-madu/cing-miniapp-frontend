import { useCallback, useState } from "react";
import apiClient from "@/infra/api/apiClient";
import "./admin-game-revenue-v2.css";

const number = new Intl.NumberFormat("vi-VN");
function units(value, suffix) {
  try { return `${number.format(BigInt(value ?? "0"))} ${suffix}`; }
  catch { return "Dữ liệu không hợp lệ"; }
}
function iso(input) {
  if (!input) return null;
  const value = new Date(input);
  if (Number.isNaN(value.getTime())) throw new Error("Thời điểm báo cáo không hợp lệ");
  return value.toISOString();
}
export default function AdminGameRevenueV2({ token }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");
  const [funding, setFunding] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const start = iso(from);
      const end = iso(to);
      if (start && end && end <= start) throw new Error("Mốc kết thúc phải sau mốc bắt đầu");
      const response = await apiClient.get("/admin/wallet/game-revenue", {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...(start ? { from: start } : {}), ...(end ? { to: end } : {}),
          ...(category ? { category } : {}), ...(funding ? { funding_source: funding } : {}),
          limit: 100 },
      });
      const result = response.data?.data;
      if (!response.data?.success || !result || result.is_net_revenue !== false || !Array.isArray(result.items))
        throw new Error("Phản hồi báo cáo không hợp lệ");
      setData(result);
    } catch (e) {
      setData(null);
      setError(e.response?.data?.error || e.message || "Không tải được báo cáo");
    } finally { setLoading(false); }
  }, [token, from, to, category, funding, loading]);
  return (
    <section className="admin-wallet__section admin-game-revenue-v2">
      <div className="admin-wallet__section-head"><div>
        <p>GAME ECONOMY · PURCHASE ACTIVITY</p><h2>Giao dịch game theo nguồn thanh toán</h2>
      </div></div>
      <p className="admin-game-revenue-v2__note">Giá trị mua hàng gộp, chưa trừ hoàn tiền/đảo giao dịch; không phải doanh thu thuần hoặc tiền ngân hàng thực thu. Điểm tích lũy được báo cáo riêng, không cộng vào VND Wallet. Không bao gồm nạp ví và phí lượt chơi V1.</p>
      <div className="admin-game-revenue-v2__filters">
        <label>Từ<input type="datetime-local" value={from} onChange={e => setFrom(e.target.value)}/></label>
        <label>Đến<input type="datetime-local" value={to} onChange={e => setTo(e.target.value)}/></label>
        <label>Nhóm<select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Tất cả</option><option value="revive_credit">Revive Credit</option><option value="gift_charm">Gift/Charm</option>
        </select></label>
        <label>Nguồn<select value={funding} onChange={e => setFunding(e.target.value)}>
          <option value="">Tất cả</option><option value="wallet">Wallet</option><option value="points">Points</option>
        </select></label>
        <button type="button" disabled={loading} onClick={load}>{loading ? "Đang tải…" : "Xem giao dịch game"}</button>
      </div>
      {error && <p role="alert" className="admin-game-revenue-v2__error">{error}</p>}
      {data && <>
        <div className="admin-game-revenue-v2__metrics">
          <article><span>Đã chi bằng Wallet cho game</span><strong>{units(data.gross_wallet_vnd,"đ")}</strong></article>
          <article><span>Điểm đã dùng mua game</span><strong>{units(data.loyalty_points_used,"điểm")}</strong></article>
          <article><span>Giao dịch mua</span><strong>{units(data.purchase_count,"")}</strong></article>
          <article><span>Points chờ/ lỗi đồng bộ iPOS</span><strong>{units(data.points_ipos_not_synced,"")}</strong></article>
        </div>
        <p className="admin-game-revenue-v2__note">Hiển thị tối đa {data.items_limit} giao dịch gần nhất theo bộ lọc; các tổng số tính trên toàn kỳ. {data.purchase_count > data.items.length ? "Danh sách đang được giới hạn, không phải toàn bộ lịch sử." : ""}</p>
        <div className="admin-game-revenue-v2__scroll"><table><thead><tr><th>Thời gian</th><th>Nhóm</th><th>Nguồn</th><th>Người mua</th><th>Người nhận</th><th>Wallet</th><th>Points</th><th>iPOS</th></tr></thead><tbody>
          {data.items.map(item => <tr key={`${item.category}-${item.purchase_id}`}>
            <td>{new Date(item.created_at).toLocaleString("vi-VN")}</td>
            <td>{item.category === "gift_charm" ? `Gift/Charm · ${item.product_name || ""}` : "Revive Credit"}</td>
            <td>{item.funding_source}</td><td>{item.user_id}</td><td>{item.recipient_user_id || "—"}</td>
            <td>{units(item.wallet_vnd,"đ")}</td><td>{units(item.points_used,"điểm")}</td>
            <td>{item.ipos_sync_status || "—"}</td>
          </tr>)}
        </tbody></table></div>
      </>}
    </section>
  );
}
