import test
  from "node:test";

import assert
  from "node:assert/strict";

import fs
  from "node:fs";

const source =
  fs.readFileSync(
    "src/infra/api/apiClient.js",
    "utf8"
  );

test(
  "apiClient reads canonical persisted access token",
  () => {
    assert.match(
      source,
      /getAccessToken/u
    );

    assert.match(
      source,
      /@\/infra\/auth\/authStorage/u
    );
  }
);

test(
  "apiClient attaches Bearer authorization when session exists",
  () => {
    assert.match(
      source,
      /Authorization/u
    );

    assert.match(
      source,
      /Bearer \$\{accessToken\}/u
    );
  }
);

test(
  "apiClient preserves explicit per-request authorization",
  () => {
    assert.match(
      source,
      /hasExplicitAuthorization/u
    );

    assert.match(
      source,
      /headers\.get\(\s*"Authorization"/u
    );

    assert.match(
      source,
      /headers\.Authorization\s*\|\|\s*headers\.authorization/u
    );

    assert.match(
      source,
      /if\s*\(\s*!hasExplicitAuthorization\s*\)/u
    );
  }
);

test(
  "apiClient logging never includes access token",
  () => {
    const loggerCall =
      source.slice(
        source.indexOf(
          'runtimeLogger.info(\n      "API",\n      "REQUEST"'
        )
      );

    assert.doesNotMatch(
      loggerCall,
      /accessToken|Authorization|Bearer/u
    );
  }
);
