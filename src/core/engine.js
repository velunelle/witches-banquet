/** Pure rules. The chooser receives only its own poison and already eaten dishes. */
export function randomIndex(n) {
  if (!Number.isInteger(n) || n < 1 || n > 0x100000000)
    throw new RangeError("Invalid random range");
  const x = new Uint32Array(1),
    limit = 0x100000000 - (0x100000000 % n);
  do {
    crypto.getRandomValues(x);
  } while (x[0] >= limit);
  return x[0] % n;
}
export function chooseDish(ownPoison, eaten, count = 16, rng = randomIndex) {
  let choices = Array.from({ length: count }, (_, i) => i).filter(
    (i) => !eaten.includes(i) && i !== ownPoison,
  );
  if (!choices.length)
    choices = Array.from({ length: count }, (_, i) => i).filter(
      (i) => !eaten.includes(i),
    );
  return choices.length ? choices[rng(choices.length)] : null;
}
export function createRound(poison, first = 0, count = 16) {
  return {
    poison: [...poison],
    turn: first,
    eaten: [[], []],
    over: false,
    winner: null,
    count,
  };
}
export function eat(r, player, id) {
  if (
    !r ||
    r.over ||
    ![0, 1].includes(player) ||
    r.turn !== player ||
    !Number.isInteger(id) ||
    id < 0 ||
    id >= r.count ||
    r.eaten.flat().includes(id)
  )
    return { ok: false };
  r.eaten[player].push(id);
  const poisoned = r.poison.includes(id);
  if (poisoned) {
    r.over = true;
    r.winner = 1 - player;
  }
  return { ok: true, poisoned, winner: r.winner };
}
export function next(r) {
  if (!r.over) r.turn = 1 - r.turn;
  return r.turn;
}
