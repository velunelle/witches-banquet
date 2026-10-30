import { state, net } from "../core/state.js";

import { esc, pad, names, avatar, sticker, photo } from "../ui/helpers.js";
export function homeView(n, s) {
  return `<section class="home-scene"><div class="welcome"><span class="eyebrow">OCTOBER 31 · A TABLE FOR TWO</span><h1>女巫的毒药</h1><div class="script">A little bite of magic</div><p>肚子说：开饭！脑子说：有诈！<br>两位嘴硬女巫，一桌软乎甜品。<br>谁先中招，谁负责可恶！！！</p><span class="scene-label">✧ 南瓜灯下的秘密晚餐 ✧</span>${sticker("cat", "little-cat")}${sticker("lantern", "mini-lantern")}</div><section class="invitation-book"><div class="book-heading"><span class="eyebrow">YOU ARE CORDIALLY INVITED</span><h2>嘴馋的女巫，集合！</h2><span class="script">Trick, treat & a tiny secret</span><p class="tiny">友谊第一，偷放毒药第零。</p></div>${sticker("purple-hat", "book-corner")}<div class="seat-pair duel-deck">${[0, 1].map((p) => `<button class="witch-card card-${p}" data-character="${p}" aria-label="翻看${esc(n[p])}的角色卡"><span class="card-rotator"><span class="card-face card-front"><small>${p ? "MOON WITCH" : "PUMPKIN WITCH"}</small>${avatar(p)}<b>${esc(n[p])}</b><em>${p ? "乖巧，但有诈" : "可爱，且能吃"}</em><i>✦ ${p ? "月亮阵营" : "南瓜阵营"} ✦</i></span><span class="card-face card-back">☾<b>${p ? "一肚子坏水" : "一肚子甜品"}</b><small>点一下，女巫回来啦</small></span></span></button>`).join("")}<span class="duel-vs">VS</span></div><button class="menu-ticket" id="chooseMenu"><span class="mini-photo">${photo(0)}</span><span><strong>${state.theme.name}</strong><small>魔法甜味 · 每局随机上 16 份</small></span><span class="change">偷看甜品</span></button><div class="mode-selector" role="group" aria-label="游戏模式">${[
    ["solo", "和女巫玩"],
    ["local", "双人同屏"],
    ["online", "双人联机"],
  ]
    .map(
      ([m, t]) =>
        `<button data-mode="${m}" class="${state.mode === m ? "active" : ""}" aria-pressed="${state.mode === m}">${t}</button>`,
    )
    .join(
      "",
    )}</div><button class="btn-gold book-action" id="startGame">${state.mode === "online" ? "点亮房间，邀请对桌" : "小叉子举起来 · 开炫！"} <span aria-hidden="true">✧</span></button><p class="book-help">${state.mode === "solo" ? "女巫会独立藏好毒药，与你轮流动筷。" : state.mode === "local" ? "一人一份秘密，封好后自动遮住桌面。" : "两台设备，同一房间。各自选毒，实时动筷。"}</p><div class="score-ribbon"><span>${esc(n[0])}<b>${s[0]}</b></span><span>✧</span><span>${esc(n[1])}<b>${s[1]}</b></span><button class="text-button" id="scores">积分簿</button></div>${sticker("cupcake", "book-sticker")}</section></section>`;
}
export function handoffView(p, title, text, label, namesForm) {
  return `<section class="handoff"><div class="handoff-card">${avatar(p)}<span class="script">A secret, just for you</span><h1>${title}</h1><p>${text}</p>${namesForm ? `<div class="names"><label>第一位女巫<input id="name0" aria-label="第一位女巫的名字" maxlength="8" value="${esc(state.db.names[0])}"></label><label>第二位女巫<input id="name1" aria-label="第二位女巫的名字" maxlength="8" value="${esc(state.db.names[1])}"></label></div>` : ""}<button class="btn-purple" id="handoffGo">${label}</button><br><button class="text-button" id="handoffHome">先回请柬看看</button><small>${state.mode === "online" ? "短暂掉线会尝试接回，请保留这个网页。" : "开宴后会自动保存，可在存档抽屉恢复。"}</small>${sticker("ghost-lantern", "corner-ghost")}${sticker("potion", "corner-potion")}</div></section>`;
}
export function heading(pickPhase = false) {
  return `<div class="stage-heading"><div><span class="eyebrow">HALLOWEEN SUPPER · ROUND ${pad(state.mode === "online" ? net.netSeq : (state.db.rounds[state.mode] || 0) + 1)}</span><h1>${state.theme.name}</h1></div><div class="stage-meta"><i class="status-dot"></i><span>${state.mode === "online" ? net.roomCode : pickPhase ? "秘密封存中" : "香气正好"}</span><button id="leave">离席</button></div></div>`;
}
export function hud(p) {
  let n = names(),
    s =
      state.mode === "online" ? net.sessionScores : state.db.scores[state.mode];
  return `<div class="player-hud">${[0, 1].map((j) => `${j === 1 ? '<div class="vs-glyph">VS<small>SECRET DUEL</small></div>' : ""}<div class="player-card ${j ? "right" : ""} ${p === j ? "active" : ""}">${avatar(j)}<div><h3>${esc(n[j])}</h3><small>${p === j ? "餐具已拿好" : "等对桌动筷"}</small></div><span class="score">${s[j]}</span></div>`).join("")}</div>`;
}
export function dish(d, secret = false) {
  const gone = !secret && state.r.eaten.flat().includes(d.id);
  return `<button class="dish ${gone ? "eaten" : ""} ${secret && state.selected === d.id ? "selected" : ""}" data-dish="${d.id}" ${gone || (!secret && ((state.mode === "solo" && state.r.turn === 1) || (state.mode === "online" && (state.r.turn !== net.netSlot || !net.netConnected)))) ? "disabled" : ""} ${secret ? `aria-pressed="${state.selected === d.id}"` : ""} aria-label="${esc(d.name)}，${gone ? "已经吃过" : secret ? "选为毒药" : "品尝这道菜"}" style="--tilt:${[-2, 2, -1, 3][d.id % 4]}deg"><span class="dish-no">${pad(d.id + 1)}</span><span class="porcelain">${gone ? '<span class="crumb"></span>' : photo(d.id)}</span><span class="dish-name">${gone ? "空盘 · " + (state.r.eaten[0].includes(d.id) ? esc(names()[0]) : esc(names()[1])) : d.name}</span></button>`;
}
export function pickView() {
  return `<section class="stage">${heading(true)}<p class="privacy-notice">只有 ${esc(names()[state.selecting])} 可以看这一页 · 确认后会立即遮住选择</p><div class="table-layout"><section class="dining-table"><div class="table-top"><h2>哪一份甜品，要被你施法？</h2><small>选错可以再点另一道</small></div><div class="dishes">${state.theme.dishes.map((d) => dish(d, true)).join("")}</div>${sticker("hat", "table-sticker tl")}${sticker("treatbag", "table-sticker br")}</section><aside class="side-diary"><span class="script">Just between us</span><h3>${esc(names()[state.selecting])} 的魔药</h3><p class="intro">不必挑最可疑的那道。<br>也许她最想吃的，<br>才是今晚的小小圈套。</p>${sticker("cauldron", "aside-sticker")}<div class="secret-choice" role="status">${state.selected === null ? "小坏心眼正在挑选中……" : "就它！" + state.theme.dishes[state.selected].name}</div><button class="btn-purple" id="lockSecret" ${state.selected === null ? "disabled" : ""}>封好秘密 ${state.mode === "online" ? "· 等对桌" : "· 遮住屏幕"}</button><button class="text-button" id="cover">有人来了，先遮住</button><div class="diary-note">${state.mode === "online" ? (net.theirCommit ? "对桌已经封好她的秘密。" : "对桌也在自己的屏幕上选毒。") : "不用念出菜名，点一下就记好了。"}<br>请记住你选的位置，轮到自己时可以避开。</div></aside></div></section>`;
}
export function boardView(p, n, left) {
  return `<section class="stage ${left <= 4 ? "danger-table" : ""}">${heading()}${hud(p)}<div class="table-layout"><section class="dining-table"><div class="table-top"><div><h2>${state.mode === "online" && p !== net.netSlot ? "对桌正在挑选…" : state.mode === "solo" && p === 1 ? "她的餐具停在半空…" : esc(n[p]) + "，想尝哪一道？"}</h2><p class="long-press-tip">${left <= 4 ? "空盘越来越多，秘密却还在。" : "点一下呈上美食，也可以长按慢慢取食。"}</p></div><span class="counter-pill">还剩 ${left} 道</span></div><div class="dishes">${state.theme.dishes.map((d) => dish(d)).join("")}</div>${sticker("cat", "table-sticker tl")}${sticker("lantern", "table-sticker br")}${sticker("pumpkin-cat", "table-sticker bl")}</section><aside class="side-diary"><span class="script">Little delicious notes</span><h3>嘴替营业中</h3><p class="intro">${left <= 4 ? "只剩几道了。<br>先闻香，再看看对桌。<br>她怎么突然笑了？" : "叉子可以慢一点。<br>坏心眼不能太明显。<br>嗯？你怎么笑了！"}</p>${sticker(left <= 4 ? "potion" : "cake", "aside-sticker")}<div class="diary-note">${
    state.log.length
      ? state.log
          .slice(-2)
          .map(
            (l) =>
              `<b>${esc(n[l.player])}</b> 尝了 ${state.theme.dishes[l.id].name}<br>“${esc(l.label)}”`,
          )
          .join("<br><br>")
      : "目前战况：<br>肚子空空，胆子大大。"
  }</div><div class="quick-reactions"><button data-react="你先别笑，我在认真挑。">你先别笑</button><button data-react="这一盘，我盯上很久了。">我盯上它了</button><button data-react="先不说输赢，让我嚼完这一口。">让我嚼完</button></div><button class="text-button" id="openNotes">翻翻美味手账</button></aside></div><div class="table-foot"><span>第 ${pad(state.log.length + 1)} 口 · ${state.mode === "online" ? "房间 " + net.roomCode : "轮流享用，一道不重复"}</span><span class="${left <= 4 ? "danger" : ""}">${left <= 4 ? "烛火晃了一下，心跳也跟着快了一点。" : "一口美味，一点小小的冒险。"}</span></div></section>`;
}
export function endingView(n, winner, s) {
  return `<section class="result-scene">${avatar(winner, "winner-avatar")}<span class="result-exclaim">可恶！！！</span><span class="script">赢啦！今晚的干饭王诞生！</span><h1>${esc(n[winner])}，拿捏！</h1><p>${esc(n[1 - winner])}：这桌甜品这么甜，怎么就你一肚子坏水！<br>${esc(n[winner])}：下次还坐我对面？我给你留位置。<br><span class="result-point">${esc(n[winner])} +1 分</span></p><div class="result-score"><span>${s[0]}<small>${esc(n[0])}</small></span><span class="colon">:</span><span>${s[1]}<small>${esc(n[1])}</small></span></div><div class="reveal-grid">${state.r.poison.map((id, p) => `<div class="reveal-dish"><div class="reveal-photo">${id === null ? "" : photo(id)}</div><div><small>${esc(n[p])} 藏的毒药</small><h3>${id === null ? "等对桌拆开封条…" : state.theme.dishes[id].name}</h3></div></div>`).join("")}</div><div class="modal-actions"><button id="again" class="btn-gold">${state.mode === "online" && net.netSlot === 1 ? "等房主再开一局" : "不服！再炫一局"}</button><button id="changeTable" class="btn-purple">收好餐具，回到请柬</button></div><div class="round-history">${state.log.map((l, i) => `<span class="history-chip ${l.hit ? "bad" : ""}">${pad(i + 1)} ${esc(n[l.player])} · ${state.theme.dishes[l.id].name}${l.hit ? " · 魔药显现" : ""}</span>`).join("")}</div>${sticker("treatbag", "result-sticker")}${sticker("goodnight", "result-sticker left")}</section>`;
}
