import {
  Component,
} from "react";

import loggerService from "@/services/logger/loggerService";

/**
 * =========================================================
 * APP ERROR BOUNDARY
 * =========================================================
 */

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError() {
    return {
      hasError: true,
    };
  }

  componentDidCatch(
    error,
    info
  ) {
    loggerService.error(
      "React Render Error",
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
            bg-[#f8f8f8]
            px-6
          "
        >
          <div
            className="
              flex
              max-w-[320px]
              flex-col
              items-center
              text-center
            "
          >
            <h1
              className="
                text-2xl
                font-black
                text-[#111827]
              "
            >
              Hệ thống gặp sự cố
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                text-[#6b7280]
              "
            >
              Vui lòng tải lại ứng dụng.
            </p>

            <button
              onClick={() =>
                window.location.reload()
              }
              className="
                mt-6
                rounded-2xl
                bg-[#ff7a00]
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >
              Tải lại
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;