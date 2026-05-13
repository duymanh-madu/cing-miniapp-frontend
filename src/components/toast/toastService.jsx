import toast from "react-hot-toast";

/**
 * ============================================
 * TOAST SERVICE
 * ============================================
 */

export function showSuccessToast(
  message
) {
  toast.success(message);
}

export function showErrorToast(
  message
) {
  toast.error(message);
}

export function showLoadingToast(
  message = "Đang xử lý..."
) {
  return toast.loading(
    message
  );
}

export function dismissToast(
  toastId
) {
  toast.dismiss(toastId);
}

export function showBusinessToast({
  title,
  message,
  icon = "🎉",
}) {
  toast.custom(() => (
    <div
      className="
        w-[340px]
        rounded-[28px]
        bg-white/95
        backdrop-blur-2xl
        border
        border-white/60
        shadow-[0_25px_60px_rgba(0,0,0,0.16)]
        overflow-hidden
      "
    >
      <div
        className="
          p-5
          flex
          gap-4
        "
      >
        <div
          className="
            h-[58px]
            w-[58px]
            rounded-[22px]
            bg-brand-orange/10
            flex
            items-center
            justify-center
            text-[28px]
          "
        >
          {icon}
        </div>

        <div
          className="
            flex-1
          "
        >
          <h3
            className="
              text-[15px]
              font-black
              text-gray-900
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-[13px]
              leading-relaxed
              text-gray-500
            "
          >
            {message}
          </p>
        </div>
      </div>

      <div
        className="
          h-[5px]
          w-full
          bg-gradient-to-r
          from-brand-orange
          to-orange-400
        "
      />
    </div>
  ));
}