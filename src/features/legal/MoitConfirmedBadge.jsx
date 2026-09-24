import { getSystemInfo } from "zmp-sdk/apis";

const MOIT_RECORD =
  "https://online.gov.vn/nen-tang/d7214e45-6cad-4527-b5fa-3edec2fc45e1";

const MOIT_BADGE_IMAGE =
  "https://fileserver.online.gov.vn/uploads/Resources/iconxacnhan/DaThongBao.png";

function isInsideZalo() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const info = getSystemInfo();

    if (
      typeof info?.zaloVersion === "string" &&
      info.zaloVersion.trim()
    ) {
      return true;
    }
  } catch {
    // Continue with WebView detection.
  }

  const userAgent = window.navigator?.userAgent || "";

  return /Zalo/i.test(userAgent);
}

export default function MoitConfirmedBadge() {
  const badge = (
    <img
      src={MOIT_BADGE_IMAGE}
      alt="Đã thông báo Bộ Công Thương"
      height="44"
      style={{
        display: "block",
        height: 44,
        width: "auto",
        maxWidth: "100%",
        objectFit: "contain",
      }}
    />
  );

  const containerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 0",
  };

  if (isInsideZalo()) {
    return (
      <div style={containerStyle}>
        {badge}
      </div>
    );
  }

  return (
    <a
      href={MOIT_RECORD}
      target="_blank"
      rel="noopener noreferrer"
      title="Đã xác nhận với Bộ Công Thương"
      aria-label="Xem hồ sơ xác nhận của Cing Hu Tang Kinh Bắc"
      style={{
        ...containerStyle,
        textDecoration: "none",
      }}
    >
      {badge}
    </a>
  );
}
