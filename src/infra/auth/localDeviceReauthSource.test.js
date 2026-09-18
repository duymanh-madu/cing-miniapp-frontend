import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const local =
  fs.readFileSync(
    "src/infra/auth/localDeviceReauth.ts",
    "utf8"
  );

const bootstrap =
  fs.readFileSync(
    "src/runtime/runtimeBootstrap.ts",
    "utf8"
  );

const activation =
  fs.readFileSync(
    "src/zalo/activation/activationApi.ts",
    "utf8"
  );

const logout =
  fs.readFileSync(
    "src/infra/auth/logout.js",
    "utf8"
  );

test(
  "durable credential is frontend localStorage owned",
  () => {
    assert.match(
      local,
      /cing_device_reauth_v1/
    );

    assert.match(
      local,
      /localStorage\.setItem/
    );

    assert.doesNotMatch(
      local,
      /window\.parent|postMessage|REQUEST_SHELL_REAUTH/
    );
  }
);

test(
  "binding is cryptographically generated and is not installation id",
  () => {
    assert.match(
      local,
      /crypto\.getRandomValues/
    );

    assert.match(
      local,
      /randomHex\(32\)/
    );

    assert.doesNotMatch(
      local,
      /installation[_A-Za-z]/
    );
  }
);

test(
  "recover uses backend device recover",
  () => {
    assert.match(
      local,
      /["']\/auth\/device\/recover["']/
    );
  }
);

test(
  "successor is persisted before createSession",
  () => {
    const persist =
      local.indexOf(
        "persistEnvelope(\n      successor"
      );

    const create =
      local.indexOf(
        "createSession({"
      );

    assert.ok(
      persist >= 0
    );

    assert.ok(
      create > persist
    );
  }
);

test(
  "canonical activation enrolls using fresh Zalo proof",
  () => {
    assert.match(
      activation,
      /input\.phoneToken[\s\S]*input\.miniAccessToken[\s\S]*registerLocalDeviceReauthCredential/
    );

    assert.match(
      local,
      /phone_token:[\s\S]*verifiedPhoneToken/
    );

    assert.match(
      local,
      /mini_access_token:[\s\S]*verifiedMiniAccessToken/
    );
  }
);

test(
  "bootstrap tries local durable recovery before canonical Zalo fallback",
  () => {
    const recover =
      bootstrap.indexOf(
        "recoverLocalDeviceReauthSession()"
      );

    const fallback =
      bootstrap.indexOf(
        "await restoreActivatedMemberFromShellToken()"
      );

    assert.ok(
      recover >= 0
    );

    assert.ok(
      fallback > recover
    );
  }
);

test(
  "logout clears local durable credential",
  () => {
    assert.match(
      logout,
      /clearLocalDeviceReauthCredential\(\)/
    );

    assert.doesNotMatch(
      logout,
      /clearShellReauthCredential/
    );
  }
);

test(
  "frontend no longer imports shell reauth",
  () => {
    assert.doesNotMatch(
      bootstrap + activation + logout,
      /shellReauth/
    );
  }
);
