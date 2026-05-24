import RuntimeRenderer from "./runtimeRenderer";

function runtimeNodeFactory({
  schema,
}) {

  return (

    <RuntimeRenderer
      schema={
        schema
      }
    />

  );

}

export default
  runtimeNodeFactory;