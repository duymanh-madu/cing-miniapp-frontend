import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  fileURLToPath,
} from "node:url";

const here = path.dirname(
  fileURLToPath(import.meta.url)
);

const source = fs.readFileSync(
  path.resolve(
    here,
    "../offlineRevivalAuthorityClient.js"
  ),
  "utf8"
);

test(
  "shared authority uses existing canonical authentication",
  () => {
    assert.match(
      source,
      /getCanonicalAccessToken/
    );

    assert.match(
      source,
      /recoverBackendAuthSession/
    );

    assert.match(
      source,
      /Authorization:\s*`Bearer \$\{token\}`/
    );
  }
);

test(
  "mutation retry is limited to HTTP 401",
  () => {
    assert.match(
      source,
      /Number\(error\?\.response\?\.status \|\| 0\) !== 401/
    );

    assert.match(
      source,
      /return operation\(authConfig\(\)\)/
    );

    assert.doesNotMatch(
      source,
      /setInterval|setTimeout/
    );
  }
);

test(
  "UUID uses the existing secure WebView helper",
  () => {
    assert.match(
      source,
      /createBlockPuzzleSecureUuidV4/
    );

    assert.doesNotMatch(
      source,
      /Math\.random/
    );

    assert.doesNotMatch(
      source,
      /Date\.now/
    );
  }
);

test(
  "all three offline revival games are supported",
  () => {
    assert.match(
      source,
      /"cing-stack-tower"/
    );

    assert.match(
      source,
      /"black-pearl-rush"/
    );

    assert.match(
      source,
      /"cing-block-puzzle"/
    );
  }
);

test(
  "all six HTTP business operations are present",
  () => {
    for (const operation of [
      "startOfflineRevivalSession",
      "markOfflineRevivalPending",
      "purchaseOfflineRevival",
      "finalizeOfflineRevivalSession",
      "getOfflineRevivalCreditBalance",
      "recoverOfflineRevivalSession",
    ]) {
      assert.match(
        source,
        new RegExp(
          "export function\\s+" +
          operation +
          "\\("
        )
      );
    }
  }
);

test(
  "HTTP paths match backend read and mutation routes",
  () => {
    for (const path of [
      '"/session"',
      '"/pending"',
      '"/revive"',
      '"/finalize"',
      '"/balance"',
      '"/session/recover/"',
    ]) {
      assert.ok(
        source.includes(path),
        `Missing endpoint: ${path}`
      );
    }
  }
);

test(
  "no client owner or credit price enters mutation payload",
  () => {
    assert.doesNotMatch(
      source,
      /user_id\s*:/
    );

    assert.doesNotMatch(
      source,
      /credit_cost\s*:/
    );

    assert.doesNotMatch(
      source,
      /game_plays\s*:/
    );

    assert.doesNotMatch(
      source,
      /\/game\/use-play/
    );
  }
);

test(
  "PostgreSQL bigint is never coerced unsafely",
  () => {
    assert.match(
      source,
      /Number\.isSafeInteger/
    );

    assert.match(
      source,
      /BigInt\(decimal\)/
    );

    assert.match(
      source,
      /return decimal/
    );
  }
);

test(
  "read operations cannot create sessions",
  () => {
    assert.match(
      source,
      /getOfflineRevivalCreditBalance\(\)\s*\{\s*return get\("\/balance"\)/
    );

    assert.match(
      source,
      /recoverOfflineRevivalSession\(\{\s*requestId,\s*\}\)\s*\{\s*return get\(/
    );
  }
);
