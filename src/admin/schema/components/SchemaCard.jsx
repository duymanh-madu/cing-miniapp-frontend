function SchemaCard({
  schema,
  onSelect,
}) {

  return (

    <button
      onClick={() =>
        onSelect(schema)
      }

      className="
        w-full
        rounded-3xl
        border
        border-white/10
        bg-white/5
        p-5
        text-left
      "
    >

      <div
        className="
          text-xl
          font-black
        "
      >
        {schema.name}
      </div>

      <div
        className="
          mt-2
          text-sm
          text-white/60
        "
      >
        {schema.collection}
      </div>

    </button>

  );

}

export default
  SchemaCard;