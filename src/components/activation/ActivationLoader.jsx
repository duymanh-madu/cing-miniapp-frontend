import useActivationStore from "@/zalo/activation/activationStore";

function ActivationLoader() {
  const loading =
    useActivationStore(
      (state) => state.loading
    );

  if (!loading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />

        <p className="text-sm text-white">
          Đang kích hoạt tài khoản...
        </p>
      </div>
    </div>
  );
}

export default ActivationLoader;