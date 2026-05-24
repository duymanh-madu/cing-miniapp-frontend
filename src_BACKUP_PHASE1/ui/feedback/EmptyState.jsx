function EmptyState({
  title =
    "No data",
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
          text-gray-500
        "
      >
        {title}
      </p>
    </div>
  );

}

export default
  EmptyState;