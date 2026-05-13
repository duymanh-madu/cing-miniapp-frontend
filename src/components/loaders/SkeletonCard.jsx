/**
 * ============================================
 * SKELETON CARD
 * ============================================
 */

function SkeletonCard() {
  return (
    <div
      className="
        rounded-[30px]
        bg-white
        p-5
        animate-pulse
        shadow-[0_10px_30px_rgba(0,0,0,0.04)]
      "
    >
      <div
        className="
          h-[180px]
          rounded-[24px]
          bg-gray-200
        "
      />

      <div
        className="
          mt-5
          h-5
          w-[70%]
          rounded-full
          bg-gray-200
        "
      />

      <div
        className="
          mt-3
          h-4
          w-[40%]
          rounded-full
          bg-gray-100
        "
      />
    </div>
  );
}

export default SkeletonCard;