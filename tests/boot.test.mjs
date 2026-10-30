import test from "node:test";
import assert from "node:assert/strict";
import { createMotion } from "../src/ui/motion.js";
function setup(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const originals = new Map();
  const register = (key, value) => {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  };
  const nodes = new Map();
  class Element extends EventTarget {
    constructor() {
      super();
      this.style = { setProperty() {}, removeProperty() {} };
      const classes = new Set();
      this.classList = { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c), toggle() {} };
      this.dataset = {};
      this.contentWindow = { postMessage() {} };
    }
    append(node) { if (node.id) nodes.set(`#${node.id}`, node); }
    prepend() {}
    remove() { nodes.delete(`#${this.id}`); }
    setAttribute() {}
    replaceChildren() {}
    querySelectorAll() { return []; }
  }
  const doc = new EventTarget();
  for (const id of ["app", "bootLoader", "bootCount", "bootContinue", "bootMessage", "sceneTransition"])
    nodes.set(`#${id}`, new Element());
  nodes.set("footer", new Element());
  doc.body = new Element();
  doc.documentElement = new Element();
  doc.createElement = () => new Element();
  doc.querySelector = (selector) => nodes.get(selector) || null;
  doc.querySelectorAll = () => [];
  const win = new EventTarget();
  win.scrollTo = () => {};
  register("window", win);
  register("document", doc);
  register("location", { origin: "https://example.test" });
  register("innerHeight", 800);
  register("matchMedia", () => ({ matches: false }));
  register("requestAnimationFrame", () => 1);
  register("cancelAnimationFrame", () => {});
  register("MutationObserver", class { observe() {} disconnect() {} });
  const fx = createMotion();
  t.after(() => {
    fx.destroy();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { nodes, doc, win };
}
test("opening timeout offers an explicit exit and never silently removes the opening", (t) => {
  const { nodes, doc } = setup(t);
  t.mock.timers.tick(15000);
  assert.ok(nodes.has("#openingFrame"));
  assert.ok(doc.documentElement.classList.contains("opening-boot"));
  assert.equal(nodes.get("#bootContinue").hidden, false);
  nodes.get("#bootContinue").dispatchEvent(new Event("click"));
  assert.equal(nodes.has("#openingFrame"), false);
  assert.equal(doc.documentElement.classList.contains("opening-boot"), false);
});
test("ready opening cancels the watchdog and waits for user input", (t) => {
  const { nodes, doc, win } = setup(t);
  const event = Object.assign(new Event("message"), {
    source: nodes.get("#openingFrame").contentWindow,
    origin: "https://example.test",
    data: { type: "between:opening-ready" },
  });
  win.dispatchEvent(event);
  t.mock.timers.tick(16000);
  assert.ok(nodes.has("#openingFrame"));
  assert.equal(nodes.get("#bootContinue").hidden, true);
  assert.equal(doc.documentElement.classList.contains("opening-boot"), false);
});
