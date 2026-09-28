"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const source = fs.readFileSync(
  path.resolve(
    __dirname,
    "../AdminDailyChallenge.jsx"
  ),
  "utf8"
);

const saveStart =
  source.indexOf(
    "  const save = async () => {"
  );

const saveEnd =
  source.indexOf(
    "  const update =",
    saveStart
  );

assert.ok(
  saveStart >= 0 &&
  saveEnd > saveStart,
  "Admin Save boundary missing"
);

const actions =
  source.slice(
    saveStart,
    saveEnd
  );

test(
  "Admin Save uses dedicated atomic Apply",
  () => {
    assert.match(
      actions,
      /\/app-config\/revival-challenges\/apply/
    );

    assert.doesNotMatch(
      actions,
      /apiClient\.put\("\/app-config\/1"/
    );

    assert.doesNotMatch(
      actions,
      /\/game\/daily-challenge\/sync-today/
    );
  }
);

test(
  "authenticated Admin token remains attached",
  () => {
    assert.match(
      actions,
      /\{ headers: h \}/
    );
  }
);

test(
  "request ID survives identical retry",
  () => {
    assert.match(
      actions,
      /pendingApplyRef\.current\.signature !==\s*signature/
    );

    assert.match(
      actions,
      /pending\.requestId/
    );
  }
);

test(
  "request UUID uses crypto authority",
  () => {
    assert.match(
      actions,
      /globalThis\.crypto\?\.randomUUID\?\.\(\)/
    );
  }
);

test(
  "successful Apply clears pending identity",
  () => {
    assert.match(
      actions,
      /response\.data\?\.success !== true/
    );

    assert.match(
      actions,
      /pendingApplyRef\.current =\s*null/
    );
  }
);

test(
  "Reset label excludes Revival",
  () => {
    assert.match(
      source,
      /Reset thách thức game ngoài Revival/
    );

    assert.match(
      source,
      /Black Pearl Rush và Cing Stack Tower không bị reset/
    );
  }
);
