import RuntimeRenderer from "./runtimeRenderer";

function RuntimeTreeRenderer({
  tree = [],
}) {

  return (

    <>

      {

        tree.map(
          (
            node
          ) => (

            <RuntimeRenderer
              key={
                node.id
              }

              schema={
                node
              }
            />

          )
        )

      }

    </>

  );

}

export default
  RuntimeTreeRenderer;