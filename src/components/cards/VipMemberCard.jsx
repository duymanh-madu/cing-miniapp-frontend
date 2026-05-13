function VipMemberCard() {
  return (
    <div
      className="
      mt-5
      rounded-4xl
      bg-gradient-to-r
      from-[#2C1810]
      to-[#5A3825]
      text-white
      p-5
      shadow-premium
    "
    >
      <div
        className="
        flex
        justify-between
        items-center
      "
      >
        <div>
          <p
            className="
            text-white/70
            text-sm
          "
          >
            Thành viên
          </p>

          <h3
            className="
            text-2xl
            font-bold
            mt-1
          "
          >
            GOLD MEMBER
          </h3>
        </div>

        <div
          className="
          text-5xl
        "
        >
          👑
        </div>
      </div>

      <div
        className="
        mt-4
      "
      >
        <div
          className="
          h-3
          bg-white/20
          rounded-full
          overflow-hidden
        "
        >
          <div
            className="
            h-full
            w-2/3
            bg-brand-gold
          "
          />
        </div>

        <p
          className="
          mt-2
          text-sm
          text-white/70
        "
        >
          Còn 1.200.000đ để
          lên PLATINUM
        </p>
      </div>
    </div>
  );
}

export default VipMemberCard;