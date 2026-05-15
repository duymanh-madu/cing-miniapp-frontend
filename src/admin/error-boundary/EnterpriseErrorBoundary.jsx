import {
  Component,
} from "react";

class EnterpriseErrorBoundary
  extends Component {

  constructor(
    props
  ) {

    super(props);

    this.state = {

      hasError:
        false,

      error:
        null,

    };

  }

  static getDerivedStateFromError(
    error
  ) {

    return {

      hasError:
        true,

      error,

    };

  }

  componentDidCatch(
    error,
    info
  ) {

    console.error(
      "EnterpriseErrorBoundary",
      {
        error,
        info,
      }
    );

  }

  render() {

    if (
      this.state.hasError
    ) {

      return (

        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-black
            text-white
          "
        >

          <div
            className="
              rounded-3xl
              bg-zinc-900
              p-10
            "
          >

            <div
              className="
                text-3xl
                font-black
              "
            >
              Runtime Failure
            </div>

            <div
              className="
                mt-4
                text-white/60
              "
            >
              Distributed UI Runtime
              crashed.
            </div>

          </div>

        </div>

      );

    }

    return this.props.children;

  }

}

export default
  EnterpriseErrorBoundary;