import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { createNetwork } from "../src/features/network.js";
import { createReliableLink } from "../src/core/reliable-link.js";
import { defaultDb } from "../src/core/persistence.js";
import { commitment, validFinishedRound } from "../src/core/protocol.js";
import * as E from "../src/core/engine.js";
import { MENU } from "../src/data/menu.js";
const waitFor = async (condition) => {
  const deadline = Date.now() + 2000;
  while (!condition()) {
    if (Date.now() >= deadline) throw Error("Network fixture did not settle");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
};
const flush = async () => {
  for (let i = 0; i < 25; i++) await new Promise((r) => setImmediate(r));
};
globalThis.window = new EventTarget();
globalThis.document = Object.assign(new EventTarget(), {
  hidden: false,
  getElementById: () => null,
  body: { classList: { remove() {}, add() {} }, append() {} },
  createElement: () => ({
    setAttribute() {},
    querySelector: () => ({ textContent: "" }),
    remove() {},
  }),
});

function transport() {
  const peers = new Map(),
    packets = [];
  let next = 0,
    offline = false,
    drop = () => false;
  class Connection extends EventEmitter {
    constructor(peer) {
      super();
      this.peer = peer;
      this.open = false;
    }
    send(d) {
      if (!this.open) throw Error("closed");
      packets.push(structuredClone(d));
      if (offline || drop(d)) return;
      const copy = structuredClone(d);
      queueMicrotask(() => {
        if (this.other.open) this.other.emit("data", copy);
      });
    }
    close() {
      if (!this.open) return;
      this.open = false;
      this.emit("close");
      if (this.other.open) {
        this.other.open = false;
        this.other.emit("close");
      }
    }
  }
  class Peer extends EventEmitter {
    constructor(id) {
      super();
      this.id = id || `guest-${++next}`;
      this.destroyed = false;
      this.disconnected = false;
      peers.set(this.id, this);
      queueMicrotask(() => this.emit("open", this.id));
    }
    connect(id) {
      const c = new Connection(id),
        other = new Connection(this.id);
      c.other = other;
      other.other = c;
      queueMicrotask(() => {
        if (offline || !peers.has(id)) {
          c.emit("close");
          return;
        }
        peers.get(id).emit("connection", other);
        c.open = other.open = true;
        other.emit("open");
        c.emit("open");
      });
      return c;
    }
    reconnect() {
      this.disconnected = false;
      queueMicrotask(() => this.emit("open", this.id));
    }
    destroy() {
      this.destroyed = true;
      peers.delete(this.id);
    }
  }
  return {
    Peer,
    packets,
    setOffline(v) {
      offline = v;
    },
    dropOnce(type) {
      let dropped = false;
      drop = (d) => {
        if (!dropped && d.kind === "event" && d.value.type === type) {
          dropped = true;
          return true;
        }
        return false;
      };
    },
  };
}
function client(bus) {
  const game = {
    db: defaultDb(),
    network: { generation: 0 },
    theme: MENU[0],
    epoch: 0,
    mode: "online",
    phase: "home",
    log: [],
    r: null,
  };
  const actions = {
    home() {},
    board() {
      game.phase = "dine";
    },
    pick() {
      game.phase = "pick";
    },
    handoff() {
      game.phase = "handoff";
    },
    transition(_s, fn) {
      fn();
    },
    phaseTo(p) {
      game.phase = p;
    },
    recordTaste(id, k, player, hit) {
      game.log.push({ id, k, player, hit });
    },
    showFeedback(id, k, player, hit) {
      game.taste = { id, k, player, resolved: true, hit };
    },
    doAdvance() {
      game.taste = null;
      game.phase = game.r.over ? "end" : "dine";
      E.next(game.r);
    },
    ending() {
      game.phase = "end";
    },
    reaction() {},
    awardRound() {
      if (!game.scored && game.network.verified) {
        game.scored = true;
        game.db.scores.online[game.r.winner]++;
        game.network.sessionScores[game.r.winner]++;
        game.db.rounds.online++;
      }
    },
  };
  const ui = {
    openModal() {},
    closeModal() {},
    toast() {},
    on() {},
    app: { innerHTML: "" },
  };
  return {
    game,
    network: createNetwork({ ui, actions, game, PeerClass: bus.Peer }),
    actions,
  };
}
async function pair() {
  const bus = transport(),
    a = client(bus),
    b = client(bus);
  a.network.joinRoom({ host: true, code: "ABC234", name: "a" });
  await flush();
  b.network.joinRoom({ host: false, code: "ABC234", name: "b" });
  await flush();
  return { bus, a, b };
}
async function taste(c, id, k = 0) {
  c.game.taste = { id, k, player: c.game.r.turn, resolved: true };
  c.network.send({
    type: "taste",
    id,
    k,
    no: c.game.log.length,
    ownHit: id === c.game.network.mySecret,
  });
  await flush();
}

test("two clients: secret commitments, interrupted verdict/reveal, same turn and one score after replay", async () => {
  const { bus, a, b } = await pair();
  try {
    assert.ok(a.game.network.netConnected && b.game.network.netConnected);
    a.network.onlineStart();
    await flush();
    await Promise.all([a.network.sealOnline(0), b.network.sealOnline(1)]);
    await flush();
    assert.equal(a.game.phase, "dine");
    assert.equal(b.game.phase, "dine");
    for (const p of bus.packets.filter((p) => p.kind === "event"))
      assert.equal("secret" in p.value, false);
    assert.equal(a.game.r.poison[1], null);
    assert.equal(b.game.r.poison[0], null);
    bus.dropOnce("verdict");
    await taste(a, 2);
    assert.equal(a.game.log.length, 0);
    assert.equal(b.game.log.length, 1);
    bus.setOffline(true);
    a.game.network.conn.close();
    await flush();
    assert.equal(a.game.network.netConnected, false);
    bus.setOffline(false);
    globalThis.window.dispatchEvent(new Event("online"));
    await flush();
    assert.ok(a.game.network.netConnected && b.game.network.netConnected);
    assert.equal(a.game.log.length, 1);
    assert.deepEqual(a.game.log, b.game.log);
    a.network.send({ type: "advance", no: 1 });
    a.actions.doAdvance();
    await flush();
    assert.equal(a.game.r.turn, 1);
    assert.equal(b.game.r.turn, 1);
    bus.dropOnce("reveal");
    await taste(b, 0); // guest eats host poison
    assert.equal(b.game.network.verified, false);
    assert.equal(b.game.db.rounds.online, 0);
    bus.setOffline(true);
    b.game.network.conn.close();
    await flush();
    bus.setOffline(false);
    globalThis.window.dispatchEvent(new Event("online"));
    await flush();
    await waitFor(() => a.game.network.verified && b.game.network.verified);
    for (const c of [a, b]) {
      assert.equal(c.game.network.verified, true);
      assert.deepEqual(c.game.r.poison, [0, 1]);
      assert.equal(c.game.r.winner, 0);
      assert.deepEqual(c.game.network.sessionScores, [1, 0]);
      assert.equal(c.game.db.rounds.online, 1);
    }
    assert.deepEqual(a.game.log, b.game.log);
    // Replayed final events cannot award a second point or reset a round.
    b.network.send({ type: "reveal", secret: 1, salt: b.game.network.mySalt });
    await flush();
    assert.equal(a.game.db.rounds.online, 1);
    b.network.send({ type: "advance", no: 2 });
    b.actions.doAdvance();
    await flush();
    assert.equal(a.game.phase, "end");
    assert.equal(b.game.phase, "end");
    a.network.onlineStart();
    await flush();
    assert.equal(a.game.r.turn, 1);
    assert.equal(b.game.r.turn, 1);
  } finally {
    a.network.destroy();
    b.network.destroy();
  }
});
test("overlapping poison and reconnect while selecting preserve both private secrets", async () => {
  const { bus, a, b } = await pair();
  try {
    a.network.onlineStart();
    await flush();
    await a.network.sealOnline(4);
    await flush();
    bus.setOffline(true);
    a.game.network.conn.close();
    await flush();
    bus.setOffline(false);
    globalThis.window.dispatchEvent(new Event("online"));
    await flush();
    assert.equal(a.game.network.mySecret, 4);
    assert.equal(b.game.network.mySecret, null);
    await b.network.sealOnline(4);
    await flush();
    await taste(a, 4);
    await waitFor(() => a.game.network.verified && b.game.network.verified);
    assert.deepEqual(a.game.r.poison, [4, 4]);
    assert.deepEqual(b.game.r.poison, [4, 4]);
    assert.deepEqual(a.game.network.sessionScores, [0, 1]);
    assert.deepEqual(b.game.network.sessionScores, [0, 1]);
  } finally {
    a.network.destroy();
    b.network.destroy();
  }
});
test("ordered journal buffers out of order, ignores duplicates and binds session", async () => {
  const applied = [],
    writes = [];
  const link = createReliableLink({
    session: "s",
    apply: async (d) => applied.push(d),
    write: (d) => writes.push(d),
  });
  const packet = (seq, value) => ({
    protocol: 3,
    session: "s",
    kind: "event",
    seq,
    value,
  });
  link.receive(packet(2, "b"));
  link.receive({ ...packet(1, "wrong"), session: "other" });
  await flush();
  assert.deepEqual(applied, []);
  link.receive(packet(1, "a"));
  await flush();
  link.receive(packet(1, "a"));
  await flush();
  assert.deepEqual(applied, ["a", "b"]);
  link.send({ type: "commit", hash: "h" });
  link.receive({ protocol: 3, session: "s", kind: "ack", ack: 100 });
  assert.equal(link.pending, 1);
  link.receive({ protocol: 3, session: "s", kind: "ack", ack: 1 });
  assert.equal(link.pending, 0);
  link.destroy();
});
test("commitment is bound to room/round and terminal replay rejects contradictory hits", async () => {
  const h = await commitment("ABC234", 1, 3, "salt");
  assert.notEqual(h, await commitment("ABC234", 2, 3, "salt"));
  assert.equal(
    validFinishedRound(
      [
        { id: 2, player: 0, hit: false },
        { id: 3, player: 1, hit: true },
      ],
      [3, 4],
      0,
    ),
    true,
  );
  assert.equal(
    validFinishedRound(
      [
        { id: 4, player: 0, hit: false },
        { id: 3, player: 1, hit: true },
      ],
      [3, 4],
      0,
    ),
    false,
  );
});
