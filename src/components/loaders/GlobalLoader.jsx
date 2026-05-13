import useAppStore
from "@/stores/appStore";

function GlobalLoader() {
  const loading =
    useAppStore(
      (state) =>
        state.loading
    );

  if (!loading)
    return null;

  return (
    <div
      className="
      fixed
      inset-0
      z-[999]
      bg-black/30
      backdrop-blur-sm
      flex
      items-center
      justify-center
    "
    >
      <div
        className="
        bg-white
        rounded-4xl
        px-8
        py-6
        shadow-premium
        flex
        flex-col
        items-center
      "
      >
        <div
          className="
          w-12
          h-12
          border-4
          border-brand-orange
          border-t-transparent
          rounded-full
          animate-spin
        "
        />

        <p
          className="
          mt-4
          font-semibold
          text-brand-dark
        "
        >
          Đang tải...
        </p>
      </div>
    </div>
  );
}

export default GlobalLoader;