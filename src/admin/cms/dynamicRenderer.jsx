import componentRegistry from "./componentRegistry";

function DynamicRenderer({
  blocks = [],
}) {

  return (

    <>

      {

        blocks.map(
          (
            block
          ) => {

            const Component =

              componentRegistry.resolve(
                block.type
              );

            if (
              !Component
            ) {

              return null;

            }

            return (

              <Component

                key={
                  block.id
                }

                {
                  ...block.props
                }

              />

            );

          }
        )

      }

    </>

  );

}

export default
  DynamicRenderer;