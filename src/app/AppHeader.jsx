function AppHeader() {

  return (
    <header
      className="
        fixed
        left-0
        right-0
        top-0
        z-50
        border-b
        bg-white/90
        backdrop-blur
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-full
          max-w-[640px]
          items-center
          justify-between
          px-4
        "
      >
        <h1
          className="
            text-lg
            font-black
          "
        >
          Cing Hu Tang Kinh Bắc
        </h1>
      </div>
    </header>
  );

}

export default
  AppHeader;