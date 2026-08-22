import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      process.cwd(),
      relativePath
    ),
    "utf8"
  );
}

const authorityClient =
  read(
    "src/games/cing-block-puzzle/runtime/blockPuzzleAuthorityClient.js"
  );

const resolver =
  read(
    "src/infra/auth/persistedAuthSession.js"
  );

const bootstrap =
  read(
    "src/runtime/runtimeBootstrap.ts"
  );

test(
  "Block Puzzle uses canonical persisted auth token resolver",
  () => {
    assert.match(
      authorityClient,
      /getCanonicalAccessToken/
    );

    assert.doesNotMatch(
      authorityClient,
      /useAuthStore/
    );
  }
);

test(
  "canonical token resolver supports cing_session access token",
  () => {
    assert.match(
      resolver,
      /session\?\.accessToken/
    );

    assert.match(
      resolver,
      /cing_session/
    );
  }
);

test(
  "canonical token resolver supports persisted standalone access token",
  () => {
    assert.match(
      resolver,
      /cing_access_token/
    );
  }
);

test(
  "runtime bootstrap and Block Puzzle share persisted auth resolver",
  () => {
    assert.match(
      bootstrap,
      /getPersistedAuthSession/
    );

    assert.match(
      bootstrap,
      /@\/infra\/auth\/persistedAuthSession/
    );

    assert.match(
      authorityClient,
      /persistedAuthSession/
    );
  }
);

test(
  "Block Puzzle still requires Bearer authorization",
  () => {
    assert.match(
      authorityClient,
      /Authorization/
    );

    assert.match(
      authorityClient,
      /Bearer \$\{token\}/
    );
  }
);
