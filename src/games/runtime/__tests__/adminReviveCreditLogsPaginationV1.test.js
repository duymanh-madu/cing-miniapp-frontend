import assert from
  "node:assert/strict";

import fs from
  "node:fs";

const source =
  fs.readFileSync(
    new URL(
      "../../../features/admin/components/AdminLogs.jsx",
      import.meta.url
    ),
    "utf8"
  );

assert.match(
  source,
  /const \[hasMore, setHasMore\]/
);

assert.match(
  source,
  /res\.data\?\.has_more === true/
);

assert.match(
  source,
  /disabled=\{!hasMore\}/
);

assert.doesNotMatch(
  source,
  /disabled=\{logs\.length<50\}/
);

assert.match(
  source,
  /const \[error, setError\]/
);

assert.match(
  source,
  /Không thể tải nhật ký hoạt động/
);

assert.match(
  source,
  /⚠️ \{error\}/
);

console.log(
  "PASS: Admin Logs UI uses authoritative pagination and visible failure state"
);
