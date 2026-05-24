const IS_DEV =
  import.meta.env.DEV;

const ENABLE_RUNTIME_LOGS =
  import.meta.env
    .VITE_ENABLE_RUNTIME_LOGS === "true";

function canLog() {
  return IS_DEV || ENABLE_RUNTIME_LOGS;
}

function formatMessage(level, scope, args) {
  return [
    `[${level}]`,
    `[${scope}]`,
    ...args,
  ];
}

export const runtimeLogger = {
  info(scope, ...args) {
    if (!canLog()) return;

    console.info(
      ...formatMessage("INFO", scope, args)
    );
  },

  warn(scope, ...args) {
    if (!canLog()) return;

    console.warn(
      ...formatMessage("WARN", scope, args)
    );
  },

  error(scope, ...args) {
    if (!canLog()) return;

    console.error(
      ...formatMessage("ERROR", scope, args)
    );
  },
};

export default runtimeLogger;
