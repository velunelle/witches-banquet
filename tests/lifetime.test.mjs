import test from "node:test";
import assert from "node:assert/strict";
import { createLifetime } from "../src/core/lifetime.js";
test("destroy removes event listeners and queued work", async () => {
  const life = createLifetime(),
    target = new EventTarget();
  let count = 0;
  life.listen(target, "bite", () => count++);
  life.delay(() => count++, 20);
  target.dispatchEvent(new Event("bite"));
  life.destroy();
  target.dispatchEvent(new Event("bite"));
  await new Promise((r) => setTimeout(r, 35));
  assert.equal(count, 1);
});
