import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs/promises";
const source = await fs.readFile(
  new URL("../src/opening/opening.js", import.meta.url),
  "utf8",
);
async function fixture() {
  const handlers = {},
    messages = [],
    timers = [],
    frames = [];
  const skip = {};
  const target = { closest: () => null };
  const document = {
    body: { classList: { add() {}, remove() {} }, style: {} },
    images: [],
    fonts: { ready: Promise.resolve() },
    getElementById: (id) => (id === "skip" ? skip : { append() {} }),
    querySelector: () => ({}),
    createElement: () => ({ style: {} }),
    addEventListener: (type, fn) => {
      handlers[type] = fn;
    },
  };
  vm.runInNewContext(source, {
    document,
    parent: { postMessage: (m) => messages.push(m) },
    location: { origin: "https://test" },
    performance: { now: () => 1000 },
    innerHeight: 800,
    matchMedia: () => ({ matches: true }),
    window: { addEventListener() {} },
    requestAnimationFrame: (fn) => {
      frames.push(fn);
      return frames.length;
    },
    cancelAnimationFrame() {},
    setTimeout: (fn) => {
      timers.push(fn);
      return timers.length;
    },
    clearTimeout() {},
  });
  frames[0]();
  await new Promise((r) => setImmediate(r));
  const fire = (type, data = {}) =>
    handlers[type]({
      target,
      preventDefault() {},
      pointerId: 1,
      pointerType: "touch",
      clientX: 100,
      clientY: 100,
      ...data,
    });
  return { messages, fire, skip, frames, timers };
}
test("touch: tap and horizontal motion do not exit; upward drag reports progress then exits once", async () => {
  const f = await fixture();
  assert.ok(f.messages.some((m) => m.type === "between:opening-ready"));
  assert.deepEqual(
    f.messages
      .filter((m) => m.type === "between:opening-loading")
      .map((m) => m.done),
    [1, 2, 3, 4],
  );
  f.fire("pointerdown");
  f.fire("pointerup");
  assert.equal(f.messages.at(-1).type, "between:opening-cancel");
  f.fire("pointerdown");
  f.fire("pointermove", { clientX: 180, clientY: 105 });
  f.fire("pointerup");
  assert.ok(!f.messages.some((m) => m.type === "between:opening-exit"));
  f.fire("pointerdown");
  f.fire("pointermove", { clientY: 220 });
  f.fire("pointerup");
  assert.ok(!f.messages.some((m) => m.type === "between:opening-exit"));
  f.fire("pointerdown");
  f.fire("pointermove", { clientY: -20 });
  f.frames.at(-1)();
  assert.ok(f.messages.at(-1).progress > 0);
  f.fire("pointerup");
  f.skip.onclick();
  assert.equal(
    f.messages.filter((m) => m.type === "between:opening-exit").length,
    1,
  );
});
test("short touch movement cancels; wheel and explicit button can enter", async () => {
  const f = await fixture();
  f.fire("pointerdown");
  f.fire("pointermove", { clientY: 85 });
  f.fire("pointerup");
  assert.equal(f.messages.at(-1).type, "between:opening-cancel");
  f.fire("wheel", { deltaX: 0, deltaY: 100, deltaMode: 0, ctrlKey: true });
  assert.ok(!f.messages.some((m) => m.type === "between:opening-exit"));
  f.fire("wheel", { deltaX: 0, deltaY: 100, deltaMode: 0 });
  f.timers.at(-1)();
  assert.equal(f.messages.at(-1).type, "between:opening-exit");
  const g = await fixture();
  g.skip.onclick();
  assert.equal(g.messages.at(-1).type, "between:opening-exit");
});
