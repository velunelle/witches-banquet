/** Network input checks are pure and shared by the receive path and tests. */
const id = (n) => Number.isInteger(n) && n >= 0 && n < 16;
export function validTaste(d, expected) {
  return (
    d &&
    id(d.id) &&
    Number.isInteger(d.k) &&
    d.k >= 0 &&
    d.k < 3 &&
    d.no === expected &&
    typeof d.ownHit === "boolean"
  );
}
export function validVerdict(d, expected) {
  return (
    d &&
    id(d.id) &&
    Number.isInteger(d.k) &&
    d.k >= 0 &&
    d.k < 3 &&
    d.no === expected &&
    typeof d.hit === "boolean"
  );
}
export function validStart(d, keys) {
  return (
    d &&
    [0, 1].includes(d.first) &&
    Number.isSafeInteger(d.sequence) &&
    d.sequence > 0 &&
    Array.isArray(d.names) &&
    d.names.length === 2 &&
    d.names.every((n) => typeof n === "string" && n.length <= 30) &&
    Array.isArray(d.dishKeys) &&
    d.dishKeys.length === 16 &&
    new Set(d.dishKeys).size === 16 &&
    d.dishKeys.every((k) => keys.has(k))
  );
}

export async function commitment(room, round, secret, salt) {
  const bytes = new TextEncoder().encode(`${room}:${round}:${secret}:${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
/** Verify the terminal result against both now-open commitments, including earlier bites. */
export function validFinishedRound(log, poisons, winner) {
  if (
    !Array.isArray(log) ||
    !log.length ||
    poisons.length !== 2 ||
    !poisons.every(id)
  )
    return false;
  const eaten = new Set();
  for (let i = 0; i < log.length; i++) {
    const l = log[i];
    if (
      !id(l.id) ||
      ![0, 1].includes(l.player) ||
      eaten.has(l.id) ||
      (i && l.player === log[i - 1].player) ||
      l.hit !== poisons.includes(l.id) ||
      l.hit !== (i === log.length - 1)
    )
      return false;
    eaten.add(l.id);
  }
  return winner === 1 - log.at(-1).player;
}
