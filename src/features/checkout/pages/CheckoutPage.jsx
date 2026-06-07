import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";
import { useMembership } from "@/features/home/hooks/useMembership";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import QRCode from "qrcode";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

const STORE_LAT = 21.112148;
const STORE_LNG = 105.948725;

function calcDistKm(lat1,lng1,lat2,lng2){
  const R=6371,dL=(lat2-lat1)*Math.PI/180,dl=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function calcShipFee(sub,km){
  if(km>=10) return -1;
  if(km<2)   return 0;
  if(km<3)   return sub>=200000?0:sub>=100000?10000:15000;
  if(km<5)   return sub>=200000?0:sub>=100000?15000:25000;
  if(km<8)   return sub>=500000?0:sub>=200000?20000:sub>=100000?30000:35000;
  return sub>=500000?0:sub>=200000?25000:sub>=100000?35000:50000;
}

const ORDER_TYPES=[
  {id:"dine_in",label:"Ăn tại quán",icon:"🪑"},
  {id:"takeaway",label:"Mang về",icon:"🛍"},
  {id:"delivery",label:"Giao hàng",icon:"🛵"},
];

function Field({label,value,onChange,placeholder,type="text"}){
  const [focus,setFocus]=useState(false);
  return(
    <div style={{marginBottom:12}}>
      <p style={{fontSize:11,fontWeight:600,color:"#666",margin:"0 0 5px"}}>{label}</p>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",border:`1.5px solid ${focus?"#D4531C":"#f0f0f0"}`,
          borderRadius:10,padding:"10px 12px",fontSize:13,color:"#333",
          outline:"none",boxSizing:"border-box",background:"#fafafa"}}
        onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}/>
    </div>
  );
}

export default function CheckoutPage(){
  const navigate=useNavigate();
  const items=useCartStore(s=>s.items);
  const increment=useCartStore(s=>s.increment);
  const decrement=useCartStore(s=>s.decrement);
  const clearCart=useCartStore(s=>s.clearCart);
  const profile=useAuthStore(s=>s.profile);

  const subtotal=items.reduce((s,i)=>s+(i.price||0)*i.qty,0);
  const count=items.reduce((s,i)=>s+i.qty,0);

  const [orderType,setOrderType]=useState("dine_in");
  const [name,setName]=useState(profile?.name||profile?.displayName||"");
  // Update name khi profile thay đổi (sau khi bootstrap sync xong)
  useEffect(() => {
    const n = profile?.name || profile?.displayName || "";
    if (n) setName(n);
  }, [profile?.name, profile?.displayName]);
  const [phone,setPhone]=useState(profile?.phone||"");
  const [address,setAddress]=useState("");
  const [note,setNote]=useState("");
  const [shipFee,setShipFee]=useState(0);
  const [shipStatus,setShipStatus]=useState("idle"); // idle|loading|done|error|contact
  const [distKm,setDistKm]=useState(null);
  const [locMsg,setLocMsg]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [momoPayUrl, setMomoPayUrl] = useState(null);
  const [momoQR, setMomoQR] = useState(null);
  const [momoDeeplink, setMomoDeeplink] = useState(null);
  const [momoOrderId,  setMomoOrderId]  = useState(null);

  // Lắng nghe payment.success từ socket — realtime, không poll
  useEffect(() => {
    if (!momoPayUrl) return;
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.on("payment.success", (data) => {
          // Chỉ xử lý nếu đúng user hoặc không có user_id filter
          const myPhone = (runtimePhone || profile?.phone || "").replace(/\D/g,"").replace(/^84/,"0");
          const eventUserId = String(data?.payload?.user_id || "");
          if (!eventUserId || eventUserId === myPhone || eventUserId === profile?.id) {
            clearCart();
            navigate("/order-success");
          }
        });
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();
    return () => { getRuntimeSocket()?.off("payment.success"); };
  }, [momoPayUrl]);
  const runtimePhone = useRuntimeCustomerIdentityStore(s => s.identity?.phone);
  const memberPhone = (() => {
    for (const src of [runtimePhone, profile?.phone]) {
      if (!src || src === "pending") continue;
      const n = src.replace(/\D/g,"").replace(/^84/,"0");
      if (n.length >= 9) return n;
    }
    return "";
  })();
  // Pre-fill phone field khi có memberPhone
  useEffect(() => {
    if (memberPhone && !phone) setPhone(memberPhone);
  }, [memberPhone]);
  const { data: membership } = useMembership(memberPhone);
  const availablePoints = membership?.points || 0;
  const pointsDiscount = pointsToUse * 1000; // 1 diem = 1000 VND

  // Giảm giá theo hạng thành viên
  const TIER_DISCOUNTS = {
    member: 0, loyal: 0.01, silver: 0.02, gold: 0.03, diamond: 0.05,
    partner: 0.03, loyal_partner: 0.05,
  };
  const tierKey = membership?.tierKey || "member";
  const tierDiscountRate = TIER_DISCOUNTS[tierKey] || 0;
  const tierDiscount = Math.floor(subtotal * tierDiscountRate);

  useEffect(()=>{
    if(orderType!=="delivery"){
      setShipFee(0);setDistKm(null);setShipStatus("idle");setLocMsg("");
      return;
    }
    setShipStatus("loading");setLocMsg("");

    // zmp-sdk getLocation cho Zalo Mini App WebView
    // navigator.geolocation bị block trong Zalo WebView
    const getLocation = async () => {
      try {
        const zmpSdk = await import("zmp-sdk");
        const result = await zmpSdk.getLocation();
        console.log("[LOCATION] zmp-sdk result:", JSON.stringify(result));

        // Thử latitude/longitude trực tiếp (deprecated nhưng vẫn hoạt động một số version)
        if (result?.latitude && result?.longitude) {
          return { latitude: parseFloat(result.latitude), longitude: parseFloat(result.longitude) };
        }

        // Nếu có token → gửi lên backend decode
        if (result?.token) {
          try {
            const { default: apiClient } = await import("@/infra/api/apiClient");
            const r = await apiClient.post("/shipping/decode-location", {
              token: result.token,
              amount: subtotal,
            });
            if (r.data?.success && r.data?.latitude && r.data?.longitude) {
              return { latitude: r.data.latitude, longitude: r.data.longitude };
            }
          } catch(e) {
            console.warn("[LOCATION] decode-location failed:", e.message);
          }
        }

        throw new Error("NO_LOCATION");
      } catch(e) {
        // Fallback navigator.geolocation cho môi trường web/dev
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) { reject(new Error("NO_GEO")); return; }
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            err => reject(err),
            { timeout: 10000, enableHighAccuracy: false }
          );
        });
      }
    };

    getLocation()
      .then(async coords => {
        const km = calcDistKm(coords.latitude, coords.longitude, STORE_LAT, STORE_LNG);
        setDistKm(km);
        try {
          const r = await apiClient.get(`/shipping/estimate?lat=${coords.latitude}&lng=${coords.longitude}&amount=${subtotal}`);
          if(r.data?.success && r.data?.ship_fee !== null){
            const fee = r.data.ship_fee;
            if(fee===-1){
              setShipFee(0);setShipStatus("contact");
              setLocMsg(`Khoảng cách ${km.toFixed(1)}km > 10km. Nhà hàng sẽ liên hệ báo phí ship.`);
            } else {
              setShipFee(fee);setShipStatus("done");
              setLocMsg(`Khoảng cách: ${km.toFixed(1)} km`);
            }
          } else {
            const fee=calcShipFee(subtotal,km);
            if(fee===-1){
              setShipFee(0);setShipStatus("contact");
              setLocMsg(`Khoảng cách ${km.toFixed(1)}km > 10km. Nhà hàng sẽ liên hệ báo phí ship.`);
            } else {
              setShipFee(fee);setShipStatus("done");
              setLocMsg(`Khoảng cách: ${km.toFixed(1)} km`);
            }
          }
        } catch(e){
          const fee=calcShipFee(subtotal,km);
          if(fee===-1){
            setShipFee(0);setShipStatus("contact");
            setLocMsg(`Khoảng cách ${km.toFixed(1)}km > 10km. Nhà hàng sẽ liên hệ báo phí ship.`);
          } else {
            setShipFee(fee);setShipStatus("done");
            setLocMsg(`Khoảng cách: ${km.toFixed(1)} km (ước tính)`);
          }
        }
      })
      .catch(err => {
        if(err.code===1 || err.message==="NO_GEO" || err.message==="NO_LOCATION"){
          setShipFee(0);setShipStatus("denied");
          setLocMsg("Vui lòng cho phép truy cập vị trí để tính phí ship chính xác");
        } else {
          setShipFee(25000);setShipStatus("error");
          setLocMsg("Không lấy được vị trí. Áp dụng phí ship mặc định 25.000đ");
        }
      });
  },[orderType]);

  const total=Math.max(0, subtotal+shipFee-pointsDiscount-tierDiscount);

  async function handleOrder(){
    if(!name.trim()){setError("Vui lòng nhập họ tên");return;}
    if(orderType==="delivery"&&!address.trim()){setError("Vui lòng nhập địa chỉ giao hàng");return;}
    setLoading(true);setError("");
    try{
      const userId=profile?.id||profile?.userId||profile?.zalo_id||"guest-"+Date.now();
      const phone=(profile?.phone||profile?.phoneNumber||"").replace(/\D/g,"");

      // 1. Tao don hang
      const orderPayload={
        user_id:userId,
        customer_name:name.trim(),
        shipping_address:address.trim(),
        payment_method:"momo",
        payment_status:"pending",
        status_code:"pending_payment",
        items:items.map(i=>({
          item_id:i.id,
          item_code:i.code||i.id,
          name:i.displayName||i.name,
          price:i.price,
          quantity:i.qty,
          note:i.note||"",
        })),
        subtotal,
        shipping_fee:shipFee,
        shipping_distance:distKm?Math.round(distKm*10)/10:null,
        total_amount:total,
        points_used:    pointsToUse,
        tier_discount:  tierDiscount,
        points_discount: pointsDiscount,
      };
      const orderRes = await apiClient.post("/orders/create", orderPayload);
      const orderId = orderRes.data?.data?.id || orderRes.data?.order?.id;

      // 2. Tao MoMo payment session
      // Neu tong tien = 0 (chi dung diem) -> khong can MoMo
      if (total === 0 && pointsToUse > 0) {
        const deductPhone = memberPhone || (profile?.phone||"").replace(/\D/g,"").replace(/^84/,"0");
        if (!deductPhone) throw new Error("Không tìm thấy số điện thoại để trừ điểm");
        await apiClient.post("/points/pay-with-points", {
          user_id: deductPhone,
          phone: deductPhone,
          points: pointsToUse,
          order_id: orderId,
          order_data: {
            order_id: orderId,
            user_id: deductPhone,
            customer_name: name.trim(),
            customer_phone: deductPhone,
            shipping_address: address.trim(),
            shipping_fee: shipFee,
            items: items.map(i=>({
              item_id: i.id,
              item_code: i.code||i.id,
              name: i.displayName||i.name,
              price: i.price,
              quantity: i.qty,
            })),
            subtotal,
            total_amount: 0,
            points_used: pointsToUse,
            order_type: orderType,
          },
        });
        clearCart();
        navigate("/order-success");
        return;
      }

      const paymentRes = await apiClient.post("/payments/create-session", {
        user_id: userId,
        customer_name: name.trim(),
        customer_phone: phone,
        payment_provider: "momo",
        payment_method: "momo",
        total_amount: total,
        subtotal,
        shipping_fee: shipFee,
        shipping_distance: distKm?Math.round(distKm*10)/10:0,
        cart_snapshot: {
          items,
          customer_name: name.trim(),
          customer_phone: phone,
          shipping_address: address.trim(),
          shipping_fee: shipFee,
          points_used: pointsToUse,
        },
        shipping_address: address.trim(),
        order_id: orderId,
      });

      const payUrl       = paymentRes.data?.paymentUrl;
      const deeplinkMini = paymentRes.data?.payment?.deeplinkMiniApp || paymentRes.data?.payment?.deeplink;
      if(!payUrl) throw new Error("Không lấy được link thanh toán MoMo");

      // Generate QR từ deeplinkMiniApp (user scan bằng app MoMo)
      const qrTarget = deeplinkMini || payUrl;
      try {
        const qrImg = await QRCode.toDataURL(qrTarget, { width: 280, margin: 2 });
        setMomoQR(qrImg);
      } catch(e) {}
      setMomoDeeplink(deeplinkMini);
      setMomoPayUrl(payUrl);
      const txCode = paymentRes.data?.payment?.transaction_code || paymentRes.data?.transactionCode || "";
      setMomoOrderId(txCode);
      setLoading(false);
      return;
    }catch(e){
      const msg=e?.response?.data?.error||e?.response?.data?.message||"Đặt hàng thất bại. Vui lòng thử lại.";
      setError(msg);
    }finally{
      setLoading(false);
    }
  }

  // Hiển thị màn MoMo payment sau khi tạo session
  if (momoPayUrl) return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"white", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, zIndex:1000 }}>
      <div style={{ background:"white", borderRadius:20, padding:28, width:"100%", maxWidth:360, textAlign:"center", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
        <div style={{ fontSize:48, marginBottom:8 }}>💜</div>
        <h2 style={{ fontSize:17, fontWeight:900, color:"#1a1a1a", margin:"0 0 4px" }}>Thanh toán MoMo</h2>
        <p style={{ fontSize:13, fontWeight:700, color:"#ae2070", margin:"0 0 12px" }}>{fmt(total)}</p>

        {momoQR && (
          <div style={{ marginBottom:16 }}>
            <img src={momoQR} alt="MoMo QR" style={{ width:220, height:220, borderRadius:12, border:"2px solid #ae2070" }}/>
            <p style={{ fontSize:11, color:"#666", margin:"8px 0 0", lineHeight:1.5 }}>
              Mở app MoMo → Quét mã QR để thanh toán
            </p>
          </div>
        )}

        <button onClick={() => {
          window.parent.postMessage({ type: "OPEN_OUT_APP", url: momoPayUrl }, "*");
        }} style={{ width:"100%", padding:"13px", background:"#ae2070", color:"white", border:"none", borderRadius:14, fontSize:14, fontWeight:800, cursor:"pointer", marginBottom:10 }}>
          💜 Mở trang MoMo
        </button>
        <button onClick={() => setMomoPayUrl(null)} style={{ width:"100%", padding:"12px", background:"none", color:"#999", border:"1px solid #e0e0e0", borderRadius:14, fontSize:13, cursor:"pointer" }}>
          ← Quay lại
        </button>
        <p style={{ fontSize:11, color:"#aaa", margin:"12px 0 0", lineHeight:1.6 }}>
          Sau khi thanh toán xong, quay lại app để xem đơn hàng
        </p>
      </div>
    </div>
  );

  if(!items.length) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"60vh",color:"#bbb",gap:12,padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:48}}>🛒</div>
      <p style={{fontSize:14,fontWeight:600,margin:0}}>Giỏ hàng trống</p>
      <button onClick={()=>navigate("/menu")} style={{marginTop:8,padding:"10px 28px",
        background:"#D4531C",color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>
        Xem thực đơn
      </button>
    </div>
  );

  return(
    <div style={{background:"#f5f5f5",minHeight:"100vh",paddingBottom:250}}>

      {/* HEADER */}
      <div style={{background:"white",padding:"14px 16px",display:"flex",alignItems:"center",
        gap:12,borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,zIndex:10}}>
        <button onClick={()=>navigate(-1)}
          style={{background:"none",border:"none",fontSize:22,cursor:"pointer",padding:0,color:"#333",lineHeight:1}}>←</button>
        <h1 style={{fontSize:17,fontWeight:900,margin:0,color:"#1a1a1a"}}>Giỏ hàng ({count} món)</h1>
      </div>

      {/* ITEMS */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"10px 16px 4px",fontSize:11,fontWeight:700,color:"#999",letterSpacing:.5}}>MÓN ĐÃ CHỌN</div>
        {items.map((item,idx)=>(
          <div key={item.cartId} style={{display:"flex",alignItems:"center",gap:10,
            padding:"10px 16px",borderTop:idx>0?"1px solid #f8f8f8":"none"}}>
            <div style={{width:48,height:48,borderRadius:10,overflow:"hidden",flexShrink:0,background:"#f0f0f0"}}>
              {item.image
                ?<img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}}
                    onError={e=>e.target.style.display="none"}/>
                :<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#C8401A,#D4531C)",
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src="/logo-cing.png" alt="" style={{width:24,height:24,filter:"brightness(0) invert(1)",opacity:.8}}/>
                </div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:12,fontWeight:700,color:"#1a1a1a",margin:"0 0 2px",
                overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.displayName||item.name}</p>
              {item.note&&<p style={{fontSize:10,color:"#999",margin:"0 0 2px",
                overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.note}</p>}
              <p style={{fontSize:12,fontWeight:900,color:"#D4531C",margin:0}}>{fmt(item.price)}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button onClick={()=>decrement(item.id)}
                style={{width:24,height:24,borderRadius:"50%",border:"1.5px solid #D4531C",
                  background:"white",color:"#D4531C",fontSize:16,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:13,fontWeight:900,minWidth:16,textAlign:"center"}}>{item.qty}</span>
              <button onClick={()=>increment(item.id)}
                style={{width:24,height:24,borderRadius:"50%",background:"#D4531C",
                  border:"none",color:"white",fontSize:16,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          </div>
        ))}
      </div>

      {/* ORDER TYPE */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>HÌNH THỨC</p>
        <div style={{display:"flex",gap:8}}>
          {ORDER_TYPES.map(t=>(
            <button key={t.id} onClick={()=>setOrderType(t.id)} style={{
              flex:1,padding:"10px 4px",borderRadius:12,cursor:"pointer",
              border:orderType===t.id?"2px solid #D4531C":"1.5px solid #e8e8e8",
              background:orderType===t.id?"#fff5f2":"white",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>{t.icon}</span>
              <span style={{fontSize:10,fontWeight:700,color:orderType===t.id?"#D4531C":"#666"}}>{t.label}</span>
            </button>
          ))}
        </div>

        {orderType==="delivery"&&(
          <div style={{marginTop:10,padding:"10px 12px",background:"#f9f9f9",borderRadius:10}}>
            {shipStatus==="loading"&&<p style={{fontSize:12,color:"#999",margin:0}}>Đang lấy vị trí và tính phí ship...</p>}

{shipStatus==="denied"&&(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <p style={{fontSize:11,color:"#f57c00",margin:0}}>{locMsg}</p>
                <button onClick={async ()=>{
                  setShipStatus("loading");
                  try {
                    let coords;
                    try {
                      const zmpSdk = await import("zmp-sdk");
                      const result = await zmpSdk.getLocation();
                      if (result?.latitude && result?.longitude) {
                        coords = { latitude: parseFloat(result.latitude), longitude: parseFloat(result.longitude) };
                      } else if (result?.token) {
                        const r = await apiClient.post("/shipping/decode-location", { token: result.token, amount: subtotal });
                        if (r.data?.success && r.data?.latitude && r.data?.longitude) {
                          coords = { latitude: r.data.latitude, longitude: r.data.longitude };
                        } else throw new Error("NO_LOCATION");
                      } else throw new Error("NO_LOCATION");
                    } catch(e) {
                      coords = await new Promise((resolve, reject) => {
                        if (!navigator.geolocation) { reject(new Error("NO_GEO")); return; }
                        navigator.geolocation.getCurrentPosition(
                          pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                          err => reject(err),
                          { timeout: 10000 }
                        );
                      });
                    }
                    const km = calcDistKm(coords.latitude, coords.longitude, STORE_LAT, STORE_LNG);
                    setDistKm(km);
                    try {
                      const r = await apiClient.get('/shipping/estimate?lat='+coords.latitude+'&lng='+coords.longitude+'&amount='+subtotal);
                      const fee = r.data?.ship_fee ?? calcShipFee(subtotal,km);
                      if(fee===-1){ setShipFee(0);setShipStatus("contact");setLocMsg('Khoảng cách '+km.toFixed(1)+'km > 10km. Nhà hàng sẽ liên hệ báo phí ship.'); }
                      else { setShipFee(fee);setShipStatus("done");setLocMsg('Khoảng cách: '+km.toFixed(1)+' km'); }
                    } catch(e){
                      const fee=calcShipFee(subtotal,km);
                      if(fee===-1){ setShipFee(0);setShipStatus("contact");setLocMsg('Khoảng cách '+km.toFixed(1)+'km > 10km.'); }
                      else { setShipFee(fee);setShipStatus("done");setLocMsg('Khoảng cách: '+km.toFixed(1)+' km'); }
                    }
                  } catch(e){
                    setShipFee(25000);setShipStatus("error");setLocMsg("Không lấy được vị trí. Phí ship mặc định 25.000đ");
                  }
                }} style={{fontSize:11,color:"#D4531C",fontWeight:700,background:"none",border:"1px solid #D4531C",borderRadius:6,padding:"4px 10px",cursor:"pointer",alignSelf:"flex-start"}}>
                  📍 Cho phép vị trí
                </button>
              </div>
            )}
            {shipStatus==="error"&&<p style={{fontSize:11,color:"#e57373",margin:0}}>{locMsg}</p>}
            {shipStatus==="contact"&&<p style={{fontSize:11,color:"#f57c00",margin:0}}>{locMsg}</p>}
            {shipStatus==="done"&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:11,color:"#555",margin:0,fontWeight:600}}>{locMsg}</p>
                  <p style={{fontSize:12,color:shipFee===0?"#2e7d32":"#D4531C",fontWeight:700,margin:"3px 0 0"}}>
                    {shipFee===0?"Miễn phí vận chuyển!":"Phí ship: "+fmt(shipFee)}
                  </p>
                </div>
                {shipFee===0&&<span style={{fontSize:10,background:"#e8f5e9",color:"#2e7d32",
                  padding:"3px 8px",borderRadius:8,fontWeight:700}}>FREE</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* THONG TIN */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 12px",letterSpacing:.5}}>THÔNG TIN NHẬN HÀNG</p>
        <Field label="Họ và tên *" value={name} onChange={setName} placeholder="Nguyễn Văn A"/>
        <Field label="Số điện thoại" value={phone} onChange={setPhone} placeholder="0901234567" type="tel"/>
        {orderType==="delivery"&&
          <Field label="Địa chỉ giao hàng *" value={address} onChange={setAddress} placeholder="Số nhà, đường, phường/xã..."/>}
      </div>

      {/* THANH TOÁN */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>THANH TOÁN</p>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"6px 0"}}>
          <span style={{fontSize:24}}>💜</span>
          <div style={{flex:1}}>
            <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:0}}>MoMo</p>
            <p style={{fontSize:11,color:"#999",margin:0}}>Ví điện tử MoMo</p>
          </div>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#D4531C",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>
          </div>
        </div>
      </div>

      {/* GHI CHÚ */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 8px",letterSpacing:.5}}>GHI CHÚ</p>
        <textarea placeholder="Ví dụ: ít đá, nhiều topping..." value={note}
          onChange={e=>setNote(e.target.value)} rows={2}
          style={{width:"100%",border:"1.5px solid #f0f0f0",borderRadius:10,
            padding:"8px 10px",fontSize:12,color:"#333",resize:"none",
            outline:"none",boxSizing:"border-box"}}/>
      </div>

      {/* FOOTER FIXED */}
      <div style={{position:"fixed",bottom:56,left:0,right:0,
        background:"white",borderTop:"1px solid #f0f0f0",
        padding:"10px 16px 12px",zIndex:40}}>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
            <span style={{fontSize:12,color:"#666"}}>Tạm tính</span>
            <span style={{fontSize:12,fontWeight:600,color:"#1a1a1a"}}>{fmt(subtotal)}</span>
          </div>
          {tierDiscount > 0 && (
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:"#2e7d32"}}>Ưu đãi {membership?.tierName || tierKey} ({Math.round(tierDiscountRate*100)}%)</span>
              <span style={{fontSize:12,fontWeight:600,color:"#2e7d32"}}>-{fmt(tierDiscount)}</span>
            </div>
          )}
          {orderType==="delivery"&&(
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:"#666"}}>Phí ship</span>
              <span style={{fontSize:12,fontWeight:700,
                color:shipStatus==="loading"?"#999":shipFee===0?"#2e7d32":"#1a1a1a"}}>
                {shipStatus==="loading"?"Đang tính...":shipFee===0?"Miễn phí":fmt(shipFee)}
              </span>
            </div>
          )}
          <div style={{height:1,background:"#f0f0f0",margin:"6px 0"}}/>
          {/* ĐIỂM TÍCH LŨY — Đổi voucher để giảm giá */}
          {availablePoints > 0 && (
            <div style={{marginBottom:8,padding:"10px 12px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:20}}>🎟</span>
              <div style={{flex:1}}>
                <p style={{fontSize:12,fontWeight:700,color:"#059669",margin:"0 0 2px"}}>Bạn có {availablePoints} điểm tích lũy</p>
                <p style={{fontSize:11,color:"#666",margin:0}}>Đổi điểm lấy voucher giảm giá tại mục <strong>Điểm tích lũy</strong></p>
              </div>
            </div>
          )}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>Tổng cộng</span>
            <span style={{fontSize:17,fontWeight:900,color:"#D4531C"}}>{fmt(total)}</span>
          </div>
        </div>
        {error&&<p style={{fontSize:12,color:"#e53935",margin:"0 0 8px",textAlign:"center"}}>{error}</p>}
        <button onClick={handleOrder} disabled={loading||shipStatus==="loading"}
          style={{width:"100%",padding:"13px",borderRadius:13,
            background:(loading||shipStatus==="loading")?"#ddd":"#D4531C",
            color:"white",border:"none",fontSize:14,fontWeight:900,
            cursor:(loading||shipStatus==="loading")?"not-allowed":"pointer"}}>
          {loading?"Đang xử lý...":"Thanh toán MoMo — "+fmt(total)}
        </button>
      </div>
    </div>
  );
}
