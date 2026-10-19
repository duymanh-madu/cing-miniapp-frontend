import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const jsx = fs.readFileSync(
  path.join(root, "CingKdsProPage.jsx"),
  "utf8"
);
const css = fs.readFileSync(
  path.join(root, "CingKdsProPage.css"),
  "utf8"
);

test("Three operational modes exist", () => {
  for (const mode of [
    '"preparation"',
    '"serving"',
    '"monitor"'
  ]) {
    assert.ok(jsx.includes(mode));
  }
});

test("Preparation and serving remain distinct", () => {
  assert.match(jsx, /preparing.*prepared.*served/s);
  assert.match(jsx, /Đã trả khách/);
});

test("No direct network or financial mutation", () => {
  assert.doesNotMatch(jsx, /\bfetch\s*\(/);
  assert.doesNotMatch(jsx, /\baxios\b/);
  assert.doesNotMatch(jsx, /\bio\s*\(/);
  assert.doesNotMatch(jsx, /localStorage/);
});

test("No demo orders or random identifiers", () => {
  assert.doesNotMatch(jsx, /Math\.random/);
  assert.doesNotMatch(jsx, /mockOrders|demoOrders|fakeOrders/);
});

test("Mutations depend on authorized callback", () => {
  assert.match(jsx, /typeof onTransition === "function"/);
  assert.match(jsx, /busyCupIds\.includes/);
  assert.match(jsx, /connectionState === "online"/);
});

test("Tablet and mobile breakpoints exist", () => {
  assert.match(css, /max-width:\s*1000px/);
  assert.match(css, /max-width:\s*650px/);
});

test("KDS stylesheet is independently scoped", () => {
  assert.match(css, /\.ckds-root/);
  assert.doesNotMatch(css, /^\s*body\s*\{/m);
});
