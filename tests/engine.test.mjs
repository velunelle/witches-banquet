import test from "node:test";
import assert from "node:assert/strict";
import {
  createRound,
  eat,
  next,
  chooseDish,
  randomIndex,
} from "../src/core/engine.js";
test("different poisons both end the round; only the first bite is accepted", () => {
  for (const id of [3, 9]) {
    const r = createRound([3, 9]);
    assert.equal(eat(r, 0, id).poisoned, true);
    assert.equal(r.winner, 1);
    assert.equal(eat(r, 0, 2).ok, false);
  }
});
test("identical poison remains one dangerous dish", () => {
  const r = createRound([7, 7]);
  for (let i = 0; i < 7; i++) {
    assert.equal(eat(r, r.turn, i).poisoned, false);
    next(r);
  }
  assert.equal(eat(r, r.turn, 7).poisoned, true);
  assert.equal(r.eaten.flat().length, 8);
});
test("repeated dish and wrong turn cannot mutate state", () => {
  const r = createRound([14, 15]);
  assert.equal(eat(r, 1, 1).ok, false);
  eat(r, 0, 1);
  next(r);
  const before = structuredClone(r);
  assert.equal(eat(r, 1, 1).ok, false);
  assert.equal(eat(r, 2, 3).ok, false);
  assert.equal(eat(r, 1, -1).ok, false);
  assert.deepEqual(r, before);
});
test("computer only knows its poison; every remaining legal dish is reachable", () => {
  const result = new Set();
  for (let i = 0; i < 13; i++) result.add(chooseDish(4, [0, 1], 16, () => i));
  assert.equal(result.size, 13);
  for (const bad of [0, 1, 4]) assert.equal(result.has(bad), false);
});
test("computer finishes even when only its own poison remains", () =>
  assert.equal(
    chooseDish(
      4,
      Array.from({ length: 16 }, (_, i) => i).filter((i) => i !== 4),
    ),
    4,
  ));
test("crypto random validates ranges and stays in range", () => {
  assert.throws(() => randomIndex(0));
  assert.throws(() => randomIndex(2.5));
  for (let i = 0; i < 100; i++) assert.ok(randomIndex(16) < 16);
});
