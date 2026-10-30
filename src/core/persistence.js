import { SWEETS } from "../data/menu.js";
import { createRound, eat, next } from "./engine.js";
const KEYS = {
  db: "witch-halloween-v2",
  slots: "witch-manual-saves-v1",
  auto: "witch-auto-save-v1",
};
const modes = ["solo", "local", "online"],
  keySet = new Set(SWEETS.map((d) => d.key));
const clone = (value) => JSON.parse(JSON.stringify(value));
const integer = (n, max = Number.MAX_SAFE_INTEGER) =>
  Number.isSafeInteger(n) && n >= 0 && n <= max;
const text = (s, max = 2000) => typeof s === "string" && s.length <= max;
const pair = (v) => Array.isArray(v) && v.length === 2;
export const defaultDb = () => ({
  scores: { solo: [0, 0], local: [0, 0], online: [0, 0] },
  rounds: { solo: 0, local: 0, online: 0 },
  notes: [],
  names: ["小南瓜", "小月亮"],
});
function storage() {
  return globalThis.localStorage;
}
function read(key, fallback) {
  try {
    return JSON.parse(storage().getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  try {
    storage().setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
function validNote(n) {
  return (
    n &&
    text(n.theme, 30) &&
    integer(n.id, 31) &&
    integer(n.k, 2) &&
    text(n.label, 120) &&
    text(n.text) &&
    text(n.name, 30) &&
    (n.image == null ||
      (typeof n.image === "string" &&
        /^assets\/[\w/-]+\.(webp|png)$/.test(n.image))) &&
    (n.dishName == null || text(n.dishName, 80)) &&
    typeof n.hit === "boolean"
  );
}
function validDb(d) {
  return (
    d &&
    pair(d.names) &&
    d.names.every((n) => text(n, 30)) &&
    modes.every(
      (m) =>
        pair(d.scores?.[m]) &&
        d.scores[m].every((n) => integer(n)) &&
        integer(d.rounds?.[m]),
    ) &&
    Array.isArray(d.notes) &&
    d.notes.length <= 100 &&
    d.notes.every(validNote)
  );
}
export function normalizeDb(raw) {
  const d = defaultDb();
  if (!raw || typeof raw !== "object") return d;
  for (const m of modes) {
    if (pair(raw.scores?.[m]) && raw.scores[m].every((n) => integer(n)))
      d.scores[m] = [...raw.scores[m]];
    if (integer(raw.rounds?.[m])) d.rounds[m] = raw.rounds[m];
  }
  if (pair(raw.names) && raw.names.every((n) => text(n, 30)))
    d.names = raw.names.map((n) =>
      n === "月见女巫" ? "小月亮" : n || "小女巫",
    );
  if (Array.isArray(raw.notes))
    d.notes = raw.notes.filter(validNote).slice(0, 100);
  return d;
}
export function loadDb() {
  return normalizeDb(read(KEYS.db, null) || read("witch-banquet-v1", null));
}
export const persistDb = (d) => write(KEYS.db, d);
export function snapshot(s) {
  if (s.mode === "online") return null;
  return clone({
    version: 1,
    at: Date.now(),
    mode: s.mode,
    db: s.db,
    themeKeys: s.theme.dishes.map((d) => d.key),
    phase: s.phase,
    r: s.r,
    log: s.r ? s.log : [],
    taste: s.taste,
    scored: s.scored,
  });
}
export function validSnap(v) {
  if (
    !v ||
    v.version !== 1 ||
    !["solo", "local"].includes(v.mode) ||
    !integer(v.at) ||
    !validDb(v.db) ||
    !Array.isArray(v.themeKeys) ||
    v.themeKeys.length !== 16 ||
    new Set(v.themeKeys).size !== 16 ||
    !v.themeKeys.every((k) => keySet.has(k)) ||
    !Array.isArray(v.log) ||
    v.log.length > 16
  )
    return false;
  if (v.r === null)
    return v.log.every(
      (l) =>
        l &&
        integer(l.id, 15) &&
        integer(l.k, 2) &&
        [0, 1].includes(l.player) &&
        typeof l.hit === "boolean",
    );
  const r = v.r;
  if (
    !r ||
    r.count !== 16 ||
    !pair(r.poison) ||
    !r.poison.every((n) => integer(n, 15)) ||
    ![0, 1].includes(r.turn) ||
    !pair(r.eaten) ||
    !r.eaten.every(Array.isArray) ||
    new Set(r.eaten.flat()).size !== r.eaten.flat().length ||
    !r.eaten.flat().every((n) => integer(n, 15)) ||
    typeof r.over !== "boolean"
  )
    return false;
  if (
    !v.log.every(
      (l) =>
        l &&
        integer(l.id, 15) &&
        integer(l.k, 2) &&
        [0, 1].includes(l.player) &&
        typeof l.hit === "boolean",
    )
  )
    return false;
  const replay = createRound(r.poison, v.log[0]?.player ?? r.turn);
  for (let i = 0; i < v.log.length; i++) {
    const l = v.log[i],
      result = eat(replay, l.player, l.id);
    if (!result.ok || result.poisoned !== l.hit) return false;
    if (i < v.log.length - 1) next(replay);
  }
  if (
    JSON.stringify(replay.eaten) !== JSON.stringify(r.eaten) ||
    replay.over !== r.over ||
    replay.winner !== r.winner
  )
    return false;
  const last = v.log.at(-1);
  if (r.over) return r.turn === last?.player;
  const turn = last
    ? v.taste?.resolved
      ? last.player
      : 1 - last.player
    : r.turn;
  return r.turn === turn;
}
export function readSlots() {
  const raw = read(KEYS.slots, []);
  return Array.from({ length: 3 }, (_, i) =>
    validSnap(raw?.[i]) ? raw[i] : null,
  );
}
export const writeSlots = (v) => write(KEYS.slots, v);
export function readAuto() {
  const v = read(KEYS.auto, null);
  return validSnap(v) ? v : null;
}
export const writeAuto = (v) => write(KEYS.auto, v);
export function removeAuto() {
  try {
    storage().removeItem(KEYS.auto);
    return true;
  } catch {
    return false;
  }
}
export function exportBackup(s) {
  return {
    format: "witch-supper-backup",
    version: 1,
    slots: readSlots(),
    auto: readAuto(),
    current: snapshot(s),
  };
}
export function parseBackup(source) {
  const v = JSON.parse(source);
  if (
    v.format !== "witch-supper-backup" ||
    v.version !== 1 ||
    !Array.isArray(v.slots) ||
    v.slots.length !== 3 ||
    !v.slots.every((s) => s === null || validSnap(s)) ||
    (v.auto != null && !validSnap(v.auto)) ||
    (v.current != null && !validSnap(v.current))
  )
    throw new Error("Invalid backup");
  return clone(v);
}
export function importBackup(v) {
  const before = readSlots(),
    auto = readAuto();
  if (!writeSlots(v.slots)) return false;
  const ok =
    v.auto || v.current ? writeAuto(v.auto || v.current) : removeAuto();
  if (!ok) {
    writeSlots(before);
    auto ? writeAuto(auto) : removeAuto();
  }
  return ok;
}
