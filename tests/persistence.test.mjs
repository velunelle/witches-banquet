import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultDb,
  normalizeDb,
  snapshot,
  validSnap,
  readSlots,
  writeSlots,
  writeAuto,
  readAuto,
  parseBackup,
  importBackup,
} from "../src/core/persistence.js";
import { MENU } from "../src/data/menu.js";
import { createRound, eat, next } from "../src/core/engine.js";
const map = new Map();
globalThis.localStorage = {
  getItem: (k) => map.get(k) ?? null,
  setItem: (k, v) => map.set(k, v),
  removeItem: (k) => map.delete(k),
};
function fixture() {
  return {
    mode: "local",
    db: defaultDb(),
    theme: MENU[0],
    phase: "dine",
    r: createRound([14, 15]),
    log: [],
    taste: null,
    scored: false,
  };
}
test("snapshot is independent of live state", () => {
  const s = fixture(),
    v = snapshot(s);
  s.r.eaten[0].push(2);
  s.db.scores.local[0]++;
  assert.deepEqual(v.r.eaten, [[], []]);
  assert.equal(v.db.scores.local[0], 0);
});
test("valid saves before and after a safe bite and advance", () => {
  const s = fixture();
  assert.ok(validSnap(snapshot(s)));
  eat(s.r, 0, 3);
  s.log.push({ id: 3, k: 0, player: 0, hit: false });
  s.taste = { id: 3, player: 0, resolved: true };
  assert.ok(validSnap(snapshot(s)));
  next(s.r);
  s.taste = null;
  assert.ok(validSnap(snapshot(s)));
});
test("ended save stays ended and keeps one point", () => {
  const s = fixture();
  eat(s.r, 0, 14);
  s.log.push({ id: 14, k: 0, player: 0, hit: true });
  s.db.scores.local[1] = 1;
  s.db.rounds.local = 1;
  s.scored = true;
  s.phase = "end";
  assert.ok(validSnap(snapshot(s)));
  assert.equal(
    parseBackup(
      JSON.stringify({
        format: "witch-supper-backup",
        version: 1,
        slots: [snapshot(s), null, null],
        auto: null,
        current: null,
      }),
    ).slots[0].db.scores.local[1],
    1,
  );
});
test("reject contradictory eaten dishes and winner", () => {
  const v = snapshot(fixture());
  v.r.eaten[0] = [1];
  assert.equal(validSnap(v), false);
  v.r.eaten = [[], []];
  v.r.winner = 0;
  assert.equal(validSnap(v), false);
});
test("reject forged notes and executable image attributes", () => {
  const v = snapshot(fixture());
  v.db.notes = [
    {
      theme: "sweet",
      id: 0,
      k: 0,
      label: "a",
      text: "a",
      name: "a",
      hit: false,
      image: 'x" onerror="alert(1)',
    },
  ];
  assert.equal(validSnap(v), false);
});
test("normalizes incomplete legacy db without losing valid scores", () => {
  const d = normalizeDb({
    scores: { local: [3, 2] },
    names: ["a", "月见女巫"],
  });
  assert.deepEqual(d.scores.local, [3, 2]);
  assert.equal(d.names[1], "小月亮");
  assert.deepEqual(d.scores.solo, [0, 0]);
});
test("manual saves always have three validated slots; auto uses same validation", () => {
  map.clear();
  writeSlots([snapshot(fixture())]);
  assert.equal(readSlots().length, 3);
  assert.equal(readSlots()[1], null);
  writeAuto(snapshot(fixture()));
  assert.ok(readAuto());
  map.set("witch-auto-save-v1", '{"broken":true}');
  assert.equal(readAuto(), null);
});
test("invalid backups cannot reach import", () => {
  assert.throws(() => parseBackup("{bad"));
  assert.throws(() =>
    parseBackup(
      JSON.stringify({ format: "witch-supper-backup", version: 9, slots: [] }),
    ),
  );
});
test("import replaces slots without stale automatic save", () => {
  map.clear();
  writeAuto(snapshot(fixture()));
  assert.equal(
    importBackup({ slots: [null, null, null], auto: null, current: null }),
    true,
  );
  assert.equal(readAuto(), null);
});
test("online secrets never become local save", () => {
  const s = fixture();
  s.mode = "online";
  assert.equal(snapshot(s), null);
});
test("legacy home snapshots may retain an old log without exposing an active round", () => {
  const v = snapshot(fixture());
  v.r = null;
  v.phase = "home";
  v.log = [{ id: 3, k: 0, player: 0, hit: false }];
  assert.ok(validSnap(v));
});
