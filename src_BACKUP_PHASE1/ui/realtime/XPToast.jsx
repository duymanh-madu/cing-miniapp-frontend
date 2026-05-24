export default function XPToast({

  toast,

}) {

  return (

    <div
      className="

        px-4
        py-3

        rounded-2xl

        bg-yellow-400
        text-black

        font-black
        text-lg

        shadow-2xl

        animate-bounce

      "
    >

      ⚡ +{toast.message}

    </div>

  );

}