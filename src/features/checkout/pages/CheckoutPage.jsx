import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";
import useAuthStore from "@/stores/auth/authStore";
import apiClient from "@/infra/api/apiClient";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "d";
const STORE_LAT = 21.1861, STORE_LNG = 106.0763;

function calcDistKm(a,b,c,d){const R=6371,dL=(c-a)*Math.PI/180,dl=(d-b)*Math.PI/180,x=Math.sin(dL/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

function calcShipFee(sub, km) {
  if (km >= 10) return -1;
  if (km < 2)   return 0;
  if (km < 3)   return sub>=200000?0:sub>=100000?10000:15000;
  if (km < 5)   return sub>=200000?0:sub>=100000?15000:25000;
  if (km < 8)   return sub>=500000?0:sub>=200000?20000:sub>=100000?30000:35000;
  return sub>=500000?0:sub>=200000?25000:sub>=100000?35000:50000;
}

const ORDER_TYPES=[{id:"dine_in",label:"An tai quan",icon:"🪑"},{id:"takeaway",label:"Mang ve",icon:"🛍"},{id:"delivery",label:"Giao hang",icon:"🛵"}];

export default function CheckoutPage() {
  const navigate=useNavigate();
  const items=useCartStore(s=>s.items);
  const increment=useCartStore(s=>s.increment);
  const decrement=useCartStore(s=>s.decrement);
  const clearCart=useCartStore(s=>s.clearCart);
  const profile=useAuthStore(s=>s.profile);

  const subtotal=items.reduce((s,i)=>s+(i.price||0)*i.qty,0);
  const count=items.reduce((s,i)=>s+i.qty,0);

  const [orderType,setOrderType]=useState("dine_in");
  const [name,setName]=useState(profile?.name||"");
  const [phone,setPhone]=useState(profile?.phone||"");
  const [address,setAddress]=useState("");
  const [note,setNote]=useState("");
  const [shipFee,setShipFee]=useState(0);
  const [shipLoading,setShipLoading]=useState(false);
  const [distKm,setDistKm]=useState(null);
  const [locErr,setLocErr]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    if(orderType!=="delivery"){setShipFee(0);setDistKm(null);setLocErr("");return;}
    setShipLoading(true);setLocErr("");
    navigator.geolocation?.getCurrentPosition(
      pos=>{
        const km=calcDistKm(pos.coords.latitude,pos.coords.longitude,STORE_LAT,STORE_LNG);
        setDistKm(km);
        const fee=calcShipFee(subtotal,km);
        if(fee===-1){setLocErr("Khoang cach > 10km. Nha hang lien he bao phi sau.");setShipFee(0);}
        else setShipFee(fee);
        setShipLoading(false);
      },
      ()=>{setLocErr("Khong lay duoc vi tri. Phi ship mac dinh 25.000d");setShipFee(25000);setShipLoading(false);},
      {timeout:8000}
    );
  },[orderType]);

  const total=subtotal+shipFee;

  async function handleOrder(){
    if(!name.trim()){setError("Vui long nhap ten");return;}
    if(orderType==="delivery"&&!address.trim()){setError("Vui long nhap dia chi");return;}
    setLoading(true);setError("");
    try{
      await apiClient.post("/orders",{
        customer_id:profile?.id||null,customer_name:name.trim(),
        customer_phone:phone.trim(),delivery_address:address.trim(),
        order_type:orderType,payment_method:"momo",note:note.trim(),
        items:items.map(i=>({item_id:i.id,item_code:i.code,name:i.displayName||i.name,price:i.price,quantity:i.qty,note:i.note||""})),
        subtotal,shipping_fee:shipFee,total_amount:total,distance_km:distKm,
      });
      clearCart();navigate("/order-success");
    }catch{setError("Dat hang that bai. Vui long thu lai.");}
    finally{setLoading(false);}
  }

  if(!items.length) return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"60vh",color:"#bbb",gap:12,padding:"0 24px",textAlign:"center"}}>
      <div style={{fontSize:48}}>🛒</div>
      <p style={{fontSize:14,fontWeight:600,margin:0}}>Gio hang trong</p>
      <button onClick={()=>navigate("/menu")} style={{marginTop:8,padding:"10px 28px",background:"#D4531C",color:"white",border:"none",borderRadius:12,fontSize:13,fontWeight:700,cursor:"pointer"}}>Xem thuc don</button>
    </div>
  );

  return(
    <div style={{background:"#f5f5f5",minHeight:"100vh",paddingBottom:200}}>
      <div style={{background:"white",padding:"14px 16px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid #f0f0f0",position:"sticky",top:0,zIndex:10}}>
        <button onClick={()=>navigate(-1)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",padding:0,color:"#333"}}>←</button>
        <h1 style={{fontSize:17,fontWeight:900,margin:0}}>Gio hang ({count} mon)</h1>
      </div>

      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,overflow:"hidden"}}>
        <div style={{padding:"10px 16px 4px",fontSize:11,fontWeight:700,color:"#999",letterSpacing:.5}}>MON DA CHON</div>
        {items.map((item,idx)=>(
          <div key={item.cartId} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderTop:idx>0?"1px solid #f8f8f8":"none"}}>
            <div style={{width:48,height:48,borderRadius:10,overflow:"hidden",flexShrink:0,background:"#f0f0f0"}}>
              {item.image?<img src={item.image} alt={item.name} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>
                :<div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#C8401A,#D4531C)",display:"flex",alignItems:"center",justifyContent:"center"}}><img src="/logo-cing.png" alt="" style={{width:26,height:26,filter:"brightness(0) invert(1)",opacity:.8}}/></div>}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:12,fontWeight:700,color:"#1a1a1a",margin:"0 0 2px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.displayName||item.name}</p>
              {item.note&&<p style={{fontSize:10,color:"#999",margin:"0 0 2px",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{item.note}</p>}
              <p style={{fontSize:12,fontWeight:900,color:"#D4531C",margin:0}}>{fmt(item.price)}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
              <button onClick={()=>decrement(item.id)} style={{width:24,height:24,borderRadius:"50%",border:"1.5px solid #D4531C",background:"white",color:"#D4531C",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:13,fontWeight:900,minWidth:14,textAlign:"center"}}>{item.qty}</span>
              <button onClick={()=>increment(item.id)} style={{width:24,height:24,borderRadius:"50%",background:"#D4531C",border:"none",color:"white",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>HINH THUC</p>
        <div style={{display:"flex",gap:8}}>
          {ORDER_TYPES.map(t=>(
            <button key={t.id} onClick={()=>setOrderType(t.id)} style={{flex:1,padding:"10px 4px",borderRadius:12,cursor:"pointer",border:orderType===t.id?"2px solid #D4531C":"1.5px solid #e8e8e8",background:orderType===t.id?"#fff5f2":"white",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <span style={{fontSize:20}}>{t.icon}</span>
              <span style={{fontSize:10,fontWeight:700,color:orderType===t.id?"#D4531C":"#666"}}>{t.label}</span>
            </button>
          ))}
        </div>
        {orderType==="delivery"&&(
          <div style={{marginTop:10,padding:"10px 12px",background:"#f9f9f9",borderRadius:10}}>
            {shipLoading?<p style={{fontSize:12,color:"#999",margin:0}}>Dang tinh phi ship...</p>
            :locErr?<p style={{fontSize:11,color:"#e57373",margin:0}}>{locErr}</p>
            :distKm!=null?(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <p style={{fontSize:11,color:"#666",margin:0}}>Khoang cach: <b>{distKm.toFixed(1)} km</b></p>
                  <p style={{fontSize:11,margin:"3px 0 0",fontWeight:600,color:shipFee===0?"#2e7d32":"#D4531C"}}>{shipFee===0?"Mien phi van chuyen!":"Phi ship: "+fmt(shipFee)}</p>
                </div>
                {shipFee===0&&<span style={{fontSize:10,background:"#e8f5e9",color:"#2e7d32",padding:"3px 8px",borderRadius:8,fontWeight:700}}>FREE</span>}
              </div>
            ):null}
          </div>
        )}
      </div>

      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 12px",letterSpacing:.5}}>THONG TIN NHAN HANG</p>
        <Field label="Ho va ten *" value={name} onChange={setName} placeholder="Nguyen Van A"/>
        <Field label="So dien thoai" value={phone} onChange={setPhone} placeholder="0901234567" type="tel"/>
        {orderType==="delivery"&&<Field label="Dia chi giao hang *" value={address} onChange={setAddress} placeholder="So nha, duong, phuong/xa..."/>}
      </div>

      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>THANH TOAN</p>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0"}}>
          <span style={{fontSize:24}}>💜</span>
          <div style={{flex:1}}><p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:0}}>MoMo</p><p style={{fontSize:11,color:"#999",margin:0}}>Vi dien tu MoMo</p></div>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#D4531C",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/></div>
        </div>
      </div>

      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 8px",letterSpacing:.5}}>GHI CHU</p>
        <textarea placeholder="Vi du: it da, nhieu toan..." value={note} onChange={e=>setNote(e.target.value)} rows={2}
          style={{width:"100%",border:"1.5px solid #f0f0f0",borderRadius:10,padding:"8px 10px",fontSize:12,color:"#333",resize:"none",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
      </div>

      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f0f0f0",padding:"10px 16px 32px"}}>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#666"}}>Tam tinh</span><span style={{fontSize:12,fontWeight:600}}>{fmt(subtotal)}</span></div>
          {orderType==="delivery"&&<div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#666"}}>Phi ship</span><span style={{fontSize:12,fontWeight:600,color:shipFee===0?"#2e7d32":"#1a1a1a"}}>{shipLoading?"Dang tinh...":shipFee===0?"Mien phi":fmt(shipFee)}</span></div>}
          <div style={{height:1,background:"#f0f0f0",margin:"6px 0"}}/>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:700}}>Tong cong</span><span style={{fontSize:16,fontWeight:900,color:"#D4531C"}}>{fmt(total)}</span></div>
        </div>
        {error&&<p style={{fontSize:12,color:"#e53935",margin:"0 0 6px",textAlign:"center"}}>{error}</p>}
        <button onClick={handleOrder} disabled={loading||shipLoading}
          style={{width:"100%",padding:"14px",borderRadius:14,background:(loading||shipLoading)?"#ddd":"#D4531C",color:"white",border:"none",fontSize:15,fontWeight:900,cursor:(loading||shipLoading)?"not-allowed":"pointer"}}>
          {loading?"Dang dat hang...":"Dat hang — "+fmt(total)}
        </button>
      </div>
    </div>
  );
}

function Field({label,value,onChange,placeholder,type="text"}){
  return(
    <div style={{marginBottom:10}}>
      <p style={{fontSize:11,fontWeight:600,color:"#666",margin:"0 0 5px"}}>{label}</p>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",border:"1.5px solid #f0f0f0",borderRadius:10,padding:"9px 12px",fontSize:13,color:"#333",outline:"none",boxSizing:"border-box",fontFamily:"inherit",background:"#fafafa"}}
        onFocus={e=>e.target.style.borderColor="#D4531C"}
        onBlur={e=>e.target.style.borderColor="#f0f0f0"}/>
    </div>
  );
}
