import React from "react";

import AppCrashFallback from "./AppCrashFallback";

class SafeRenderBoundary
  extends React.Component {

  constructor(props) {

    super(props);

    this.state = {

      hasError:
        false,

    };

  }

  static getDerivedStateFromError() {

    return {

      hasError:
        true,

    };

  }

  componentDidCatch(error) {

    console.error(
      error
    );

  }

  render() {

    if (
      this.state.hasError
    ) {

      return <AppCrashFallback />;

    }

    return this.props.children;

  }

}

export default SafeRenderBoundary;