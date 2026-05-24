function LoadingScreen() {

  return (

    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f8f8f8]
      "
    >

      <div
        className="
          flex
          flex-col
          items-center
        "
      >

        <div
          className="
            h-12
            w-12
            animate-spin
            rounded-full
            border-[3px]
            border-[#ffe7cc]
            border-t-[#ff7a00]
          "
        />

        <p
          className="
            mt-4
            text-sm
            font-medium
            text-[#6b7280]
          "
        >
          Đang tải hệ thống...
        </p>

      </div>

    </div>

  );

}

export default
  LoadingScreen;