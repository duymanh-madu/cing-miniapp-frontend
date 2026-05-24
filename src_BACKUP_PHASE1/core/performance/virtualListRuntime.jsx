function VirtualListRuntime({
  items = [],
  renderItem,
  limit = 20,
}) {

  return (

    <>

      {

        items
          .slice(
            0,
            limit
          )
          .map(
            renderItem
          )

      }

    </>

  );

}

export default
  VirtualListRuntime;