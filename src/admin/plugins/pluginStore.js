import {
  create,
} from "zustand";

const usePluginStore =
  create(
    (
      set
    ) => ({

      plugins:
        [],

      installedPlugins:
        [],

      pluginMarketplace:
        [],

      pluginRuntime:
        {},

      setPlugins:
        (
          plugins
        ) => {

          set({
            plugins,
          });

        },

      setInstalledPlugins:
        (
          installedPlugins
        ) => {

          set({
            installedPlugins,
          });

        },

      setPluginMarketplace:
        (
          pluginMarketplace
        ) => {

          set({
            pluginMarketplace,
          });

        },

      setPluginRuntime:
        (
          pluginRuntime
        ) => {

          set({
            pluginRuntime,
          });

        },

    })
  );

export default
  usePluginStore;