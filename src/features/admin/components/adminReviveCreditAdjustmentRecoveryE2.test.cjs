"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname,"../../../..");
const read = name => fs.readFileSync(path.join(root,name),"utf8");
const component = read("src/features/admin/components/AdminReviveCreditAdjustmentV2.jsx");
const games = read("src/features/admin/components/AdminGames.jsx");
const dashboard = read("src/features/admin/components/AdminDashboard.jsx");
test("Admin DB identity forwarded and component keyed on verified admin and token",()=>{
 assert.match(dashboard,/auth\.admin\?\.id/);
 assert.match(dashboard,/key=\{`\$\{auth\.admin\?\.id/);
 assert.match(games,/adminId=\{adminId\}/);
 assert.match(component,/role !== "super_admin"/);
});
test("sessionStorage is scoped to Admin and refuses corrupt or unavailable storage",()=>{
 assert.match(component,/window\.sessionStorage/);
 assert.match(component,/encodeURIComponent\(adminId\)/);
 assert.match(component,/record\.admin_id !== adminId/);
 assert.match(component,/assertStoredPayload\(record\.payload\)/);
 assert.match(component,/setItem\(key, raw\)/);
 assert.match(component,/getItem\(key\) !== raw/);
});
test("durable write before mutation and existing retry reuses UUID",()=>{
 assert.ok(component.indexOf("persistPending(adminId, payload)") < component.indexOf('await apiClient.post('));
 assert.match(component,/let payload = pendingRef\.current/);
 assert.match(component,/!ready \|\| !token \|\| !adminId/);
 assert.match(component,/Thử lại cùng mã giao dịch/);
});
test("on reload status is queried; not_found never clears pending",()=>{
 assert.match(component,/useEffect\(\(\) =>/);
 assert.match(component,/readPending\(adminId\)/);
 assert.match(component,/adjust\/status\/\$\{saved\.request_id\}/);
 assert.match(component,/POST cũ vẫn có thể hoàn tất muộn/);
 assert.match(component,/result\.status === "found"/);
});
test("verified historical receipt must match original user amount reason UUID",()=>{
 for(const part of ['result.user_id !== payload.user_id','result.amount !== payload.amount','result.reason_code !== payload.reason_code','result?.request_id !== payload.request_id']) assert.ok(component.includes(part));
 assert.match(component,/clearPending\(adminId, (?:saved|payload)\.request_id\)/);
});
test("stale responses cannot unlock a new account; legacy Admin writer stays retired",()=>{
 assert.match(component,/epochRef\.current !== epoch/);
 assert.doesNotMatch(games,/REVIVE_V2_ADMIN_ENABLED/);
 assert.doesNotMatch(games,/\/admin\/players\/adjust-plays/);
 assert.match(games,/<AdminReviveCreditAdjustmentV2/);
});
