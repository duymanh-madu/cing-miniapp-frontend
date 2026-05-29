import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MenuCategories from "@/features/menu/components/MenuCategories";
import MenuGrid from "@/features/menu/components/MenuGrid";
import useMenu from "@/features/menu/hooks/useMenu";

export default function MenuPage() {
  const [search, setSearch] = useState("");
  const { isError, error, isLoading } = useMenu();
  const queryClient = useQueryClient();

  
  // Realtime menu update từ Foodbook webhook
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket && socket.connected) {
        socket.on("menu.updated", () => {
          console.log('[MENU] Realtime update received');
          queryClient.invalidateQueries({ queryKey: ["menu"] });
        });
        // Event 26: OUT_OF_STOCK realtime - update item status ngay lập tức
        socket.on("menu.item_out_of_stock", (data) => {
          console.log('[MENU] Item out of stock:', data.item_id, data.status);
          // Update state trực tiếp không cần fetch lại
          setMenuData(prev => {
            if (!prev) return prev;
            return prev.map(category => ({
              ...category,
              items: (category.items || []).map(item => {
                if (item.store_item_id === data.item_id || item.id === data.item_id) {
                  return { ...item, status: data.status };
                }
                return item;
              })
            }));
          });
        });
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();
    return () => {
      const s = getRuntimeSocket();
      s?.off("menu.updated");
      s?.off("menu.item_out_of_stock");
    };
  }, []);


  return (
    <div style={{ background:"#fafafa" }}>
      <div style={{
        background:"white",
        borderBottom:"1px solid #f0f0f0",
        padding:"14px 16px 0",
        position:"sticky", top:0, zIndex:10,
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <h1 style={{ fontSize:20, fontWeight:900, color:"#1a1a1a", margin:0 }}>Thực đơn</h1>
          <span style={{ fontSize:11, color:"#bbb" }}>Cing Hu Tang Kinh Bắc</span>
        </div>
        <div style={{
          display:"flex", alignItems:"center",
          background:"#f5f5f5", borderRadius:12,
          padding:"8px 12px", gap:8, marginBottom:10,
        }}>
          <span style={{ fontSize:14, color:"#bbb" }}>🔍</span>
          <input
            type="text"
            placeholder="Tìm món..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex:1, border:"none", outline:"none",
              background:"none", fontSize:13, color:"#333",
            }}
          />
          {search && (
            <button onClick={() => setSearch("")}
              style={{ border:"none", background:"none", color:"#bbb", fontSize:14, padding:0, cursor:"pointer" }}>
              ✕
            </button>
          )}
        </div>
        <MenuCategories />
      </div>

      {isError && (
        <div style={{ padding:"16px", margin:"12px", background:"#fff3f3",
          borderRadius:12, border:"1px solid #ffcdd2", textAlign:"center" }}>
          <p style={{ fontSize:13, color:"#c62828", margin:"0 0 8px", fontWeight:600 }}>
            Không tải được thực đơn
          </p>
          <p style={{ fontSize:11, color:"#ef9a9a", margin:0 }}>
            {error?.message || "Vui lòng kiểm tra kết nối mạng"}
          </p>
        </div>
      )}

      <MenuGrid search={search} />
      <div style={{ height:100 }} />
    </div>
  );
}
