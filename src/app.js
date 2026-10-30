import {
  homeView,
  handoffView,
  pickView,
  boardView,
  endingView,
} from "./ui/screens.js";
import { createContent } from "./features/content.js";
import { state, net } from "./core/state.js";
import * as E from "./core/engine.js";
import { makeSweetTable } from "./data/menu.js";
import { persistDb, snapshot, writeAuto } from "./core/persistence.js";
import { $, esc, pad, names, avatar, sticker, photo } from "./ui/helpers.js";
import { createUI } from "./ui/dialogs.js";
import { createSfx } from "./audio/sfx.js";
import { createMusic } from "./audio/music.js";
import { createMotion } from "./ui/motion.js";
import { createSaves } from "./features/saves.js";
import { createNetwork } from "./features/network.js";
import { createLifetime } from "./core/lifetime.js";
const lifetime = createLifetime();
const ui = createUI();
const { app, modal, openModal, closeModal, toast, on } = ui;
const fx = createSfx(),
  sfx = (kind) => fx.play(kind);
const WitchMotion = createMotion();
const music = createMusic();
function save() {
  autoSave();
  if (!persistDb(state.db)) toast("浏览器没有允许保存；请导出备份保留进度。");
}
function autoSave() {
  const v = snapshot(state);
  if (v && state.r && ["dine", "end"].includes(state.phase)) writeAuto(v);
}
function phaseTo(p, scroll = true) {
  state.phase = p;
  document.body.classList.toggle("privacy", ["pick", "handoff"].includes(p));
  document.body.classList.toggle("at-home", p === "home");
  if (scroll)
    window.scrollTo({
      top: 0,
      behavior: "instant",
    });
  $("noteCount").textContent = state.db.notes.length;
  document.body.dataset.phase = p;
  requestAnimationFrame(autoSave);
}
function transition(text, fn) {
  if (state.transitioning) return;
  state.transitioning = true;
  const token = state.epoch;
  WitchMotion.transition(text, () => {
    state.transitioning = false;
    if (token === state.epoch) fn();
  });
}
function burst(poison = false) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  for (let i = 0; i < 18; i++) {
    const p = document.createElement("i");
    p.className = "taste-particle";
    p.textContent = i % 3 ? "✧" : "·";
    p.style.cssText = `--dx:${(Math.random() - 0.5) * 600}px;--dy:${(Math.random() - 0.7) * 440}px;--rot:${Math.random() * 360}deg;--delay:${Math.random() * 0.15}s;color:${poison ? "#bb85df" : "#e6b974"}`;
    document.body.append(p);
    lifetime.delay(() => p.remove(), 1800);
  }
}
function home() {
  WitchMotion.cancelTransition();
  state.transitioning = false;
  state.epoch++;
  resetNet();
  state.taste = null;
  closeModal(true);
  state.r = null;
  state.secrets = [null, null];
  phaseTo("home");
  let n = names(),
    s = state.db.scores[state.mode];
  app.innerHTML = homeView(n, s);
  app.querySelectorAll("[data-character]").forEach(
    (b) =>
      (b.onclick = () => {
        b.classList.toggle("flipped");
        sfx();
      }),
  );
  on("chooseMenu", chooseMenu);
  on("scores", scores);
  on("startGame", () => (state.mode === "online" ? networkMenu() : start()));
  app.querySelectorAll("[data-mode]").forEach(
    (b) =>
      (b.onclick = () => {
        state.mode = b.dataset.mode;
        home();
      }),
  );
}
function handoff(p, title, text, label, fn, namesForm = false) {
  phaseTo("handoff");
  app.innerHTML = handoffView(p, title, text, label, namesForm);
  on("handoffGo", () => {
    if (namesForm) {
      state.db.names = [
        $("name0").value.trim() || "小南瓜",
        $("name1").value.trim() || "小月亮",
      ];
      save();
    }
    fn();
  });
  on("handoffHome", home);
}
function start() {
  if (state.mode !== "online") state.theme = makeSweetTable();
  state.epoch++;
  state.secrets = [null, null];
  state.selected = null;
  state.log = [];
  state.scored = false;
  state.taste = null;
  state.r = null;
  if (state.mode === "solo") {
    state.secrets[1] = E.randomIndex(16);
    transition("烛火亮了，她已经藏好秘密。", () =>
      handoff(
        0,
        "嘘！偷偷给她加点料",
        "对桌女巫已经选好毒药，不会中途更改。<br>现在轮到你，把一滴小小的秘密藏进美味里。",
        "只有我在看，开始选毒",
        () => pick(0),
      ),
    );
  } else
    transition("坏心眼加载中……嘿嘿！", () =>
      handoff(
        0,
        "先把屏幕交给第一位",
        "另一位先转过身，借我一点点秘密时间。<br>确认后，桌面会自动遮住，再交给对方。",
        "只有我在看，开始选毒",
        () => pick(0),
        true,
      ),
    );
}
function pick(p) {
  state.selecting = p;
  state.selected = null;
  renderPick();
}
function renderPick(keep = false) {
  let y = scrollY;
  phaseTo("pick", !keep);
  app.innerHTML = pickView();
  app.querySelectorAll("[data-dish]").forEach(
    (b) =>
      (b.onclick = () => {
        state.selected = +b.dataset.dish;
        renderPick(true);
        sfx("safe");
        WitchMotion.pop(app.querySelector(".dish.selected"), "就你啦！");
      }),
  );
  on("lockSecret", lockSecret);
  on("cover", () => {
    state.selected = null;
    handoff(
      state.selecting,
      "嘘，桌面替你遮好了",
      "请确认只有你在看，再回来选毒。",
      "继续我的秘密",
      () => pick(state.selecting),
    );
  });
  on("leave", leave);
  if (keep)
    window.scrollTo({
      top: y,
      behavior: "instant",
    });
}
async function lockSecret() {
  if (state.mode === "online" && !net.netConnected) return;
  WitchMotion.flock();
  if (state.selected === null) return;
  state.secrets[state.selecting] = state.selected;
  state.selected = null;
  sfx();
  if (state.mode === "online") {
    await sealOnline(state.secrets[state.selecting]);
    return;
  }
  if (state.mode === "local" && state.selecting === 0) {
    handoff(
      1,
      "封好啦！谁看谁是小南瓜",
      "现在请把屏幕交给第二位。<br>第一位先转过身，别偷看女巫的小心思。",
      "第二位拿到屏幕了",
      () => pick(1),
    );
  } else {
    handoff(
      0,
      "嘿嘿，坏心眼都就位啦",
      "一桌共享，吃过的菜就会留下空盘。<br>先吃到任意一份毒药的人，要先离席。",
      "甜品到齐！开炫！",
      () => {
        state.r = E.createRound(state.secrets, state.db.rounds[state.mode] % 2);
        state.secrets = [null, null];
        transition("小叉子集合！嘴馋出击！", () => {
          board();
          if (state.mode === "solo" && state.r.turn === 1) botTurn();
        });
      },
    );
  }
}
function board(keep = false) {
  const y = scrollY,
    p = state.r.turn,
    n = names(),
    left = 16 - state.r.eaten.flat().length;
  phaseTo("dine", !keep);
  app.innerHTML = boardView(p, n, left);
  on("leave", leave);
  on("openNotes", journal);
  app.querySelectorAll("[data-react]").forEach(
    (b) =>
      (b.onclick = () => {
        reaction(b.dataset.react, n[state.mode === "online" ? net.netSlot : p]);
        if (state.mode === "online")
          send({
            type: "reaction",
            text: b.dataset.react,
          });
      }),
  );
  app.querySelectorAll("[data-dish]:not(:disabled)").forEach((b) => {
    let timer;
    const token = state.epoch;
    const id = +b.dataset.dish;
    b.onpointerdown = (e) => {
      if (e.button !== 0) return;
      b.classList.add("holding");
      timer = lifetime.delay(() => {
        b.classList.remove("holding");
        if (token === state.epoch && b.isConnected) present(id, false);
      }, 650);
    };
    const clear = () => {
      lifetime.cancel(timer);
      b.classList.remove("holding");
    };
    b.onpointerup = clear;
    b.onpointerleave = clear;
    b.onpointercancel = clear;
    b.onclick = () => {
      clear();
      present(id, false);
    };
  });
  if (keep)
    window.scrollTo({
      top: y,
      behavior: "instant",
    });
}
function reaction(text, name) {
  document.querySelector(".bluff-bubble")?.remove();
  const el = document.createElement("div");
  el.className = "bluff-bubble";
  el.textContent = name + "：“" + text + "”";
  document.body.append(el);
  lifetime.delay(() => el.remove(), 3200);
}
function botTurn() {
  const token = state.epoch;
  lifetime.delay(() => {
    if (
      token !== state.epoch ||
      state.phase !== "dine" ||
      state.r.over ||
      state.r.turn !== 1 ||
      state.taste
    )
      return;
    const id = E.chooseDish(state.r.poison[1], state.r.eaten.flat());
    present(id, true);
  }, 1100);
}
function present(id, bot = false) {
  if (
    !state.r ||
    (state.mode === "online" &&
      (!net.netConnected || state.r.turn !== net.netSlot)) ||
    state.taste ||
    state.r.over ||
    state.r.eaten.flat().includes(id)
  )
    return;
  const p = state.r.turn;
  let d = state.theme.dishes[id];
  state.taste = {
    id: id,
    player: p,
    resolved: false,
    bot: bot,
  };
  sfx("bite");
  openModal(
    `<div class="taste-scene"><div class="plating"><i class="plate-glow"></i><div class="hero-plate">${photo(id)}<span class="dish-no">DISH N° ${pad(id + 1)}</span></div><h2 class="food-title">${d.name}</h2><span class="serving">SERVED WARM, WITH A LITTLE SECRET</span></div><div class="character-dialogue"><div class="speaker">${avatar(p)}<div><span class="speaker-name">${esc(names()[p])}</span><span class="speaker-tag">${bot ? "SHE TAKES A LITTLE BITE" : "A LITTLE BITE, A LITTLE JOY"}</span></div></div><div class="speech-bubble"><span class="bubble-kicker">${bot ? "Her little tasting note" : "哼哼，让我品鉴一下"}</span><p>${bot ? "哼哼，轮到本女巫的美食测评时间！让我先挖一大勺……" : "小叉子就位！这口看起来很会拿捏我诶。<br>啊——呜！你觉得是哪种好吃？"}</p></div><p class="taste-hint">${bot ? "嚼嚼嚼……她的小脑袋正在加载。" : "选一句，替你的嘴巴发言～"}</p><div class="flavors">${bot ? "" : d.options.map((o, k) => `<button class="flavor" data-flavor="${k}"><span class="flavor-index">${["I", "II", "III"][k]}</span>${o.label}</button>`).join("")}</div></div></div>${sticker("stretch-cat", "taste-sticker cat")}${sticker("cupcake", "taste-sticker cup")}`,
    "taste-card",
    true,
  );
  const token = state.epoch;
  if (bot)
    lifetime.delay(() => {
      if (token !== state.epoch) return;
      if (state.taste?.id === id && !state.taste.resolved)
        resolveTaste(E.randomIndex(3));
    }, 750);
  else
    modal
      .querySelectorAll("[data-flavor]")
      .forEach((b) => (b.onclick = () => resolveTaste(+b.dataset.flavor)));
}
function foodComment(id, k) {
  if (state.theme.id === "sweet") return state.theme.dishes[id].options[k].text;
  let d = state.theme.dishes[id],
    o = d.options[k];
  if (state.theme.id === "restaurant") return o.text;
  let last =
    state.theme.id === "dessert"
      ? o.label.includes("酥")
        ? "盘子接稳，我要开始掉酥屑了。"
        : o.label.includes("奶")
          ? "嘴角的这一点奶油，也不能浪费。"
          : "吃完这一小口，再认真提防女巫好了。"
      : state.theme.id === "grill"
        ? o.label.includes("汁")
          ? "先别催，我要把这一口鲜汁吃干净。"
          : "好香……刚才是不是说只尝一点点来着？"
        : state.theme.id === "huazhao"
          ? "小口一点，舍不得把这么漂亮的点心吃得太快。"
          : "餐具先别收，这口我还没回味完呢。";
  return o.text + " " + last;
}
function resolveTaste(k) {
  if (
    !state.taste ||
    state.taste.resolved ||
    (state.mode === "online" && !net.netConnected)
  )
    return;
  state.taste.resolved = true;
  state.taste.k = k;
  WitchMotion.bite();
  sfx("bite");
  const { id: id, player: player } = state.taste;
  if (state.mode === "online") {
    modal.querySelector(".flavors").innerHTML =
      '<p class="waiting-small">餐具轻轻放下，等对桌揭晓这一口…</p>';
    send({
      type: "taste",
      id: id,
      k: k,
      no: state.log.length,
      ownHit: id === net.mySecret,
    });
    return;
  }
  const v = E.eat(state.r, player, id);
  if (!v.ok) return;
  recordTaste(id, k, player, v.poisoned);
  const token = state.epoch;
  lifetime.delay(() => {
    if (token === state.epoch && state.taste?.id === id)
      showFeedback(id, k, player, v.poisoned, true);
  }, 430);
}
function recordTaste(id, k, player, hit) {
  const o = state.theme.dishes[id].options[k];
  state.log.push({
    id: id,
    k: k,
    player: player,
    label: o.label,
    hit: hit,
  });
  state.db.notes.unshift({
    theme: state.theme.id,
    id: id,
    k: k,
    label: o.label,
    text: foodComment(id, k),
    dishName: state.theme.dishes[id].name,
    image: state.theme.dishes[id].image,
    name: names()[player],
    hit: hit,
  });
  state.db.notes = state.db.notes.slice(0, 100);
  if (hit && state.mode !== "online") awardRound();
  save();
  $("noteCount").textContent = state.db.notes.length;
}
function awardRound() {
  if (
    state.scored ||
    !state.r?.over ||
    (state.mode === "online" && !net.verified)
  )
    return;
  state.scored = true;
  const winner = state.r.winner;
  state.db.scores[state.mode][winner]++;
  state.db.rounds[state.mode]++;
  if (state.mode === "online") net.sessionScores[winner]++;
  save();
}
function showFeedback(id, k, player, hit, canContinue) {
  const d = state.theme.dishes[id],
    o = d.options[k];
  if (modal.hidden || !modal.querySelector(".character-dialogue")) {
    state.taste = {
      id: id,
      player: player,
      resolved: true,
      bot: false,
    };
    openModal(
      `<div class="taste-scene"><div class="plating"><i class="plate-glow"></i><div class="hero-plate">${photo(id)}<span class="dish-no">DISH N° ${pad(id + 1)}</span></div><h2 class="food-title">${d.name}</h2><span class="serving">A BITE SHARED ACROSS THE TABLE</span></div><div class="character-dialogue"></div></div>${sticker("stretch-cat", "taste-sticker cat")}${sticker("cupcake", "taste-sticker cup")}`,
      "taste-card",
      true,
    );
  }
  modal.querySelector(".taste-card").classList.add("feedback-ready");
  modal.querySelector(".taste-card").classList.toggle("poisoned", hit);
  modal.querySelector(".hero-plate").classList.add("bitten");
  modal.querySelector(".character-dialogue").innerHTML =
    `<div class="speaker">${avatar(player)}<div><span class="speaker-name">${esc(names()[player])}</span><span class="speaker-tag">${hit ? "A DELICIOUS LITTLE TRAP" : "Her little tasting note"}</span></div></div><div class="speech-bubble"><span class="bubble-kicker">${hit ? "可恶！！！" : "震撼美味！！！"}</span><span class="bubble-title">“${o.label}。”</span><p>${foodComment(id, k)}</p></div><span class="verdict">${hit ? "呜哇！中招了！我的饭搭子竟然演我！！" : "叮！安全落肚～再炫一口的心已经按不住了"}</span>${hit ? `<p class="poison-detail">刚夸完它好吃，它就给我上了一课。<br>这口有毒，但我的嘴还在说：好香……</p>` : ""}<button class="btn-purple taste-next" id="tasteNext" ${!canContinue ? "disabled" : ""}>${!canContinue ? (hit && !net.verified && state.mode === "online" ? "等双方拆开封条…" : "等对桌放下餐具…") : hit ? "可恶！让我看看是谁干的" : state.mode === "solo" && player === 0 ? "我活着！换你炫一口" : "把餐具交给 " + esc(names()[1 - player])}</button>`;
  sfx(hit ? "poison" : "safe");
  burst(hit);
  WitchMotion.verdict(hit);
  if (canContinue) on("tasteNext", advance);
  $("tasteNext")?.focus({
    preventScroll: true,
  });
}
function advance() {
  if (
    !state.taste ||
    (state.mode === "online" &&
      (!net.netConnected || (state.r.over && !net.verified)))
  )
    return;
  if (state.mode === "online")
    send({
      type: "advance",
      no: state.log.length,
    });
  doAdvance();
}
function doAdvance() {
  state.taste = null;
  closeModal(true);
  if (state.r.over) {
    transition("好吃是真的，上当也是真的！", ending);
  } else {
    E.next(state.r);
    board(true);
    if (state.mode === "solo" && state.r.turn === 1) botTurn();
  }
}
function ending() {
  phaseTo("end");
  const n = names(),
    winner = state.r.winner,
    s =
      state.mode === "online" ? net.sessionScores : state.db.scores[state.mode];
  app.innerHTML = endingView(n, winner, s);
  on("changeTable", home);
  on("again", () => {
    if (state.mode === "online") {
      if (net.netSlot === 0) onlineStart();
      else toast("等房主点“再赴一局”，两边就会一起开宴。");
    } else start();
  });
  sfx("victory");
  burst();
  WitchMotion.flock();
}
function leave() {
  if (state.mode === "online" && state.phase === "room") {
    home();
    return;
  }
  openModal(
    '<span class="eyebrow">A LITTLE PAUSE</span><h2>先把餐具放下吗？</h2><p>这一局尚未结束，离席不会计分。已经吃过的美味会留在手账里。</p><div class="modal-actions"><button class="btn-purple" id="confirmLeave">先回请柬</button></div>',
  );
  on("confirmLeave", () => {
    send({
      type: "leave",
    });
    home();
  });
}
const { chooseMenu, rules, journal, scores, credits } = createContent({ ui });
const network = createNetwork({
  ui,
  actions: {
    home,
    board,
    pick,
    handoff,
    transition,
    phaseTo,
    cancelTransition() {
      WitchMotion.cancelTransition();
      state.transitioning = false;
    },
    recordTaste,
    awardRound,
    showFeedback,
    doAdvance,
    ending,
    reaction,
  },
});
const { resetNet, send, networkMenu, onlineStart, sealOnline } = network;
const saves = createSaves({
  ui,
  actions: {
    home,
    board,
    ending,
    showFeedback,
    botTurn,
    save,
    resetNet,
    autoSave,
  },
});
on("saveBtn", saves.saveManager);
on("rulesBtn", rules);
on("notesBtn", journal);
on("creditsBtn", credits);
on("homeBrand", () =>
  state.phase === "home"
    ? null
    : ["dine", "pick"].includes(state.phase)
      ? leave()
      : home(),
);
for (let i = 0; i < 16; i++) {
  const el = document.createElement("i");
  el.className = "firefly";
  el.style.cssText = `--x:${i * 6.3}%;--d:${24 + (i % 7) * 3}s;--delay:${-i * 2.2}s`;
  $("fireflies").append(el);
}
lifetime.listen(document, "visibilitychange", () => {
  if (document.hidden && state.phase === "pick" && state.mode !== "online") {
    state.selected = null;
    handoff(
      state.selecting,
      "替你把秘密遮住了",
      "刚才离开时，桌面已经自动遮好。<br>确认只有你在看，再继续选择。",
      "继续选我的毒药",
      () => pick(state.selecting),
    );
  }
});
lifetime.listen(window, "pagehide", (event) => {
  if (event.persisted) return;
  state.epoch++;
  lifetime.destroy();
  ui.destroy();
  WitchMotion.destroy();
  music.destroy();
  network.destroy();
  fx.destroy();
});
home();
