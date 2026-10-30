import { state, net } from "../core/state.js";
export const $ = (id) => document.getElementById(id);
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const asset = (p) => window.SUPPER_ASSETS?.[p] || p;
export const pad = (n) => String(n).padStart(2, "0");
const H = "assets/halloween/";
export function names() {
  return state.mode === "solo"
    ? [state.db.names[0], "小月亮"]
    : state.mode === "online" && net.netNames
      ? net.netNames
      : state.db.names;
}
export function avatar(p, cls = "") {
  return `<img class="avatar ${cls}" src="${asset(H + (p === 0 ? "avatar-you.webp" : "avatar-witch.webp"))}" alt="${p === 0 ? "南瓜帽女巫角色" : "小月亮角色"}">`;
}
export function sticker(n, cls = "") {
  return `<img class="sticker ${cls}" src="${asset("assets/journal-v5/" + n + ".png")}" alt="" aria-hidden="true">`;
}
export function photo(id, t = state.theme) {
  let d = t.dishes[id];
  if (d.image)
    return `<img class="food-photo" src="${asset(d.image)}" alt="${esc(d.name)}">`;
  return `<span class="food-photo" role="img" aria-label="${esc(d.name)}" style="--atlas:url('${asset("assets/" + t.id + ".webp")}');--px:${((id % 4) * 100) / 3}%;--py:${(Math.floor(id / 4) * 100) / 3}%"></span>`;
}
