const MOIT_RECORD =
  "https://online.gov.vn/nen-tang/d7214e45-6cad-4527-b5fa-3edec2fc45e1";

const MOIT_BADGE_IMAGE =
  "https://fileserver.online.gov.vn/uploads/Resources/iconxacnhan/DaThongBao.png";

export default function MoitConfirmedBadge() {
  return (
    <a
      href={MOIT_RECORD}
      target="_blank"
      rel="noopener noreferrer"
      title="Đã xác nhận với Bộ Công Thương"
      aria-label="Xem hồ sơ xác nhận của Cing Hu Tang Kinh Bắc"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          padding: "18px 14px",
          borderRadius: 18,
          border: "1px solid #EAD8C7",
          background: "#FFF9F4",
          textAlign: "center",
        }}
      >
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

        <span
          style={{
            color: "#6D3A24",
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1.5,
          }}
        >
          Xem thông tin xác nhận của Cing trên Online.gov.vn ↗
        </span>
      </div>
    </a>
  );
}
