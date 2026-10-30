import test from "node:test";
import assert from "node:assert/strict";
import { validTaste, validVerdict, validStart } from "../src/core/protocol.js";
import { SWEETS } from "../src/data/menu.js";
test("malformed packets cannot advance or index outside the table", () => {
  assert.equal(validTaste({ id: 99, k: 0, no: 0, ownHit: false }, 0), false);
  assert.equal(validTaste({ id: 1, k: 3, no: 0, ownHit: false }, 0), false);
  assert.equal(validVerdict({ id: 1, k: 0, no: 1, hit: false }, 0), false);
  assert.equal(validVerdict({ id: 1, k: 0, no: 0, hit: "false" }, 0), false);
});
test("valid packets preserve explicit false verdict", () => {
  assert.ok(validTaste({ id: 1, k: 0, no: 0, ownHit: false }, 0));
  assert.ok(validVerdict({ id: 1, k: 0, no: 0, hit: false }, 0));
});
test("online table rejects duplicates and unknown dishes", () => {
  const d = {
      first: 0,
      sequence: 1,
      names: ["a", "b"],
      dishKeys: SWEETS.slice(0, 16).map((d) => d.key),
    },
    keys = new Set(SWEETS.map((d) => d.key));
  assert.ok(validStart(d, keys));
  d.dishKeys[1] = d.dishKeys[0];
  assert.equal(validStart(d, keys), false);
});
