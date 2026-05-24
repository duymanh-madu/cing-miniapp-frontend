function ErrorState({
  message =
    "Something went wrong",
}) {

  return (
    <div
      className="
        py-12
        text-center
      "
    >
      <p
        className="
          text-sm
          font-bold
          text-red-500
        "
      >
        {message}
      </p>
    </div>
  );

}

export default
  ErrorState;