import React from "react";

import {
  reportError,
} from "@/system/error";

class AppErrorBoundary
  extends React.Component {

  constructor(
    props
  ) {

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

  componentDidCatch(
    error
  ) {

    reportError(
      error
    );

  }

  render() {

    if (
      this.state
        .hasError
    ) {

      return (

        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
          "
        >

          <p
            className="
              text-sm
              font-semibold
            "
          >
            Hệ thống đang gặp lỗi
          </p>

        </div>

      );

    }

    return this.props
      .children;

  }

}

export default
  AppErrorBoundary;