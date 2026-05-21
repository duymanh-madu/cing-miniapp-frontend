// =====================================================
// FILE:
// src/pages/checkout/CheckoutPage.jsx
// PRODUCTION GRADE CHECKOUT
// ZALO MINI APP
// MOMO + BANKING + REALTIME
// =====================================================

import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Wallet,
  Landmark,
  ChevronRight,
  Check,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import useCartStore from "@/store/cartStore";

import apiClient from "@/infra/api/apiClient";

/**
 * =====================================================
 * COMPONENT
 * =====================================================
 */

function CheckoutPage() {

  const navigate =
    useNavigate();

  /**
   * =====================================================
   * STORE
   * =====================================================
   */

  const cartItems =
    useCartStore(
      (state) =>
        state.items
    );

  const clearCart =
    useCartStore(
      (state) =>
        state.clearCart
    );

  /**
   * =====================================================
   * STATE
   * =====================================================
   */

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState(
    "MOMO"
  );

  const [
    loading,
    setLoading,
  ] = useState(
    false
  );

  /**
   * =====================================================
   * TOTAL
   * =====================================================
   */

  const totalPrice =
    useMemo(() => {

      return cartItems.reduce(

        (
          total,
          item
        ) => {

          const itemPrice =

            item.totalPrice ||

            item.price ||

            0;

          const quantity =
            item.quantity || 1;

          return (
            total +
            itemPrice * quantity
          );

        },

        0
      );

    }, [cartItems]);

  /**
   * =====================================================
   * PAYMENT METHODS
   * =====================================================
   */

  const paymentMethods = [

    {

      id: "MOMO",

      title: "Ví MoMo",

      subtitle:
        "Thanh toán realtime",

      icon: Wallet,

      gradient:
        "from-pink-500 to-fuchsia-500",

    },

    {

      id: "BANKING",

      title:
        "Chuyển khoản ngân hàng",

      subtitle:
        "QR Banking realtime",

      icon: Landmark,

      gradient:
        "from-orange-500 to-amber-500",

    },

  ];

  /**
   * =====================================================
   * HANDLE CHECKOUT
   * =====================================================
   */

  async function handleCheckout() {

    try {

      /**
       * ===============================================
       * VALIDATE
       * ===============================================
       */

      if (!cartItems.length) {

        alert(
          "Giỏ hàng trống"
        );

        return;

      }

      if (loading) {

        return;

      }

      setLoading(true);

      /**
       * ===============================================
       * PAYLOAD
       * ===============================================
       */

      const payload = {

        user_id:
          "demo-user",

        customer_name:
          "Zalo Customer",

        customer_phone:
          "0900000000",

        payment_provider:

          paymentMethod ===
          "MOMO"

            ? "momo"

            : "banking",

        payment_method:
          paymentMethod,

        subtotal:
          totalPrice,

        shipping_fee:
          0,

        total_amount:
          totalPrice,

        shipping_address:
          "Zalo Mini App",

        shipping_distance:
          0,

        cart_snapshot: {

          items:
            cartItems,

          subtotal:
            totalPrice,

          shipping_fee:
            0,

          customer_name:
            "Zalo Customer",

          customer_phone:
            "0900000000",

          shipping_address:
            "Zalo Mini App",

          shipping_distance:
            0,

        },

      };

      /**
       * ===============================================
       * API REQUEST
       * ===============================================
       */

      console.log(
        "CHECKOUT PAYLOAD:",
        payload
      );

      const response =
        await apiClient.post(

          "/api/payment/create-session",

          payload
        );

      console.log(
        "PAYMENT RESPONSE:",
        response.data
      );

      const paymentData =
        response?.data;

      /**
       * ===============================================
       * VALIDATE RESPONSE
       * ===============================================
       */

      if (
        !paymentData?.success
      ) {

        throw new Error(

          paymentData?.message ||

          paymentData?.error ||

          "Không thể tạo thanh toán"
        );

      }

      /**
       * ===============================================
       * MOMO FLOW
       * ===============================================
       */

      if (
        paymentMethod ===
        "MOMO"
      ) {

        const paymentUrl =

          paymentData?.paymentUrl ||

          paymentData?.momo?.payUrl ||

          paymentData?.momo?.deeplink ||

          paymentData?.deeplink ||

          null;

        console.log(
          "MOMO PAYMENT URL:",
          paymentUrl
        );

        /**
         * ---------------------------------------------
         * URL NOT FOUND
         * ---------------------------------------------
         */

        if (!paymentUrl) {

          console.error(
            "MoMo URL missing:",
            paymentData
          );

          alert(
            "Không lấy được link thanh toán MoMo"
          );

          return;

        }

        /**
         * ---------------------------------------------
         * CLEAR CART
         * ---------------------------------------------
         */

        clearCart();

        /**
         * ---------------------------------------------
         * REDIRECT
         * ---------------------------------------------
         */

        window.location.assign(
          paymentUrl
        );

        return;

      }

      /**
       * ===============================================
       * BANKING FLOW
       * ===============================================
       */

      if (
        paymentMethod ===
        "BANKING"
      ) {

        clearCart();

        navigate(

          "/payment/banking",

          {

            state: {

              qrCode:

                paymentData
                  ?.bank_transfer
                  ?.qrCodeUrl ||

                paymentData
                  ?.bank_transfer
                  ?.content ||

                paymentData
                  ?.qrCodeUrl ||

                null,

              amount:
                totalPrice,

              transactionCode:

                paymentData
                  ?.payment
                  ?.transaction_code ||

                null,

              expiredAt:

                paymentData
                  ?.bank_transfer
                  ?.expired_at ||

                null,

            },

          }
        );

      }

    } catch (error) {

      console.error(
        "CHECKOUT ERROR:",
        error
      );

      const message =

        error?.response
          ?.data
          ?.error ||

        error?.response
          ?.data
          ?.message ||

        error?.message ||

        "Không thể tạo thanh toán";

      alert(message);

    } finally {

      setLoading(false);

    }

  }

  /**
   * =====================================================
   * EMPTY CART
   * =====================================================
   */

  if (!cartItems.length) {

    return (

      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#f6f1e7]
          px-6
        "
      >

        <div className="text-center">

          <h1
            className="
              text-5xl
              font-black
              text-[#2b1105]
            "
          >

            Giỏ hàng trống

          </h1>

          <Link
            to="/menu"
            className="
              mt-6
              inline-flex
              h-14
              items-center
              justify-center
              rounded-2xl
              bg-orange-500
              px-8
              text-lg
              font-black
              text-white
            "
          >

            Xem menu

          </Link>

        </div>

      </div>

    );

  }

  /**
   * =====================================================
   * UI
   * =====================================================
   */

  return (

    <div
      className="
        min-h-screen
        bg-[#f6f1e7]
        pb-40
      "
    >

      {/* HEADER */}

      <div
        className="
          sticky
          top-0
          z-50
          border-b
          border-[#eadcc9]
          bg-[#f6f1e7]/90
          backdrop-blur-xl
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-5
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <Link
              to="/menu"
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-white
                shadow-lg
              "
            >

              <ArrowLeft
                size={22}
              />

            </Link>

            <div>

              <p
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-orange-500
                "
              >

                Secure Payment

              </p>

              <h1
                className="
                  text-5xl
                  font-black
                  text-[#2b1105]
                "
              >

                Checkout

              </h1>

            </div>

          </div>

          <div
            className="
              flex
              items-center
              gap-2
              rounded-full
              bg-emerald-100
              px-4
              py-2
              text-sm
              font-bold
              text-emerald-700
            "
          >

            <ShieldCheck
              size={18}
            />

            Protected

          </div>

        </div>

      </div>

      {/* ITEMS */}

      <div
        className="
          space-y-3
          px-5
          pt-5
        "
      >

        {cartItems.map(

          (
            item,
            index
          ) => (

            <div
              key={`${item.id}-${index}`}
              className="
                rounded-[28px]
                bg-white
                p-5
                shadow-lg
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div>

                  <h3
                    className="
                      text-xl
                      font-black
                      text-[#2b1105]
                    "
                  >

                    {item.name}

                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-zinc-500
                    "
                  >

                    SL:
                    {" "}
                    {item.quantity || 1}

                  </p>

                </div>

                <h3
                  className="
                    text-2xl
                    font-black
                    text-orange-500
                  "
                >

                  {(
                    (
                      item.totalPrice ||

                      item.price ||

                      0
                    ) *

                    (
                      item.quantity || 1
                    )

                  ).toLocaleString()}đ

                </h3>

              </div>

            </div>

          )
        )}

      </div>

      {/* PAYMENT */}

      <div
        className="
          px-5
          pt-6
        "
      >

        <h2
          className="
            text-3xl
            font-black
            text-[#2b1105]
          "
        >

          Phương thức thanh toán

        </h2>

        <div
          className="
            mt-4
            space-y-4
          "
        >

          {paymentMethods.map(
            (method) => {

              const Icon =
                method.icon;

              const active =
                paymentMethod ===
                method.id;

              return (

                <button
                  key={method.id}
                  onClick={() =>
                    setPaymentMethod(
                      method.id
                    )
                  }
                  className={`
                    relative
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-[30px]
                    border-2
                    p-5
                    text-left
                    transition-all

                    ${
                      active

                        ? `
                          border-orange-500
                          bg-white
                          shadow-xl
                        `

                        : `
                          border-transparent
                          bg-white/70
                        `
                    }
                  `}
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className={`
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-3xl
                        bg-gradient-to-br
                        ${method.gradient}
                        text-white
                        shadow-lg
                      `}
                    >

                      <Icon
                        size={28}
                      />

                    </div>

                    <div>

                      <h3
                        className="
                          text-xl
                          font-black
                          text-[#2b1105]
                        "
                      >

                        {method.title}

                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-zinc-500
                        "
                      >

                        {method.subtitle}

                      </p>

                    </div>

                  </div>

                  {active ? (

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        bg-orange-500
                        text-white
                      "
                    >

                      <Check
                        size={18}
                      />

                    </div>

                  ) : (

                    <ChevronRight
                      size={22}
                      className="
                        text-zinc-400
                      "
                    />

                  )}

                </button>

              );

            }
          )}

        </div>

      </div>

      {/* FOOTER */}

      <div
        className="
          fixed
          bottom-0
          left-0
          right-0
          border-t
          border-[#eadcc9]
          bg-[#f6f1e7]/95
          p-5
          backdrop-blur-xl
        "
      >

        <div
          className="
            flex
            items-center
            justify-between
          "
        >

          <div>

            <p
              className="
                text-sm
                text-zinc-500
              "
            >

              Tổng thanh toán

            </p>

            <h2
              className="
                mt-1
                text-4xl
                font-black
                text-[#2b1105]
              "
            >

              {totalPrice.toLocaleString()}đ

            </h2>

          </div>

          <button
            onClick={
              handleCheckout
            }
            disabled={loading}
            className="
              flex
              h-16
              min-w-[190px]
              items-center
              justify-center
              gap-3
              rounded-3xl
              bg-gradient-to-r
              from-orange-500
              to-amber-400
              px-8
              text-xl
              font-black
              text-white
              shadow-2xl
              transition-all
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >

            {loading ? (

              <>

                <Loader2
                  size={24}
                  className="
                    animate-spin
                  "
                />

                Đang xử lý

              </>

            ) : (

              <>Thanh toán</>

            )}

          </button>

        </div>

      </div>

    </div>

  );

}

export default CheckoutPage;