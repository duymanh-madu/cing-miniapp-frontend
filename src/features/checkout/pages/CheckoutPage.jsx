import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";
import useAuthStore from "@/stores/auth/authStore";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "d";

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
  {id:"dine_in",label:"An tai quan",icon:"🪑"},
  {id:"takeaway",label:"Mang ve",icon:"🛍"},
  {id:"delivery",label:"Giao hang",icon:"🛵"},
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
  const [phone,setPhone]=useState(profile?.phone||"");
  const [address,setAddress]=useState("");
  const [note,setNote]=useState("");
  const [shipFee,setShipFee]=useState(0);
  const [shipStatus,setShipStatus]=useState("idle"); // idle|loading|done|error|contact
  const [distKm,setDistKm]=useState(null);
  const [locMsg,setLocMsg]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(orderType!=="delivery"){
      setShipFee(0);setDistKm(null);setShipStatus("idle");setLocMsg("");
      return;
    }
    setShipStatus("loading");setLocMsg("");
    if(!navigator.geolocation){
      setShipFee(25000);setShipStatus("error");
      setLocMsg("Trinh duyet khong ho tro GPS. Phi ship mac dinh 25.000d");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const km=calcDistKm(pos.coords.latitude,pos.coords.longitude,STORE_LAT,STORE_LNG);
        setDistKm(km);
        const fee=calcShipFee(subtotal,km);
        if(fee===-1){
          setShipFee(0);setShipStatus("contact");
          setLocMsg(`Khoang cach ${km.toFixed(1)}km > 10km. Nha hang se lien he bao phi ship.`);
        } else {
          setShipFee(fee);setShipStatus("done");
          setLocMsg(`Khoang cach: ${km.toFixed(1)} km`);
        }
      },
      err=>{
        setShipFee(25000);setShipStatus("error");
        setLocMsg("Khong lay duoc vi tri. Ap dung phi ship mac dinh 25.000d");
      },
      {timeout:10000,enableHighAccuracy:false}
    );
  },[orderType]);

  const total=subtotal+shipFee;

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
      };
      const orderRes = await apiClient.post("/orders/create", orderPayload);
      const orderId = orderRes.data?.data?.id || orderRes.data?.order?.id;

      // 2. Tao MoMo payment session
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
        cart_snapshot: items,
        shipping_address: address.trim(),
        order_id: orderId,
      });

      const payUrl = paymentRes.data?.paymentUrl;

      if(payUrl){
        // 3. Redirect den MoMo
        clearCart();
        window.location.href = payUrl;
      } else {
        throw new Error("Không lấy được link thanh toán MoMo");
      }
    }catch(e){
      const msg=e?.response?.data?.error||e?.response?.data?.message||"Đặt hàng thất bại. Vui lòng thử lại.";
      setError(msg);
    }finally{
      setLoading(false);
    }
  }

  if(!items.length) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
      minHeight:"60vh",color:"#bbb",gap:12,padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:48}}>🛒</div>
      <p style={{fontSize:14,fontWeight:600,margin:0}}>Gio hang trong</p>
      <button onClick={()=>navigate("/menu")} style={{marginTop:8,padding:"10px 28px",
        background:"#D4531C",color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>
        Xem thuc don
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
        <h1 style={{fontSize:17,fontWeight:900,margin:0,color:"#1a1a1a"}}>Gio hang ({count} mon)</h1>
      </div>

      {/* ITEMS */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"10px 16px 4px",fontSize:11,fontWeight:700,color:"#999",letterSpacing:.5}}>MON DA CHON</div>
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
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>HINH THUC</p>
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
            {shipStatus==="loading"&&<p style={{fontSize:12,color:"#999",margin:0}}>Dang lay vi tri va tinh phi ship...</p>}
            {shipStatus==="error"&&<p style={{fontSize:11,color:"#e57373",margin:0}}>{locMsg}</p>}
            {shipStatus==="contact"&&<p style={{fontSize:11,color:"#f57c00",margin:0}}>{locMsg}</p>}
            {shipStatus==="done"&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:11,color:"#555",margin:0,fontWeight:600}}>{locMsg}</p>
                  <p style={{fontSize:12,color:shipFee===0?"#2e7d32":"#D4531C",fontWeight:700,margin:"3px 0 0"}}>
                    {shipFee===0?"Mien phi van chuyen!":"Phi ship: "+fmt(shipFee)}
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
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 12px",letterSpacing:.5}}>THONG TIN NHAN HANG</p>
        <Field label="Ho va ten *" value={name} onChange={setName} placeholder="Nguyen Van A"/>
        <Field label="So dien thoai" value={phone} onChange={setPhone} placeholder="0901234567" type="tel"/>
        {orderType==="delivery"&&
          <Field label="Dia chi giao hang *" value={address} onChange={setAddress} placeholder="So nha, duong, phuong/xa..."/>}
      </div>

      {/* THANH TOAN */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>THANH TOAN</p>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"6px 0"}}>
          <span style={{fontSize:24}}>💜</span>
          <div style={{flex:1}}>
            <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:0}}>MoMo</p>
            <p style={{fontSize:11,color:"#999",margin:0}}>Vi dien tu MoMo</p>
          </div>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#D4531C",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>
          </div>
        </div>
      </div>

      {/* GHI CHU */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 8px",letterSpacing:.5}}>GHI CHU</p>
        <textarea placeholder="Vi du: it da, nhieu toan..." value={note}
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
            <span style={{fontSize:12,color:"#666"}}>Tam tinh</span>
            <span style={{fontSize:12,fontWeight:600,color:"#1a1a1a"}}>{fmt(subtotal)}</span>
          </div>
          {orderType==="delivery"&&(
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
              <span style={{fontSize:12,color:"#666"}}>Phi ship</span>
              <span style={{fontSize:12,fontWeight:700,
                color:shipStatus==="loading"?"#999":shipFee===0?"#2e7d32":"#1a1a1a"}}>
                {shipStatus==="loading"?"Dang tinh...":shipFee===0?"Mien phi":fmt(shipFee)}
              </span>
            </div>
          )}
          <div style={{height:1,background:"#f0f0f0",margin:"6px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:13,fontWeight:700,color:"#1a1a1a"}}>Tong cong</span>
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
