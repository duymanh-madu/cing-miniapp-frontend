function HeroBannerBlock({

  title,

  subtitle,

  image,

}) {

  return (

    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
      "
    >

      <img
        alt={title}
        src={image}
        className="
          h-[300px]
          w-full
          object-cover
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-black/50
        "
      />

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          justify-end
          p-8
        "
      >

        <h1
          className="
            text-4xl
            font-black
            text-white
          "
        >
          {title}
        </h1>

        <p
          className="
            mt-2
            text-white/80
          "
        >
          {subtitle}
        </p>

      </div>

    </div>

  );

}

export default
  HeroBannerBlock;