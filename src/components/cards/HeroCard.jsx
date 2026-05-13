function HeroCard() {
  return (
    <div
      className="
      relative
      overflow-hidden
      bg-brand-orange
      rounded-4xl
      p-6
      shadow-premium
      text-white
    "
    >
      <div
        className="
        absolute
        -top-10
        -right-10
        w-40
        h-40
        rounded-full
        bg-white/10
      "
      />

      <div
        className="
        relative
        z-10
      "
      >
        <h2
          className="
          text-3xl
          font-bold
        "
        >
          Cing Hu Tang
        </h2>

        <p
          className="
          mt-2
          text-white/80
        "
        >
          Professional Luxury
          Mini App
        </p>

        <button
          className="
          mt-5
          bg-white
          text-brand-orange
          px-5
          py-3
          rounded-2xl
          font-semibold
          shadow-soft
        "
        >
          Khám phá ngay
        </button>
      </div>
    </div>
  );
}

export default HeroCard;