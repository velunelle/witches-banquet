import { state } from "../core/state.js";
import { MENU, SWEETS } from "../data/menu.js";
import { esc, asset, sticker, photo } from "../ui/helpers.js";
export function createContent({ ui }) {
  const { openModal, closeModal, on } = ui;
  function chooseMenu() {
    openModal(
      `<span class="eyebrow">SWEET LITTLE TROUBLE</span><h2>这一期：女巫的甜品手账</h2><p>魔法甜味都在这里！每局从 ${SWEETS.length} 份完整甜品中随机上 16 份。今晚的甜味，想先偷吃哪一口？</p><div class="sweet-catalog">${SWEETS.map((d) => `<div><img src="${asset(d.image)}" alt="${d.name}"><b>${d.name}</b></div>`).join("")}</div><button class="btn-purple" id="menuDone">懂了，都是我的梦中情点！</button>`,
      "feast-selector",
    );
    on("menuDone", () => closeModal(true));
  }
  function rules() {
    openModal(
      `<span class="eyebrow">BEFORE THE FIRST BITE</span><h2>女巫的赴宴须知</h2><ol><li>选一桌喜欢的菜，再决定和女巫玩、双人同屏，还是用房间码联机。</li><li>两人各自秘密指定一道毒药。同屏时轮流持屏；联机时各自在自己的设备上选择，结束前不发送毒药位置。</li><li>轮流点菜，或长按一道菜取食。每次从三句口味感受里选一句，再听角色点评。吃过的菜留下空盘，不能重复选。</li><li>吃到任意一方设下的毒药就离席，另一位积 1 分。记住自己的毒药，可以避开它。两人可以选同一道。</li><li>结束后揭晓双方毒药，下一局轮换先手。积分与手账保存在当前浏览器。</li></ol><p>人机女巫开局随机选毒，之后不会更改；她挑菜时不会读取你的毒药。联机短暂切屏或网络波动后，会尝试在 90 秒内接回原回合。请保留网页；刷新或关闭无法恢复房间。联机积分展示本次餐桌的战绩，积分簿另记浏览器累计成绩。</p>`,
    );
  }
  function journal() {
    openModal(
      `<span class="eyebrow">THE LITTLE TASTING JOURNAL</span><h2>把好吃的，都记下来</h2>${
        state.db.notes.length
          ? '<div class="journal-list">' +
            state.db.notes
              .map((l) => {
                const t = MENU.find((t) => t.id === l.theme);
                if (!t) return "";
                const journalPhoto = l.image
                  ? `<img class="food-photo" src="${asset(l.image)}" alt="${esc(l.dishName)}">`
                  : photo(l.id, t);
                return `<article class="journal-entry"><div class="entry-photo">${journalPhoto}</div><div><small>${esc(l.name)} · ${t.name}${l.hit ? " · 魔药显现" : ""}</small><h3>“${esc(l.label)}。”</h3><p>${esc(l.text)}</p></div></article>`;
              })
              .join("") +
            "</div>"
          : `<div class="empty-state">${sticker("letter")}这本手账还很干净。<br>等你吃过第一口，再来写上香气。</div>`
      }`,
    );
  }
  function scores() {
    openModal(
      `<span class="eyebrow">THE LITTLE VICTORY BOOK</span><h2>今晚，谁多吃了一口？</h2><table class="score-table"><thead><tr><th>玩法</th><th>第一位</th><th>第二位</th><th>已完成</th></tr></thead><tbody>${[
        ["solo", "和女巫玩"],
        ["local", "双人同屏"],
        ["online", "双人联机"],
      ]
        .map(
          ([m, s]) =>
            `<tr><td>${s}</td><td>${state.db.scores[m][0]}</td><td>${state.db.scores[m][1]}</td><td>${state.db.rounds[m]}</td></tr>`,
        )
        .join("")}</tbody></table><p>每胜一局积 1 分，两种头像按席位对应。</p>`,
    );
  }
  function credits() {
    openModal(
      `<div class="credits"><h2>素材与鸣谢</h2><p>本项目所出现的所有甜品均为 AI 创作。</p><p>角色头像为小红书博主野莓甜心老师的 AI 创作。</p><p>背景音乐《南瓜糖果圆舞曲》《月亮躲猫猫》为本游戏编写的原创旋律。</p><p>开屏翻牌的设计参考 47、nival 与 baink 的 <a href="https://github.com/knacl47/between-us" target="_blank" rel="noopener">BETWEEN US</a> 开源项目（MIT 代码许可），本版使用重新制作的双人翻牌开屏。卡牌与蝙蝠动效为本游戏制作，动作节奏参考 <a href="https://github.com/qimingjiu/Trianon" target="_blank" rel="noopener">qimingjiu/Trianon</a>。</p><p>中文使用站酷快乐体，英文使用 Pacifico（均为 SIL OFL 字体许可）。联机使用 PeerJS。</p><p>原创代码的开源许可待项目发起者确认；字体与第三方库保留各自许可。角色头像仅享有本游戏使用权，不随源码开放额外授权。详细来源见项目 ASSETS.md。</p></div>`,
    );
  }
  return { chooseMenu, rules, journal, scores, credits };
}
