function AppErrorScreen({
  message =
    "Something went wrong",
}) {

  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
      "
    >
      <div
        className="
          text-center
        "
      >
        <p
          className="
            text-lg
            font-bold
            text-red-500
          "
        >
          {message}
        </p>
      </div>
    </div>
  );

}

export default
  AppErrorScreen;