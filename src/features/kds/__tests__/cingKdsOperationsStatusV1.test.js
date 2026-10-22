import test from "node:test";
import assert from "node:assert/strict";
import {kdsOperationsStatusV1} from "../cingKdsOperationsStatusV1.js";
import fs from "node:fs";
test("only explicit unopened gates are informational; auth/network failures remain errors",()=>{
  assert.equal(kdsOperationsStatusV1("KDS_OPS_READ_DISABLED").hold,true);
  assert.equal(kdsOperationsStatusV1("KDS_OPS_POLICY_REQUIRED").hold,true);
  for(const code of ["KDS_OPS_UNAVAILABLE","KDS_OPS_FORBIDDEN","KDS_OPS_UNAUTHORIZED","UNKNOWN"])
    assert.equal(kdsOperationsStatusV1(code).hold,false);
});
test("unavailable snapshot never displays zero counts; background loading preserves rows but blocks actions",()=>{
  const page=fs.readFileSync(new URL("../CingKdsProPage.jsx",import.meta.url),"utf8");
  assert.ok(page.includes('ready ? preparation.length : "—"'));
  assert.ok(page.includes('(!loading || snapshotReady)'));
  assert.ok(page.includes('ready &&\n    !loading &&'));
  const container=fs.readFileSync(new URL("../CingKdsOperationsContainerV1.jsx",import.meta.url),"utf8");
  assert.ok(container.includes('notice &&'));
  assert.ok(container.includes('sessionState.error &&'));
  assert.ok(container.includes('snapshotReady={Boolean(snapshot)}'));
});
