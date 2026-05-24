import componentRegistry
  from "@/core/component-registry/componentRegistry";

function RuntimeRenderer({
  schema,
}) {

  if (
    !schema
  ) {

    return null;

  }

  const Component =
    componentRegistry.resolve(
      schema.type
    );

  if (
    !Component
  ) {

    return null;

  }

  return (

    <Component
      {...schema.props}
    >

      {

        schema.children?.map(
          (
            child
          ) => (

            <RuntimeRenderer
              key={
                child.id
              }

              schema={
                child
              }
            />

          )
        )

      }

    </Component>

  );

}

export default
  RuntimeRenderer;