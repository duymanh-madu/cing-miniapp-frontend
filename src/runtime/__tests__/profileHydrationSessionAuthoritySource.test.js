import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync(
  "src/runtime/runtimeBootstrap.ts",
  "utf8"
);

const silentStart = source.indexOf(
  "function syncAuthStoreAfterSilentRestore"
);

const silentEnd = source.indexOf(
  "async function restoreActivatedMemberFromShellToken",
  silentStart
);

const silent = source.slice(
  silentStart,
  silentEnd
);

const profileStart = source.indexOf(
  "// 3b. Restore activated member identity"
);

const profileEnd = source.indexOf(
  "// 4. Chạy Zalo identity engine",
  profileStart
);

assert.ok(silentStart >= 0);
assert.ok(silentEnd > silentStart);
assert.ok(profileStart >= 0);
assert.ok(profileEnd > profileStart);

const profile = source.slice(
  profileStart,
  profileEnd
);

test("silent restore uses profile-only authority", () => {
  assert.match(
    silent,
    /commitProfileEnrichment\(\{/
  );

  assert.doesNotMatch(
    silent,
    /setSession\(|createSession\(/
  );

  assert.doesNotMatch(
    silent,
    /localStorage\.setItem/
  );
});

test("silent restore requires authenticated session", () => {
  assert.match(
    silent,
    /!auth\.authenticated/
  );

  assert.match(
    silent,
    /!auth\.refreshToken/
  );
});

test("async profile request captures session identity", () => {
  assert.match(
    profile,
    /const profileRequestAuth = useAuthStore\.getState\(\)/
  );

  assert.match(
    profile,
    /const expectedCustomerId/
  );

  assert.match(
    profile,
    /const expectedRefreshToken/
  );
});

test("async profile completion uses session-safe helper", () => {
  assert.match(
    profile,
    /const committed = commitProfileEnrichment\(\{/
  );

  assert.match(
    profile,
    /expectedPhone: storedPhone/
  );

  assert.match(
    profile,
    /if \(!committed\) \{\s*return;/
  );
});

test("profile callback does not replay captured credentials", () => {
  assert.doesNotMatch(
    profile,
    /accessToken: session\?\.accessToken/
  );

  assert.doesNotMatch(
    profile,
    /refreshToken: session\?\.refreshToken/
  );

  assert.doesNotMatch(
    profile,
    /localStorage\.setItem\("cing_session"/
  );
});

test("profile-only integration adds no timers or auth creation", () => {
  assert.doesNotMatch(
    silent + profile,
    /setTimeout|setInterval|createSession\(/
  );
});
