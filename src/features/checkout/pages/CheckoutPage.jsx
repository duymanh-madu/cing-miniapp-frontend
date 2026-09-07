import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "@/features/menu/store/cartStore";
import { useMembership } from "@/features/home/hooks/useMembership";
import useAuthStore from "@/stores/auth/authStore";
import { useRuntimeCustomerIdentityStore } from "@/runtime/customer/runtimeCustomerIdentityStore";
import apiClient from "@/infra/api/apiClient";
import { getRuntimeSocket } from "@/runtime/socket/runtimeSocketClient";
import {
  requestZaloCheckoutFromShell,
} from "@/infra/payment/zaloCheckoutBridge";

const fmt = p => new Intl.NumberFormat("vi-VN").format(p||0) + "đ";


const ORDER_TYPES=[
  {id:"dine_in",label:"Ăn tại quán",icon:"🪑"},
  {id:"takeaway",label:"Mang về",icon:"🛍"},
  {id:"delivery",label:"Giao hàng",icon:"🛵"},
];

function Field({label,value,onChange,onBlur,placeholder,type="text"}){
  const [focus,setFocus]=useState(false);
  return(
    <div style={{marginBottom:12}}>
      <p style={{fontSize:11,fontWeight:600,color:"#666",margin:"0 0 5px"}}>{label}</p>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        style={{width:"100%",border:`1.5px solid ${focus?"#D4531C":"#f0f0f0"}`,
          borderRadius:10,padding:"10px 12px",fontSize:13,color:"#333",
          outline:"none",boxSizing:"border-box",background:"#fafafa"}}
        onFocus={()=>setFocus(true)}
        onBlur={()=>{
          setFocus(false);
          onBlur?.(value);
        }}/>
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
  /*
   * deliveryCoords = current physical GPS position.
   *
   * deliveryCandidateToken = backend-signed authority for the
   * typed destination the customer actually wants delivery to.
   *
   * These two concepts must remain separate.
   */
  const [deliveryCoords,setDeliveryCoords]=useState(null);
  const [deliveryCandidateToken,setDeliveryCandidateToken]=useState("");
  const deliveryAddressRevisionRef=useRef(0);
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
      /*
       * Invalidate any async typed-address response that was
       * started before fulfillment changed.
       */
      deliveryAddressRevisionRef.current += 1;

      setShipFee(0);
      setDistKm(null);
      setDeliveryCoords(null);
      setDeliveryCandidateToken("");
      setShipStatus("idle");
      setLocMsg("");

      return;
    }

    refreshShippingLocation();
  },[orderType,subtotal]);


  const decodeLocationToken = async (
    token,
    miniAccessToken = ""
  ) => {
    const r =
      await apiClient.post(
        "/shipping/decode-location",
        {
          token,
          amount:
            subtotal,
          miniAccessToken,
        }
      );

    if (
      r.data?.success &&
      r.data?.latitude &&
      r.data?.longitude
    ) {
      return {
        latitude:
          parseFloat(
            r.data.latitude
          ),

        longitude:
          parseFloat(
            r.data.longitude
          ),
      };
    }

    throw new Error(
      "Không decode được vị trí."
    );
  };


  const requestBrowserLocation =
    () =>
      new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !navigator.geolocation
          ) {
            reject(
              new Error(
                "Thiết bị không hỗ trợ định vị."
              )
            );

            return;
          }

          navigator.geolocation
            .getCurrentPosition(
              pos =>
                resolve({
                  latitude:
                    pos.coords
                      .latitude,

                  longitude:
                    pos.coords
                      .longitude,
                }),

              () =>
                reject(
                  new Error(
                    "Không lấy được vị trí. Vui lòng cho phép truy cập định vị."
                  )
                ),

              {
                timeout:
                  10000,

                enableHighAccuracy:
                  false,
              }
            );
        }
      );


  const requestShellLocation =
    () =>
      new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !window.parent ||
            window.parent ===
              window
          ) {
            reject(
              new Error(
                "Không có shell Zalo."
              )
            );

            return;
          }

          const requestId =
            `loc_${Date.now()}_${Math.random()
              .toString(36)
              .slice(2)}`;

          const miniAccessToken =
            useRuntimeCustomerIdentityStore
              .getState()
              .identity
              ?.miniAccessToken ||
            "";

          const timer =
            setTimeout(
              () => {
                window
                  .removeEventListener(
                    "message",
                    handler
                  );

                reject(
                  new Error(
                    "Zalo location timeout."
                  )
                );
              },
              10000
            );

          async function handler(
            e
          ) {
            const data =
              e.data ||
              {};

            if (
              data.type !==
              "ZALO_LOCATION_RESULT"
            ) {
              return;
            }

            if (
              data.requestId &&
              data.requestId !==
                requestId
            ) {
              return;
            }

            clearTimeout(
              timer
            );

            window
              .removeEventListener(
                "message",
                handler
              );

            try {
              if (
                !data.success
              ) {
                throw new Error(
                  data.error ||
                  "Không lấy được vị trí."
                );
              }

              if (
                data.latitude &&
                data.longitude
              ) {
                resolve({
                  latitude:
                    parseFloat(
                      data.latitude
                    ),

                  longitude:
                    parseFloat(
                      data.longitude
                    ),
                });

                return;
              }

              if (
                data.token
              ) {
                resolve(
                  await decodeLocationToken(
                    data.token,
                    data.miniAccessToken ||
                      miniAccessToken
                  )
                );

                return;
              }

              throw new Error(
                "Không lấy được vị trí."
              );
            } catch (
              err
            ) {
              reject(err);
            }
          }

          window
            .addEventListener(
              "message",
              handler
            );

          window.parent
            .postMessage(
              {
                type:
                  "REQUEST_ZALO_LOCATION",

                requestId,

                miniAccessToken,
              },
              "*"
            );
        }
      );


  const requestSdkLocation =
    async () => {
      const zmpSdk =
        await import(
          "zmp-sdk"
        );

      const result =
        await zmpSdk
          .getLocation();

      if (
        result?.latitude &&
        result?.longitude
      ) {
        return {
          latitude:
            parseFloat(
              result.latitude
            ),

          longitude:
            parseFloat(
              result.longitude
            ),
        };
      }

      if (
        result?.token
      ) {
        const miniAccessToken =
          useRuntimeCustomerIdentityStore
            .getState()
            .identity
            ?.miniAccessToken ||
          "";

        return decodeLocationToken(
          result.token,
          result.miniAccessToken ||
            miniAccessToken
        );
      }

      throw new Error(
        "Không lấy được vị trí."
      );
    };


  const requestDeliveryLocation =
    async () => {
      try {
        return await requestShellLocation();
      } catch(e) {}

      try {
        return await requestSdkLocation();
      } catch(e) {}

      return requestBrowserLocation();
    };


  const normalizeDeliveryCoords =
    (
      coords
    ) => {
      const latitude =
        Number(
          coords?.latitude
        );

      const longitude =
        Number(
          coords?.longitude
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        ) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        throw new Error(
          "Vị trí giao hàng không hợp lệ."
        );
      }

      return {
        latitude,
        longitude,
      };
    };


  const resolveTypedShippingAddress =
    async (
      addressValue,
      coordsOverride = null
    ) => {
      const addressText =
        String(
          addressValue ||
          ""
        ).trim();

      if (
        !addressText
      ) {
        throw new Error(
          "Vui lòng nhập địa chỉ giao hàng"
        );
      }

      const coords =
        normalizeDeliveryCoords(
          coordsOverride ||
          deliveryCoords
        );

      /*
       * Capture revision before request.
       * If the customer edits address while the request is in
       * flight, its response cannot restore an old capability.
       */
      const revision =
        deliveryAddressRevisionRef
          .current;

      setShipStatus(
        "loading"
      );

      setLocMsg(
        "Đang xác nhận địa chỉ giao hàng..."
      );

      try {
        const response =
          await apiClient.post(
            "/shipping/resolve-address",
            {
              address_text:
                addressText,

              current_latitude:
                coords.latitude,

              current_longitude:
                coords.longitude,

              order_amount:
                subtotal,
            }
          );

        const result =
          response.data;

        if (
          revision !==
          deliveryAddressRevisionRef
            .current
        ) {
          return null;
        }

        if (
          result?.success !==
            true ||
          !result
            ?.candidate_token
        ) {
          throw new Error(
            result?.error ||
            "Không xác nhận được địa chỉ giao hàng."
          );
        }

        const fee =
          Number(
            result.shipping_fee
          );

        const rawDistance =
          result
            .shipping_distance_km;

        const distance =
          rawDistance === null ||
          rawDistance ===
            undefined ||
          rawDistance === ""
            ? null
            : Number(
                rawDistance
              );

        if (
          !Number.isFinite(
            fee
          ) ||
          fee < 0
        ) {
          throw new Error(
            "Phí giao hàng không hợp lệ."
          );
        }

        setDeliveryCandidateToken(
          result
            .candidate_token
        );

        setShipFee(
          fee
        );

        if (
          distance !== null &&
          Number.isFinite(
            distance
          )
        ) {
          setDistKm(
            distance
          );
        } else {
          setDistKm(
            null
          );
        }

        setShipStatus(
          "done"
        );

        const canonicalAddress =
          String(
            result
              .formatted_address ||
            addressText
          ).trim();

        const mismatchKm =
          Number(
            result
              .mismatch_distance_km
          );

        if (
          result.mismatch ===
            true &&
          Number.isFinite(
            mismatchKm
          )
        ) {
          setLocMsg(
            `Địa chỉ giao hàng cách vị trí hiện tại ${mismatchKm.toFixed(1)} km · ${canonicalAddress}`
          );
        } else {
          setLocMsg(
            canonicalAddress
          );
        }

        return result
          .candidate_token;
      } catch(e) {
        if (
          revision ===
          deliveryAddressRevisionRef
            .current
        ) {
          setDeliveryCandidateToken(
            ""
          );

          setShipFee(
            0
          );

          setDistKm(
            null
          );

          setShipStatus(
            "error"
          );

          setLocMsg(
            e?.response
              ?.data
              ?.error ||
            e?.message ||
            "Không xác nhận được địa chỉ giao hàng."
          );
        }

        throw e;
      }
    };


  const handleDeliveryAddressChange =
    (
      value
    ) => {
      setAddress(
        value
      );

      deliveryAddressRevisionRef
        .current += 1;

      setDeliveryCandidateToken(
        ""
      );

      setShipFee(
        0
      );

      setDistKm(
        null
      );

      /*
       * Existing GPS may remain valid as current-position evidence,
       * but it is never sufficient authority for a changed typed
       * delivery destination.
       */
      setShipStatus(
        deliveryCoords
          ? "address_pending"
          : "idle"
      );

      setLocMsg(
        String(
          value ||
          ""
        ).trim()
          ? "Địa chỉ đã thay đổi. Vui lòng xác nhận lại."
          : ""
      );
    };


  const handleDeliveryAddressBlur =
    async (
      value
    ) => {
      if (
        orderType !==
          "delivery" ||
        !String(
          value ||
          ""
        ).trim() ||
        !deliveryCoords
      ) {
        return;
      }

      try {
        await resolveTypedShippingAddress(
          value
        );
      } catch(e) {
        /*
         * Error state/message is owned by
         * resolveTypedShippingAddress().
         */
      }
    };


  const refreshShippingLocation =
    async () => {
      deliveryAddressRevisionRef
        .current += 1;

      const revision =
        deliveryAddressRevisionRef
          .current;

      setDeliveryCandidateToken(
        ""
      );

      setShipFee(
        0
      );

      setDistKm(
        null
      );

      setShipStatus(
        "loading"
      );

      setLocMsg(
        "Đang lấy vị trí hiện tại..."
      );

      try {
        const rawCoords =
          await requestDeliveryLocation();

        const coords =
          normalizeDeliveryCoords(
            rawCoords
          );

        if (
          revision !==
          deliveryAddressRevisionRef
            .current
        ) {
          return;
        }

        setDeliveryCoords(
          coords
        );

        if (
          String(
            address ||
            ""
          ).trim()
        ) {
          await resolveTypedShippingAddress(
            address,
            coords
          );

          return;
        }

        setShipStatus(
          "address_pending"
        );

        setLocMsg(
          "Đã lấy vị trí. Hãy nhập địa chỉ giao hàng."
        );
      } catch(e) {
        if (
          revision ===
          deliveryAddressRevisionRef
            .current
        ) {
          setDeliveryCoords(
            null
          );

          setDeliveryCandidateToken(
            ""
          );

          setShipFee(
            0
          );

          setDistKm(
            null
          );

          setShipStatus(
            "denied"
          );

          setLocMsg(
            e?.message ||
            "Không lấy được vị trí. Vui lòng cho phép vị trí."
          );
        }
      }
    };


  const [paymentMethod,setPaymentMethod]=useState("momo");

  const walletSelected=paymentMethod==="cing_wallet";

  const total=Math.max(0, subtotal+shipFee-pointsDiscount-tierDiscount);

  async function handleOrder(){

    if(!name.trim()){
      setError("Vui lòng nhập họ tên");
      return;
    }

    if(
      orderType==="delivery" &&
      !address.trim()
    ){
      setError("Vui lòng nhập địa chỉ giao hàng");
      return;
    }

    if(
      orderType==="delivery" &&
      (
        !deliveryCoords ||
        !Number.isFinite(
          Number(
            deliveryCoords.latitude
          )
        ) ||
        !Number.isFinite(
          Number(
            deliveryCoords.longitude
          )
        )
      )
    ){
      setError(
        "Vui lòng cho phép vị trí để tính phí giao hàng chính xác"
      );
      return;
    }

    let checkoutCandidateToken =
      deliveryCandidateToken;

    /*
     * Blur normally resolves the typed address before submit.
     *
     * This fallback closes mobile keyboard / timing races:
     * no financial checkout request may proceed without a fresh
     * backend-signed candidate for the current typed destination.
     */
    if(
      orderType==="delivery" &&
      (
        shipStatus!=="done" ||
        !checkoutCandidateToken
      )
    ){
      try{
        checkoutCandidateToken =
          await resolveTypedShippingAddress(
            address,
            deliveryCoords
          );
      }catch(e){
        setError(
          e?.response?.data?.error ||
          e?.response?.data?.message ||
          e?.message ||
          "Không xác nhận được địa chỉ giao hàng."
        );
        return;
      }

      if(
        !checkoutCandidateToken
      ){
        setError(
          "Địa chỉ vừa thay đổi. Vui lòng xác nhận lại."
        );
        return;
      }
    }



    setLoading(true);
    setError("");


    try{

      const profilePhone =
        String(
          profile?.phone ||
          profile?.phoneNumber ||
          ""
        )
          .replace(/\D/g,"")
          .replace(/^84/,"0");

      const submittedPhone =
        String(phone || "")
          .replace(/\D/g,"")
          .replace(/^84/,"0");

      const customerPhone =
        profilePhone ||
        submittedPhone;


      /*
       * Client sends identity/presentation intent only.
       *
       * Financial authority lives entirely in /checkout/create:
       *
       * - catalog prices
       * - shipping
       * - membership tier
       * - voucher discount
       * - loyalty point value / usable points
       * - final monetary remainder
       * - final funding rail
       */
      const checkoutItems =
        items.map((item)=>({

          item_id:
            item.item_id ||
            item.id,

          quantity:
            item.qty,

          customization_option_ids:
            Array.isArray(
              item.customization_option_ids
            )
              ? item.customization_option_ids
              : [],

          note:
            item.note ||
            item.customNote ||
            "",

        }));


      const selectedPaymentMethod =
        walletSelected
          ? "cing_wallet"
          : "momo";


      const selectedPaymentProvider =
        walletSelected
          ? "cing_wallet"
          : "zalo_checkout";


      const checkoutRes =
        await apiClient.post(
          "/checkout/create",
          {

            customer_name:
              name.trim(),

            customer_phone:
              customerPhone,

            shipping_address:
              orderType==="delivery"
                ? address.trim()
                : "",

            note:
              note || "",

            order_type:
              orderType,

            destination_latitude:
              orderType==="delivery"
                ? deliveryCoords?.latitude ?? null
                : null,

            destination_longitude:
              orderType==="delivery"
                ? deliveryCoords?.longitude ?? null
                : null,

            candidate_token:
              orderType==="delivery"
                ? checkoutCandidateToken
                : null,
            items:
              checkoutItems,

            points_requested:
              pointsToUse,

            payment_method:
              selectedPaymentMethod,

            payment_provider:
              selectedPaymentProvider,

          }
        );


      const checkoutData =
        checkoutRes.data;


      if(
        checkoutData?.success !== true ||
        checkoutData?.checkout_validated !== true
      ){

        throw new Error(
          checkoutData?.message ||
          checkoutData?.error ||
          "Checkout chưa được xác nhận."
        );

      }


      /*
       * Backend may canonicalize the final rail to points/internal
       * when loyalty points cover the complete payable amount.
       */
      const pointsSettlement =
        checkoutData?.points_settlement;


      if(pointsSettlement){

        if(
          pointsSettlement?.success !== true ||
          pointsSettlement?.completed !== true ||
          !pointsSettlement?.order_id
        ){

          throw new Error(
            checkoutData?.message ||
            "Thanh toán bằng điểm chưa hoàn tất. Vui lòng kiểm tra lại."
          );

        }


        clearCart();
        navigate("/order-success");
        return;

      }


      const walletSettlement =
        checkoutData?.wallet_settlement;


      if(walletSettlement){

        if(
          walletSettlement?.success !== true ||
          walletSettlement?.completed !== true ||
          !walletSettlement?.order_id
        ){

          throw new Error(
            checkoutData?.message ||
            "Thanh toán Cing Wallet chưa hoàn tất. Vui lòng kiểm tra lại."
          );

        }


        clearCart();
        navigate("/order-success");
        return;

      }


      /*
       * External payment session is created by the same canonical
       * checkout request. There is no second create-session API.
       *
       * checkoutData.payment is paymentOrchestratorService result.
       */
      const paymentResult =
        checkoutData?.payment;


      const zaloOrder =
        paymentResult?.zaloOrder;


      if(!zaloOrder){

        throw new Error(
          "Không lấy được dữ liệu Zalo Checkout"
        );

      }


      const pendingTransactionCode =
        paymentResult?.payment?.transaction_code ||
        paymentResult?.payment?.transactionCode ||
        paymentResult?.transaction_code ||
        paymentResult?.transactionCode ||
        zaloOrder?.transaction_code ||
        zaloOrder?.transactionCode;


      if(pendingTransactionCode){

        sessionStorage.setItem(
          pendingCheckoutKey,
          pendingTransactionCode
        );

      }


      await requestZaloCheckoutFromShell({

        amount:
          zaloOrder.amount,

        item:
          zaloOrder.item,

        desc:
          zaloOrder.desc,

        mac:
          zaloOrder.mac,

        extradata:
          zaloOrder.extradata,

        method:
          zaloOrder.method,

      });


      return;

    }catch(e){

      console.error(
        "ZALO_CHECKOUT_ERROR",
        e
      );


      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Đặt hàng thất bại. Vui lòng thử lại.";


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
              <button onClick={()=>decrement(item.cartId || item.id)}
                style={{width:24,height:24,borderRadius:"50%",border:"1.5px solid #D4531C",
                  background:"white",color:"#D4531C",fontSize:16,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
              <span style={{fontSize:13,fontWeight:900,minWidth:16,textAlign:"center"}}>{item.qty}</span>
              <button onClick={()=>increment(item.cartId || item.id)}
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
            {shipStatus==="loading"&&<p style={{fontSize:12,color:"#999",margin:0}}>{locMsg || "Đang xác nhận vị trí giao hàng..."}</p>}
            {shipStatus==="address_pending"&&(
              <p style={{fontSize:11,color:"#f57c00",margin:0}}>
                {locMsg || "Vui lòng nhập và xác nhận địa chỉ giao hàng."}
              </p>
            )}

{shipStatus==="denied"&&(
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <p style={{fontSize:11,color:"#f57c00",margin:0}}>{locMsg}</p>
                <button onClick={refreshShippingLocation} style={{fontSize:11,color:"#D4531C",fontWeight:700,background:"none",border:"1px solid #D4531C",borderRadius:6,padding:"4px 10px",cursor:"pointer",alignSelf:"flex-start"}}>
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
          <Field
            label="Địa chỉ giao hàng *"
            value={address}
            onChange={handleDeliveryAddressChange}
            onBlur={handleDeliveryAddressBlur}
            placeholder="Số nhà, đường, phường/xã..."
          />}
      </div>

      {/* THANH TOÁN */}
      <div style={{background:"white",margin:"10px 12px 0",borderRadius:16,padding:"12px 16px"}}>
        <p style={{fontSize:11,fontWeight:700,color:"#999",margin:"0 0 10px",letterSpacing:.5}}>THANH TOÁN</p>

        <button
          type="button"
          onClick={()=>{
            setPaymentMethod("cing_wallet");
          }}
          style={{
            width:"100%",display:"flex",alignItems:"center",gap:12,
            padding:"10px 0",border:"none",background:"transparent",
            textAlign:"left",cursor:"pointer"
          }}
        >
          <span style={{fontSize:24}}>🧡</span>
          <div style={{flex:1}}>
            <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:0}}>Cing Wallet</p>
            <p style={{fontSize:11,color:"#999",margin:0}}>Thanh toán bằng số dư Cing Wallet</p>
          </div>
          <div style={{
            width:20,height:20,borderRadius:"50%",
            border:walletSelected?"none":"1.5px solid #ddd",
            background:walletSelected?"#D4531C":"white",
            display:"flex",alignItems:"center",justifyContent:"center"
          }}>
            {walletSelected&&<div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>}
          </div>
        </button>

        <div style={{height:1,background:"#f3f3f3",margin:"4px 0"}}/>

        <button
          type="button"
          onClick={()=>setPaymentMethod("momo")}
          style={{
            width:"100%",display:"flex",alignItems:"center",gap:12,
            padding:"10px 0",border:"none",background:"transparent",
            textAlign:"left",cursor:"pointer"
          }}
        >
          <span style={{fontSize:24}}>💜</span>
          <div style={{flex:1}}>
            <p style={{fontSize:13,fontWeight:700,color:"#1a1a1a",margin:0}}>MoMo</p>
            <p style={{fontSize:11,color:"#999",margin:0}}>Ví điện tử MoMo</p>
          </div>
          <div style={{
            width:20,height:20,borderRadius:"50%",
            border:!walletSelected?"none":"1.5px solid #ddd",
            background:!walletSelected?"#D4531C":"white",
            display:"flex",alignItems:"center",justifyContent:"center"
          }}>
            {!walletSelected&&<div style={{width:8,height:8,borderRadius:"50%",background:"white"}}/>}
          </div>
        </button>
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
          {loading
            ?"Đang xử lý..."
            :walletSelected
              ?"Thanh toán bằng Cing Wallet — "+fmt(total)
              :total===0
                ?"✅ Thanh toán bằng điểm — Miễn phí"
                :"Thanh toán qua Zalo Checkout — "+fmt(total)}
        </button>
      </div>
    </div>
  );
}
