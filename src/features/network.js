import {
  validStart,
  validTaste,
  validVerdict,
  commitment,
  validFinishedRound,
} from "../core/protocol.js";
import { createReliableLink } from "../core/reliable-link.js";
import { createLifetime } from "../core/lifetime.js";
import { state as defaultState } from "../core/state.js";
import * as E from "../core/engine.js";
import { MENU, SWEETS, makeSweetTable } from "../data/menu.js";
import { $, esc, avatar, sticker } from "../ui/helpers.js";
const RECOVERY_MS = 90000;
export function createNetwork({
  ui,
  actions,
  game = defaultState,
  PeerClass = globalThis.Peer,
}) {
  const state = game,
    net = state.network;
  const { openModal, closeModal, toast, on, app } = ui;
  const {
    home,
    board,
    pick,
    handoff,
    transition,
    phaseTo,
    recordTaste,
    showFeedback,
    doAdvance,
    ending,
    reaction,
    awardRound,
  } = actions;
  const lifetime = createLifetime();
  let link = null,
    remotePeer = null,
    session = null,
    joinName = "",
    lastSeen = 0;
  let recoveryAt = 0,
    heartbeat = null,
    pendingConn = null,
    sealed = false;
  const candidates = new Set(),
    candidateTimers = new Set();
  function banner(message) {
    let el = $("connectionBanner");
    if (!message) {
      el?.remove();
      document.body.classList.remove("network-paused");
      return;
    }
    document.body.classList.add("network-paused");
    if (!el) {
      el = document.createElement("aside");
      el.id = "connectionBanner";
      el.setAttribute("role", "status");
      el.innerHTML =
        '<p></p><button id="retryConnection">再连一下</button><button id="leaveConnection">回到请柬</button>';
      document.body.append(el);
      on("retryConnection", () => {
        recoveryAt = Date.now();
        tryReconnect();
      });
      on("leaveConnection", home);
    }
    el.querySelector("p").textContent = message;
  }
  function resetNet() {
    net.generation++;
    clearTimeout(net.joinTimer);
    for (const timer of candidateTimers) clearTimeout(timer);
    candidateTimers.clear();
    clearInterval(heartbeat);
    heartbeat = null;
    for (const c of new Set([net.conn, pendingConn, ...candidates])) {
      try {
        c?.removeAllListeners?.();
        c?.close();
      } catch {}
    }
    candidates.clear();
    pendingConn = null;
    try {
      net.peer?.removeAllListeners?.();
      net.peer?.destroy();
    } catch {}
    link?.destroy();
    link = null;
    session = null;
    remotePeer = null;
    sealed = false;
    recoveryAt = 0;
    Object.assign(net, {
      peer: null,
      conn: null,
      netConnected: false,
      netNames: null,
      onlineStarted: false,
      myCommit: null,
      theirCommit: null,
      mySecret: null,
      mySalt: null,
      netSeq: 0,
      verified: false,
      revealValid: false,
      theirReady: false,
      sessionScores: [0, 0],
    });
    banner(null);
  }
  function raw(packet, c = net.conn) {
    try {
      if (c?.open) {
        c.send(packet);
        return true;
      }
    } catch {}
    return false;
  }
  function initLink() {
    const generation = net.generation;
    link = createReliableLink({
      session,
      apply: async (d) => {
        if (generation === net.generation) await handleNetwork(d);
      },
      write: (packet) => raw(packet),
      onFault: () => pause("同步暂时停住了，正在尝试接回餐桌。"),
    });
  }
  function send(value) {
    return link?.send({ ...value, round: net.netSeq }) || false;
  }
  function networkMenu() {
    openModal(
      `<span class="eyebrow">AN EMPTY CHAIR IS WAITING</span><h2>给对桌点一盏灯</h2><p>把六码口令交给朋友，各自在自己的设备上藏好秘密。短暂切屏或网络波动后，会尝试在 90 秒内接回原回合；请保留网页，刷新无法恢复房间。</p><div class="network-form"><label>你在今晚的名字<input id="onlineName" maxlength="12" value="${esc(state.db.names[0])}" aria-label="联机名字"></label><button id="createRoom" class="btn-purple">创建秘密餐桌</button><label>已有口令<input id="roomInput" maxlength="6" placeholder="输入六码房间口令" aria-label="房间口令"></label><button id="joinRoom" class="btn-gold">加入对桌的晚餐</button><p class="network-error" id="networkError"></p></div>`,
    );
    on("createRoom", () => connectRoom(true));
    on("joinRoom", () => connectRoom(false));
  }
  function connectionError(message) {
    clearTimeout(net.joinTimer);
    if ($("networkError")) $("networkError").textContent = message;
    if ($("roomStatus")) $("roomStatus").textContent = message;
    toast(message);
  }
  function connectRoom(host) {
    const code = host
      ? Array.from(
          { length: 6 },
          () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[E.randomIndex(32)],
        ).join("")
      : $("roomInput").value.trim().toUpperCase();
    joinRoom({ host, code, name: $("onlineName").value.trim() || "小女巫" });
  }
  function joinRoom({ host, code, name }) {
    if (typeof PeerClass !== "function")
      return connectionError("连接库没有加载成功，请联网后重新打开页面。");
    if (!/^[A-Z2-9]{6}$/.test(code))
      return connectionError("口令是六位字母或数字，请再看一眼。");
    if (!crypto.subtle)
      return connectionError("秘密封存需要 HTTPS，请使用在线试玩地址。");
    resetNet();
    state.mode = "online";
    net.netSlot = host ? 0 : 1;
    net.roomCode = code;
    joinName = name.slice(0, 12);
    net.netNames = host ? [joinName, "还没入席"] : ["等房主", joinName];
    if (!host) {
      session = crypto.randomUUID();
      initLink();
    }
    if ($("networkError")) $("networkError").textContent = "正在点亮餐桌…";
    const generation = net.generation;
    net.peer = new PeerClass(host ? "witch-supper-" + code : undefined, {
      debug: 0,
    });
    net.joinTimer = setTimeout(
      () =>
        connectionError(
          "暂时没连上。请检查网络和口令；部分网络不能直连，可换网络重试。",
        ),
      16000,
    );
    net.peer.on("open", () => {
      if (generation !== net.generation) return;
      if (host) {
        clearTimeout(net.joinTimer);
        if (!session) {
          closeModal(true);
          room();
        }
      } else dial();
    });
    if (host)
      net.peer.on("connection", (c) => {
        if (generation === net.generation) wire(c);
      });
    net.peer.on("disconnected", () => {
      if (generation === net.generation) tryReconnect();
    });
    net.peer.on("error", (e) => {
      if (generation !== net.generation) return;
      if (session && remotePeer) pause("餐桌的灯晃了一下，正在等对桌回来。 ");
      else
        connectionError(
          e.type === "unavailable-id"
            ? "这张桌子已有主人，请换一个房间。"
            : "暂时不能连接（" + e.type + "），请检查网络后重试。",
        );
    });
    heartbeat = setInterval(() => {
      if (generation !== net.generation || document.hidden) return;
      if (net.netConnected) {
        if (Date.now() - lastSeen > 10000) {
          pause();
          try {
            net.conn?.close();
          } catch {}
        } else raw({ kind: "ping", session, protocol: 3 });
        // ACK loss is repaired without waiting for a full disconnection.
        link?.replay();
      }
      if (!net.netConnected && session && remotePeer) tryReconnect();
    }, 2500);
  }
  function dial() {
    if (
      !net.peer ||
      net.peer.destroyed ||
      net.peer.disconnected ||
      pendingConn ||
      net.netConnected
    )
      return;
    pendingConn = net.peer.connect("witch-supper-" + net.roomCode, {
      reliable: true,
      serialization: "json",
    });
    wire(pendingConn);
  }
  function pause(message = "对桌暂时掉线了，餐具替你留着。正在接回原回合…") {
    if (!session || !remotePeer) return;
    net.netConnected = false;
    if (!recoveryAt) recoveryAt = Date.now();
    banner(message);
  }
  function tryReconnect() {
    if (!net.peer || net.peer.destroyed) return;
    if (recoveryAt && Date.now() - recoveryAt > RECOVERY_MS) {
      banner(
        "暂时没能接回餐桌。保留这页，等朋友回来后点“再连一下”，或回到请柬重新开局。",
      );
      return;
    }
    try {
      if (net.peer.disconnected) net.peer.reconnect();
      else if (net.netSlot === 1) dial();
    } catch {}
  }
  function wire(c) {
    candidates.add(c);
    const generation = net.generation;
    const valid = () => generation === net.generation;
    let authenticated = false;
    const candidateTimer = setTimeout(() => {
      if (!authenticated) {
        if (pendingConn === c) pendingConn = null;
        c.close();
      }
    }, 8000);
    candidateTimers.add(candidateTimer);
    const reject = () => {
      raw({ kind: "rejected", protocol: 3 }, c);
      c.close();
    };
    function activate() {
      clearTimeout(candidateTimer);
      candidateTimers.delete(candidateTimer);
      candidates.delete(c);
      const old = net.conn;
      if (old && old !== c) {
        old.removeAllListeners?.();
        old.close();
      }
      net.conn = c;
      pendingConn = null;
      authenticated = true;
      net.netConnected = true;
      lastSeen = Date.now();
      recoveryAt = 0;
      clearTimeout(net.joinTimer);
      banner(null);
      link.replay();
    }
    c.on("open", () => {
      if (!valid()) return c.close();
      if (net.netSlot === 1)
        raw({ kind: "hello", protocol: 3, session, name: joinName }, c);
    });
    c.on("data", (d) => {
      if (!valid() || !d || typeof d !== "object") return;
      if (d.protocol !== 3) {
        connectionError("双方游戏版本不同，请更新页面后重新联机。");
        return;
      }
      if (d.kind === "hello" && net.netSlot === 0 && !authenticated) {
        if (!/^[\da-f-]{36}$/i.test(d.session || "")) return reject();
        if (session && (d.session !== session || c.peer !== remotePeer))
          return reject();
        const first = !session;
        if (first) {
          session = d.session;
          remotePeer = c.peer;
          net.netNames[1] = String(d.name || "小月亮").slice(0, 12);
          initLink();
        }
        raw({ kind: "welcome", protocol: 3, session }, c);
        activate();
        if (first) {
          send({ type: "welcome", names: net.netNames });
          room();
        }
        return;
      }
      if (
        d.kind === "welcome" &&
        net.netSlot === 1 &&
        d.session === session &&
        !authenticated
      ) {
        remotePeer = c.peer;
        activate();
        return;
      }
      if (d.kind === "rejected") {
        connectionError("餐桌已经坐满，或原来的连接身份已失效。请重新约一桌。");
        return;
      }
      if (!authenticated || net.conn !== c || d.session !== session) return;
      lastSeen = Date.now();
      if (d.kind === "ping") raw({ kind: "pong", session, protocol: 3 });
      else if (d.kind !== "pong") link.receive(d);
    });
    const lost = () => {
      clearTimeout(candidateTimer);
      candidateTimers.delete(candidateTimer);
      candidates.delete(c);
      if (pendingConn === c) pendingConn = null;
      if (!valid() || net.conn !== c) return;
      pause();
      tryReconnect();
    };
    c.on("close", lost);
    c.on("error", lost);
  }
  function room() {
    phaseTo("room");
    app.innerHTML = `<section class="handoff"><div class="handoff-card"><span class="script">A table, just for two</span><h1>南瓜灯下的房间</h1><p>把口令交给另一位女巫，让她坐到对面。</p><div class="room-code" id="roomCode">${net.roomCode}</div><button id="copyRoom" class="text-button">复制房间口令</button><div class="room-players">${net.netNames.map((n, p) => `<div>${avatar(p)}<p>${esc(n)}</p></div>`).join("")}</div><p class="connection-state" id="roomStatus">${net.netConnected ? "对桌已经入席，今晚可以开宴了。" : "灯已经点好，等另一位女巫输入口令。"}</p><button class="btn-purple" id="onlineBegin" ${!net.netConnected || net.netSlot === 1 ? "disabled" : ""}>${net.netSlot === 0 ? "双方到齐，秘密选毒" : "等房主拆开菜单"}</button><br><button class="text-button" id="roomLeave">收好口令，先离席</button>${sticker("ghost-lantern", "corner-ghost")}${sticker("potion", "corner-potion")}</div></section>`;
    on("copyRoom", async () => {
      try {
        await navigator.clipboard.writeText(net.roomCode);
        toast("口令已复制：" + net.roomCode);
      } catch {
        toast("房间口令是 " + net.roomCode);
      }
    });
    on("onlineBegin", onlineStart);
    on("roomLeave", home);
  }
  function onlineStart() {
    if (net.netSlot !== 0 || !net.netConnected || (state.r && !net.verified))
      return;
    state.theme = makeSweetTable();
    const payload = {
      type: "start",
      theme: state.theme.id,
      dishKeys: state.theme.dishes.map((d) => d.key),
      first: net.netSeq % 2,
      sequence: net.netSeq + 1,
      names: net.netNames,
    };
    send(payload);
    receiveStart(payload);
  }
  function receiveStart(d) {
    if (
      !validStart(d, new Set(SWEETS.map((s) => s.key))) ||
      d.sequence <= net.netSeq
    )
      return;
    net.netSeq = d.sequence;
    actions.cancelTransition?.();
    state.epoch++;
    closeModal(true);
    state.theme = {
      ...MENU[0],
      dishes: d.dishKeys.map((key, id) => ({
        ...SWEETS.find((s) => s.key === key),
        id,
      })),
    };
    net.netNames = d.names;
    Object.assign(net, {
      myCommit: null,
      theirCommit: null,
      mySecret: null,
      mySalt: null,
      onlineStarted: false,
      verified: false,
      revealValid: false,
      theirReady: false,
    });
    sealed = false;
    state.log = [];
    state.scored = false;
    state.taste = null;
    state.secrets = [null, null];
    state.r = E.createRound([null, null], d.first);
    transition("两份秘密，各自轻轻藏好。", () => pick(net.netSlot));
  }
  async function sealOnline(id) {
    if (
      sealed ||
      !net.netConnected ||
      !Number.isInteger(id) ||
      id < 0 ||
      id > 15
    )
      return;
    sealed = true;
    const generation = net.generation,
      round = net.netSeq;
    net.mySecret = id;
    net.mySalt = crypto.randomUUID();
    // Hide the selection immediately, before the asynchronous hash completes.
    handoff(
      net.netSlot,
      "这份秘密，已经封好了",
      "毒药的位置留在自己的口袋里。<br>等对桌也选完，两边就会一起开宴。",
      "等对桌封好秘密…",
      () => {},
      false,
    );
    if ($("handoffGo")) $("handoffGo").disabled = true;
    const hash = await commitment(net.roomCode, round, id, net.mySalt);
    if (generation !== net.generation || round !== net.netSeq) return;
    net.myCommit = hash;
    state.r.poison[net.netSlot] = id;
    send({ type: "commit", hash });
    serveOnline();
  }
  function serveOnline() {
    if (net.onlineStarted || !net.myCommit || !net.theirCommit) return;
    net.onlineStarted = true;
    transition("秘密齐了，餐具也准备好了。", board);
  }
  function networkVerdict(d) {
    if (
      !validVerdict(d, state.log.length) ||
      !state.r ||
      state.r.over ||
      state.r.eaten.flat().includes(d.id)
    )
      return;
    const player = state.r.turn;
    state.r.eaten[player].push(d.id);
    if (d.hit) {
      state.r.over = true;
      state.r.winner = 1 - player;
      send({ type: "reveal", secret: net.mySecret, salt: net.mySalt });
    }
    recordTaste(d.id, d.k, player, d.hit);
    showFeedback(d.id, d.k, player, d.hit, player === net.netSlot && !d.hit);
  }
  function finalizeResult() {
    if (net.verified || !net.revealValid || !net.theirReady) return;
    net.verified = true;
    awardRound();
    const last = state.log.at(-1);
    if (state.phase === "end") ending();
    else
      showFeedback(
        last.id,
        last.k,
        last.player,
        true,
        last.player === net.netSlot,
      );
  }
  async function handleNetwork(d) {
    if (!d || typeof d.type !== "string") return;
    if (
      [
        "commit",
        "taste",
        "verdict",
        "advance",
        "reveal",
        "verified",
        "reaction",
      ].includes(d.type) &&
      d.round !== net.netSeq
    )
      return;
    if (d.type === "welcome" && net.netSlot === 1 && net.netSeq === 0) {
      if (
        !Array.isArray(d.names) ||
        d.names.length !== 2 ||
        !d.names.every((n) => typeof n === "string" && n.length <= 12)
      )
        return;
      net.netNames = d.names;
      closeModal(true);
      room();
    } else if (d.type === "start" && net.netSlot === 1) receiveStart(d);
    else if (
      d.type === "commit" &&
      state.r &&
      !net.onlineStarted &&
      /^[a-f0-9]{64}$/.test(d.hash)
    ) {
      if (!net.theirCommit) net.theirCommit = d.hash;
      serveOnline();
    } else if (
      d.type === "taste" &&
      net.onlineStarted &&
      state.r &&
      state.r.turn !== net.netSlot &&
      !state.r.over &&
      validTaste(d, state.log.length) &&
      !state.r.eaten.flat().includes(d.id)
    ) {
      const answer = {
        type: "verdict",
        id: d.id,
        k: d.k,
        no: d.no,
        hit: d.id === net.mySecret || d.ownHit,
      };
      send(answer);
      networkVerdict(answer);
    } else if (
      d.type === "verdict" &&
      state.r?.turn === net.netSlot &&
      state.taste?.resolved &&
      d.id === state.taste.id &&
      d.k === state.taste.k &&
      validVerdict(d, state.log.length)
    ) {
      networkVerdict(d);
    } else if (
      d.type === "advance" &&
      state.r &&
      state.r.turn !== net.netSlot &&
      d.no === state.log.length &&
      state.taste &&
      state.log.at(-1)?.id === state.taste.id &&
      (!state.r.over || net.verified)
    ) {
      doAdvance();
    } else if (
      d.type === "reveal" &&
      state.r?.over &&
      !net.revealValid &&
      Number.isInteger(d.secret) &&
      d.secret >= 0 &&
      d.secret < 16 &&
      typeof d.salt === "string" &&
      d.salt.length <= 100
    ) {
      const generation = net.generation,
        round = net.netSeq;
      const hash = await commitment(net.roomCode, round, d.secret, d.salt);
      if (generation !== net.generation || round !== net.netSeq) return;
      const poisons = [...state.r.poison];
      poisons[1 - net.netSlot] = d.secret;
      if (
        hash !== net.theirCommit ||
        !validFinishedRound(state.log, poisons, state.r.winner)
      ) {
        banner(
          "双方封存或回合记录校验不一致，本局不计分。请回到请柬重新开局。",
        );
        return;
      }
      state.r.poison = poisons;
      net.revealValid = true;
      send({ type: "verified", no: state.log.length, winner: state.r.winner });
      finalizeResult();
    } else if (
      d.type === "verified" &&
      state.r?.over &&
      d.no === state.log.length &&
      d.winner === state.r.winner
    ) {
      net.theirReady = true;
      finalizeResult();
    } else if (d.type === "reaction" && typeof d.text === "string")
      reaction(d.text.slice(0, 60), net.netNames[1 - net.netSlot]);
    else if (d.type === "leave") {
      net.netConnected = false;
      banner("对桌已离席。请回到请柬，重新约一桌。");
      recoveryAt = Date.now() - RECOVERY_MS - 1;
    }
  }
  lifetime.listen(window, "online", tryReconnect);
  lifetime.listen(document, "visibilitychange", () => {
    if (document.hidden) return;
    if (session && remotePeer) {
      // Freeze input until the peer answers; a tab may have slept through heartbeats.
      if (Date.now() - lastSeen > 8000) {
        pause();
        try {
          net.conn?.close();
        } catch {}
      }
      tryReconnect();
    }
  });
  return {
    resetNet,
    send,
    networkMenu,
    onlineStart,
    sealOnline,
    joinRoom,
    destroy() {
      resetNet();
      lifetime.destroy();
    },
  };
}
