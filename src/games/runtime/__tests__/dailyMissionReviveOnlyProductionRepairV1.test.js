import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here =
  path.dirname(
    fileURLToPath(import.meta.url)
  );

const root =
  path.resolve(
    here,
    "../../.."
  );

const admin =
  fs.readFileSync(
    path.join(
      root,
      "features/admin/components/AdminMissions.jsx"
    ),
    "utf8"
  );

const gameCenter =
  fs.readFileSync(
    path.join(
      root,
      "features/game-center/pages/GameCenterPage.jsx"
    ),
    "utf8"
  );

assert.match(
  admin,
  /Số Revive Credit thưởng/
);

assert.match(
  admin,
  /revive_credits/
);

assert.doesNotMatch(
  admin,
  /Số lượt chơi thưởng/
);

assert.match(
  gameCenter,
  /Phần thưởng:.*Revive Credit/
);

assert.match(
  gameCenter,
  /Điểm danh thành công![\s\S]*Revive Credit/
);

console.log(
  "PASS: frontend Daily Mission semantics are Revive Credit-only"
);
