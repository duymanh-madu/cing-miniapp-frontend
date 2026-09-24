import { useEffect, useState } from "react";

const MOIT_RECORD =
  "https://online.gov.vn/nen-tang/d7214e45-6cad-4527-b5fa-3edec2fc45e1";

const MOIT_BADGE_IMAGE =
  "https://fileserver.online.gov.vn/uploads/Resources/iconxacnhan/DaThongBao.png";

export default function MoitConfirmedBadge({
  size = "default",
}) {
  const [open, setOpen] = useState(false);

  const isLarge = size === "large";

  useEffect(() => {
    if (!open) return undefined;

    function onEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      onEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        onEscape
      );
    };
  }, [open]);

  const badgeHeight =
    isLarge ? 76 : 66;

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          padding: "12px 0",
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Xem thông tin xác nhận Bộ Công Thương"
          title="Xem thông tin xác nhận Bộ Công Thương"
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "100%",
            minHeight: 76,
            border: 0,
            padding: "6px 10px",
            background: "transparent",
            cursor: "pointer",
            WebkitTapHighlightColor:
              "transparent",
          }}
        >
          <img
            src={MOIT_BADGE_IMAGE}
            alt="Đã thông báo Bộ Công Thương"
            draggable={false}
            style={{
              display: "block",
              width: "auto",
              height: badgeHeight,
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        </button>
      </div>

      {open && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding:
              "max(20px, env(safe-area-inset-top)) 18px max(20px, env(safe-area-inset-bottom))",
            background:
              "rgba(24, 25, 35, 0.58)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="cing-moit-dialog-title"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 420,
              maxHeight: "100%",
              overflowY: "auto",
              boxSizing: "border-box",
              borderRadius: 24,
              background: "#FFFCF8",
              padding: "28px 22px 24px",
              boxShadow:
                "0 20px 55px rgba(0,0,0,0.22)",
              textAlign: "center",
            }}
          >
            <button
              type="button"
              aria-label="Đóng thông tin xác nhận"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                width: 38,
                height: 38,
                border: 0,
                borderRadius: "50%",
                background: "#F3E8DE",
                color: "#70452F",
                fontSize: 24,
                lineHeight: 1,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <div
              style={{
                color: "#C74F1D",
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: 1.2,
                marginBottom: 12,
              }}
            >
              CING HU TANG KINH BẮC
            </div>

            <h2
              id="cing-moit-dialog-title"
              style={{
                margin: "0 22px 20px",
                fontSize: 22,
                lineHeight: 1.35,
                color: "#263140",
                fontWeight: 800,
              }}
            >
              Thông tin xác nhận
              <br />
              Bộ Công Thương
            </h2>

            <img
              src={MOIT_BADGE_IMAGE}
              alt="Đã thông báo Bộ Công Thương"
              draggable={false}
              style={{
                display: "block",
                width: "min(100%, 310px)",
                height: "auto",
                margin: "0 auto 20px",
                objectFit: "contain",
              }}
            />

            <p
              style={{
                margin: "0 0 24px",
                color: "#665D57",
                fontSize: 15,
                lineHeight: 1.65,
              }}
            >
              Xem hồ sơ thông báo của
              Cing Hu Tang Kinh Bắc
              trên hệ thống Bộ Công Thương.
            </p>

            <a
              href={MOIT_RECORD}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Truy cập hồ sơ Cing Hu Tang Kinh Bắc trên Bộ Công Thương"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 50,
                borderRadius: 14,
                padding: "8px 16px",
                boxSizing: "border-box",
                background: "#D9501B",
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow:
                  "0 5px 15px rgba(217,80,27,0.2)",
              }}
            >
              Xem hồ sơ xác nhận ↗
            </a>

            <p
              style={{
                margin: "14px 0 0",
                fontSize: 12,
                lineHeight: 1.5,
                color: "#887E76",
              }}
            >
              Trang xác nhận được cung cấp
              bởi online.gov.vn.
            </p>
          </section>
        </div>
      )}
    </>
  );
}

export {
  MOIT_RECORD,
  MOIT_BADGE_IMAGE,
};
