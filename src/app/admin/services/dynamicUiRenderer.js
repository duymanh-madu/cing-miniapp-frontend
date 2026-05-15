class DynamicUiRenderer {

  render({
    components = [],
    registry = {},
  }) {

    return components.map(
      (
        component
      ) => {

        const Renderer =
          registry[
            component.type
          ];

        if (
          !Renderer
        ) {

          return null;

        }

        return {

          Renderer,

          props:
            component.props || {},

          id:
            component.id,

        };

      }
    );

  }

}

const dynamicUiRenderer =
  new DynamicUiRenderer();

export default
  dynamicUiRenderer;