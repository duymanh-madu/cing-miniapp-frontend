class RuntimeExpressionResolver {

  evaluate({
    expression,
    context = {},
  }) {

    try {

      return Function(
        "context",

        `
        return ${expression}
        `
      )(
        context
      );

    } catch {

      return null;

    }

  }

}

const runtimeExpressionResolver =
  new RuntimeExpressionResolver();

export default
  runtimeExpressionResolver;