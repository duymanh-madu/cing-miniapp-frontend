// =====================================================
// FILE: src/pages/voucher/VoucherPage.jsx
// VIP FINAL + BACK HOME
// =====================================================

import {
  ArrowLeft,
  Ticket,
  Gift,
  Sparkles,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

function VoucherPage() {

  const vouchers = [

    {
      title: "Giảm 30%",
      description:
        "Áp dụng toàn menu",
      expire:
        "HSD: 30/06/2026",
      color:
        "from-orange-500 to-amber-400",
    },

    {
      title: "Free Topping",
      description:
        "Tặng miễn phí topping",
      expire:
        "HSD: 12/07/2026",
      color:
        "from-yellow-500 to-orange-400",
    },

    {
      title: "Mua 1 Tặng 1",
      description:
        "Áp dụng khung giờ vàng",
      expire:
        "HSD: 18/08/2026",
      color:
        "from-[#3b1200] to-[#8a2d00]",
    },

  ];

  return (

    <div
      className="
        min-h-screen
        bg-[#f6f1e7]
        pb-32
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
              to="/"
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

                Rewards

              </p>

              <h1
                className="
                  text-5xl
                  font-black
                  text-[#2b1105]
                "
              >

                Voucher

              </h1>

            </div>

          </div>

          <div
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-3xl
              bg-gradient-to-br
              from-orange-500
              to-amber-400
              shadow-xl
            "
          >

            <Gift
              size={28}
              className="
                text-white
              "
            />

          </div>

        </div>

      </div>

      {/* CONTENT */}

      <div
        className="
          px-5
          pt-5
          space-y-4
        "
      >

        {vouchers.map(
          (
            voucher,
            index
          ) => (

            <div
              key={index}
              className={`
                relative
                overflow-hidden
                rounded-[32px]
                bg-gradient-to-br
                ${voucher.color}
                p-5
                text-white
                shadow-xl
              `}
            >

              <div
                className="
                  absolute
                  right-[-20px]
                  top-[-20px]
                  h-32
                  w-32
                  rounded-full
                  bg-white/10
                "
              />

              <div
                className="
                  flex
                  items-start
                  justify-between
                "
              >

                <div>

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Ticket
                      size={18}
                    />

                    <span
                      className="
                        text-xs
                        font-black
                        uppercase
                        tracking-[0.2em]
                      "
                    >

                      VIP Voucher

                    </span>

                  </div>

                  <h2
                    className="
                      mt-4
                      text-5xl
                      font-black
                    "
                  >

                    {voucher.title}

                  </h2>

                  <p
                    className="
                      mt-2
                      text-lg
                      text-white/80
                    "
                  >

                    {voucher.description}

                  </p>

                </div>

                <Sparkles
                  size={26}
                />

              </div>

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-between
                "
              >

                <span
                  className="
                    rounded-full
                    bg-white/15
                    px-4
                    py-2
                    text-sm
                    font-bold
                    backdrop-blur-xl
                  "
                >

                  {voucher.expire}

                </span>

                <button
                  className="
                    rounded-full
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-black
                  "
                >

                  Sử dụng

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

}

export default VoucherPage;