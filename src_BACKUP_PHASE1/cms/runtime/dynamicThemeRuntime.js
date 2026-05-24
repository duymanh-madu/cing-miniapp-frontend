import remoteConfigRuntime from "./remoteConfigRuntime";

class DynamicThemeRuntime {

  applyTheme() {

    const theme =
      remoteConfigRuntime.get(
        "theme",
        {}
      );

    const root =
      document.documentElement;

    Object.entries(
      theme
    ).forEach(
      ([key, value]) => {

        root.style.setProperty(
          `--${key}`,
          value
        );

      }
    );

  }

}

const dynamicThemeRuntime =
  new DynamicThemeRuntime();

export default
  dynamicThemeRuntime;