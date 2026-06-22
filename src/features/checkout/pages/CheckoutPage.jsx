import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";
import { useMembership } from "@/features/home/hooks/useMembership";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import { CheckoutSDK } from "zmp-sdk/apis";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";

function requestZaloCheckoutFromShell(order) {
  if (window.parent && window.parent !== window) {
    return new Promise((resolve, reject) => {
      const requestId = `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const timer = setTimeout(() => {
        window.removeEventListener("message", onMessage);
        reject(new Error("Zalo Checkout timeout"));
      }, 90000);

      function onMessage(event) {
        const data = event.data || {};
        if (data.type !== "ZALO_CHECKOUT_RESULT" || data.requestId !== requestId) return;

        clearTimeout(timer);
        window.removeEventListener("message", onMessage);

        if (data.ok) {
          resolve(data.data);
        } else {
          reject(data.error || new Error("Zalo Checkout failed"));
        }
      }

      window.addEventListener("message", onMessage);

      window.parent.postMessage({
        type: "ZALO_CHECKOUT_CREATE_ORDER",
        requestId,
        order,
      }, "*");
    });
  }

  return CheckoutSDK.createOrder(order);
}


const STORE_LAT = 21.112148;
const STORE_LNG = 105.948725;

function calcDistKm(lat1,lng1,lat2,lng2){
  const R=6371,dL=(lat2-lat1)*Math.PI/180,dl=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function calcShipFee(sub, km, tiers) {
  if (km >= 10) return -1; // ngoài vùng → liên hệ
  if (km < 2)   return 0;  // gần → miễn phí

  // Dùng shipping_tiers từ config — match theo cả km VÀ giá trị đơn
  if (tiers && tiers.length > 0) {
    const tier = tiers.find(t =>
      km  >= (t.min_km    ?? 0)         &&
      km  <  (t.max_km    ?? 10)        &&
      sub >= (t.min_order ?? 0)         &&
      sub <= (t.max_order ?? 999999999)
    );
    if (tier) {
      const fee = (tier.base_fee||0) + (tier.fee_per_km||0) * km;
      return Math.round(fee / 1000) * 1000;
    }
  }

  // Fallback hardcode nếu chưa có config
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
  const [shippingTiers, setShippingTiers] = useState(null);

  useEffect(() => {
    apiClient.get("/app-config/public")
      .then(r => {
        const tiers = r.data?.data?.shipping_tiers;
        if (tiers?.length) setShippingTiers(tiers);
      }).catch(() => {});
  }, []);
  const [shipFee,setShipFee]=useState(0);
  const [shipStatus,setShipStatus]=useState("idle"); // idle|loading|done|error|contact
  const [distKm,setDistKm]=useState(null);
  const [locMsg,setLocMsg]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const pendingCheckoutKey = "cing_pending_checkout_transaction";

  // Resume sau khi Zalo/MoMo trả app về checkout mà socket listener bị mất context.
  useEffect(() => {
    const transactionCode = sessionStorage.getItem(pendingCheckoutKey);
    if (!transactionCode) return;

    let cancelled = false;

    const resumePaidCheckout = async () => {
      try {
        const res = await apiClient.get(`/orders/by-transaction/${encodeURIComponent(transactionCode)}`);
        const order = res.data?.data || res.data?.order || res.data;

        if (cancelled || !order) return;

        const status = String(order.payment_status || order.status || order.order_status || "").toLowerCase();
        const hasOrderCode = !!(order.order_code || order.code || order.id);

        if (
          hasOrderCode &&
          (
            status.includes("paid") ||
            status.includes("success") ||
            status.includes("completed") ||
            status.includes("confirmed") ||
            status === ""
          )
        ) {
          sessionStorage.removeItem(pendingCheckoutKey);
          clearCart();
          navigate("/order-success", { replace: true });
        }
      } catch (err) {
        console.warn("[CHECKOUT_RESUME] pending transaction not ready yet", {
          transactionCode,
          message: err?.message,
        });
      }
    };

    resumePaidCheckout();
    const timer = setInterval(resumePaidCheckout, 1500);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Lắng nghe payment.success từ socket — realtime, không poll
  useEffect(() => {
    let attempts = 0;
    const attach = () => {
      const socket = getRuntimeSocket();
      if (socket?.connected) {
        socket.on("payment.success", () => {
          sessionStorage.removeItem(pendingCheckoutKey);
          clearCart();
          navigate("/order-success");
        });
        return;
      }
      if (attempts++ < 20) setTimeout(attach, 1000);
    };
    attach();
    return () => { getRuntimeSocket()?.off("payment.success"); };
  }, []);
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

    // Bridge location qua shell (giống phone permission)
    const getLocation = () => new Promise((resolve, reject) => {
      const requestId = `loc_${Date.now()}`;
      const timer = setTimeout(() => {
        window.removeEventListener("message", handler);
        // Fallback navigator.geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => reject(new Error("Không lấy được vị trí. Vui lòng cho phép truy cập định vị.")),
            { timeout: 10000, enableHighAccuracy: false }
          );
        } else {
          reject(new Error("Thiết bị không hỗ trợ định vị."));
        }
      }, 10000);

      function handler(e) {
        const data = e.data;
        if (!data || data.type !== "ZALO_LOCATION_RESULT") return;
        if (data.requestId && data.requestId !== requestId) return;
        clearTimeout(timer);
        window.removeEventListener("message", handler);
        if (!data.success) { reject(new Error(data.error || "Không lấy được vị trí.")); return; }
        if (data.latitude && data.longitude) {
          resolve({ latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) });
          return;
        }
        // Có token → decode qua backend
        if (data.token) {
          import("@/infra/api/apiClient").then(({ default: apiClient }) => {
            apiClient.post("/shipping/decode-location", { token: data.token, amount: subtotal })
              .then(r => {
                if (r.data?.success && r.data?.latitude && r.data?.longitude) {
                  resolve({ latitude: r.data.latitude, longitude: r.data.longitude });
                } else {
                  reject(new Error("Không decode được vị trí."));
                }
              })
              .catch(() => reject(new Error("Không decode được vị trí.")));
          });
          return;
        }
        reject(new Error("Không lấy được vị trí."));
      }

      window.addEventListener("message", handler);
      window.parent.postMessage({ type: "REQUEST_ZALO_LOCATION", requestId }, "*");
    });

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
            const fee=calcShipFee(subtotal, km, shippingTiers);
            if(fee===-1){
              setShipFee(0);setShipStatus("contact");
              setLocMsg(`Khoảng cách ${km.toFixed(1)}km > 10km. Nhà hàng sẽ liên hệ báo phí ship.`);
            } else {
              setShipFee(fee);setShipStatus("done");
              setLocMsg(`Khoảng cách: ${km.toFixed(1)} km`);
            }
          }
        } catch(e){
          const fee=calcShipFee(subtotal, km, shippingTiers);
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
          setShipFee(0);setShipStatus("contact");
          setLocMsg("Cửa hàng sẽ liên hệ lại để tính phí ship cụ thể.");
        }
      });
  },[orderType]);

  const total=Math.max(0, subtotal+shipFee-pointsDiscount-tierDiscount);

  async function handleOrder(){
    if(!name.trim()){setError("Vui lòng nhập họ tên");return;}
    if(orderType==="delivery"&&!address.trim()){setError("Vui lòng nhập địa chỉ giao hàng");return;}
    if(total > 0 && total < 1000){
      setError("Số tiền thanh toán tối thiểu 1.000đ. Vui lòng dùng thêm điểm để thanh toán hoàn toàn bằng điểm, hoặc giảm số điểm sử dụng.");
      return;
    }
    setLoading(true);setError("");
    try{
      const userId=profile?.id||profile?.userId||profile?.zalo_id||"guest-"+Date.now();
      const profilePhone = String(profile?.phone || profile?.phoneNumber || "").replace(/\D/g, "").replace(/^84/, "0");
      const submittedPhone = String(phone || "").replace(/\D/g, "").replace(/^84/, "0");
      const customerPhone = profilePhone || submittedPhone;

      // 1. Tao don hang
      const orderPayload={
        user_id:userId,
        customer_name:name.trim(),
        shipping_address:address.trim(),
        note: note || "",
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

      // 2. Tạo Zalo Checkout payment session
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
            order_type: orderType,
            orderType,
            note: note || "",
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
          },
        });
        clearCart();
        navigate("/order-success");
        return;
      }

      const paymentRes = await apiClient.post("/payments/create-session", {
        user_id: userId,
        customer_name: name.trim(),
        customer_phone: customerPhone,
        payment_provider: "zalo_checkout",
        payment_method: "zalo_checkout",
        total_amount: total,
        subtotal,
        shipping_fee: shipFee,
        shipping_distance: distKm?Math.round(distKm*10)/10:0,
        cart_snapshot: {
          items,
          customer_name: name.trim(),
          customer_phone: customerPhone,
          shipping_address: address.trim(),
          order_type: orderType,
          orderType,
          shipping_fee: shipFee,
          points_used: pointsToUse,
          note: note || "",
          tier_discount: tierDiscount,
          points_discount: pointsDiscount,
          subtotal,
        },
        shipping_address: address.trim(),
        order_type: orderType,
        orderType,
        order_id: orderId,
      });

      const zaloOrder = paymentRes.data?.zaloOrder;
      if (!zaloOrder) throw new Error("Không lấy được dữ liệu Zalo Checkout");

      const pendingTransactionCode =
        paymentRes.data?.transaction_code ||
        paymentRes.data?.transactionCode ||
        paymentRes.data?.data?.transaction_code ||
        paymentRes.data?.data?.transactionCode ||
        zaloOrder?.transaction_code ||
        zaloOrder?.transactionCode;

      if (pendingTransactionCode) {
        sessionStorage.setItem(pendingCheckoutKey, pendingTransactionCode);
      }

      try {
        await requestZaloCheckoutFromShell({
          amount: zaloOrder.amount,
          item: zaloOrder.item,
          desc: zaloOrder.desc,
          mac: zaloOrder.mac,
          extradata: zaloOrder.extradata,
          method: zaloOrder.method,
        });
      } catch (sdkErr) {
        console.error("[ZALO_CREATE_ORDER_CATCH]", sdkErr);
        throw sdkErr;
      }

      return;
    }catch(e){
      console.error("ZALO_CHECKOUT_ERROR", e);

      try {
      } catch {}

      const msg=e?.response?.data?.error||e?.response?.data?.message||e?.message||"Đặt hàng thất bại. Vui lòng thử lại.";
      setError(msg);
    }finally{
      setLoading(false);
    }
  }

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
    <div style={{background:"#f5f5f5",minHeight:"100vh",paddingBottom:340}}>

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
                      const fee = r.data?.ship_fee ?? calcShipFee(subtotal, km, shippingTiers);
                      if(fee===-1){ setShipFee(0);setShipStatus("contact");setLocMsg('Khoảng cách '+km.toFixed(1)+'km > 10km. Nhà hàng sẽ liên hệ báo phí ship.'); }
                      else { setShipFee(fee);setShipStatus("done");setLocMsg('Khoảng cách: '+km.toFixed(1)+' km'); }
                    } catch(e){
                      const fee=calcShipFee(subtotal, km, shippingTiers);
                      if(fee===-1){ setShipFee(0);setShipStatus("contact");setLocMsg('Khoảng cách '+km.toFixed(1)+'km > 10km.'); }
                      else { setShipFee(fee);setShipStatus("done");setLocMsg('Khoảng cách: '+km.toFixed(1)+' km'); }
                    }
                  } catch(e){
                    setShipFee(0);setShipStatus("contact");setLocMsg("Cửa hàng sẽ liên hệ lại để tính phí ship cụ thể.");
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
          {/* ĐIỂM TÍCH LŨY — Dùng trực tiếp vào đơn */}
          {availablePoints > 0 && (
            <div style={{marginBottom:8,padding:"12px",background:"#f0fdf4",borderRadius:10,border:"1px solid #bbf7d0"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span style={{fontSize:18}}>🎟</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:12,fontWeight:700,color:"#059669",margin:0}}>
                    Dùng điểm tích lũy — Bạn có <strong>{availablePoints}</strong> điểm (= {fmt(availablePoints*1000)})
                  </p>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input
                  type="number"
                  min={0}
                  max={Math.min(availablePoints, Math.ceil((subtotal+shipFee-tierDiscount)/1000))}
                  value={pointsToUse}
                  onChange={e => {
                    const max = Math.min(availablePoints, Math.ceil((subtotal+shipFee-tierDiscount)/1000));
                    const val = Math.max(0, Math.min(Number(e.target.value)||0, max));
                    setPointsToUse(val);
                  }}
                  placeholder="Nhập số điểm muốn dùng"
                  style={{flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid #bbf7d0",
                    fontSize:13,outline:"none",background:"white"}}
                />
                <button onClick={() => {
                  const max = Math.min(availablePoints, Math.ceil((subtotal+shipFee-tierDiscount)/1000));
                  setPointsToUse(max);
                }} style={{padding:"8px 12px",borderRadius:8,border:"none",
                  background:"#059669",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  Dùng tối đa
                </button>
                {pointsToUse > 0 && (
                  <button onClick={() => setPointsToUse(0)}
                    style={{padding:"8px 10px",borderRadius:8,border:"1px solid #ccc",
                      background:"white",color:"#666",fontSize:12,cursor:"pointer"}}>
                    Bỏ
                  </button>
                )}
              </div>
              {pointsToUse > 0 && (
                <p style={{fontSize:11,color:"#059669",margin:"6px 0 0",fontWeight:600}}>
                  Giảm {fmt(pointsDiscount)} — Còn thanh toán: {fmt(total)}
                  {total === 0 ? " 🎉 Thanh toán hoàn toàn bằng điểm!" : " qua Zalo Checkout"}
                </p>
              )}
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
          {loading?"Đang xử lý...":total===0?"✅ Thanh toán bằng điểm — Miễn phí":"Thanh toán qua Zalo Checkout — "+fmt(total)}
        </button>
      </div>
    </div>
  );
}
