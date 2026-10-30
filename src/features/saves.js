import { state } from "../core/state.js";
import { MENU, SWEETS } from "../data/menu.js";
import { $ } from "../ui/helpers.js";
import {
  snapshot,
  validSnap,
  readSlots,
  writeSlots,
  readAuto,
  removeAuto,
  parseBackup,
  exportBackup,
  importBackup,
} from "../core/persistence.js";
export function createSaves({ ui, actions }) {
  const { openModal, closeModal, toast, on, modal } = ui;
  const {
    home,
    board,
    ending,
    showFeedback,
    botTurn,
    save,
    resetNet,
    autoSave,
  } = actions;
  function restoreSnap(v) {
    if (!validSnap(v)) {
      toast("这份存档格式不对，没有覆盖现有进度。");
      return;
    }
    state.epoch++;
    resetNet();
    closeModal(true);
    state.mode = v.mode;
    v = JSON.parse(JSON.stringify(v));
    state.db = v.db;
    state.theme = {
      ...MENU[0],
      dishes: v.themeKeys.map((k, id) => ({
        ...SWEETS.find((d) => d.key === k),
        id: id,
      })),
    };
    state.r = v.r;
    state.log = v.log;
    state.scored = !!v.scored;
    state.secrets = [null, null];
    state.taste = null;
    save();
    if (!state.r) {
      home();
      return;
    }
    if (state.r.over) {
      ending();
      return;
    }
    board();
    const t = v.taste;
    if (t?.resolved && state.log.length) {
      const l = state.log.at(-1);
      state.taste = {
        id: l.id,
        player: l.player,
        resolved: true,
        bot: false,
      };
      showFeedback(l.id, l.k, l.player, l.hit, true);
    } else if (state.mode === "solo" && state.r.turn === 1) botTurn();
    autoSave();
    toast("存档读好啦。");
  }
  function saveManager() {
    if (state.mode === "online") {
      toast("联机进度由双方共同进行，暂不支持本地读档。");
      return;
    }
    const slots = readSlots();
    const automatic = readAuto();
    openModal(
      `<h2>存档小抽屉</h2><p>积分、手账和已开宴的对局都可以保存。三个存档位可分别保留不同进度。</p><div class="save-menu">${slots.map((s, i) => `<article class="save-slot"><h3>存档 ${i + 1}</h3><p>${s ? new Date(s.at).toLocaleString("zh-CN") + " · " + (s.mode === "solo" ? "和小月亮玩" : "双人同屏") + " · " + (s.r ? "已吃 " + s.log.length + " 口" : "首页") : "还空着，等一份小秘密。"}</p><div class="slot-actions"><button data-save="${i}">${s ? "覆盖此档" : "存入此档"}</button><button data-load="${i}" ${s ? "" : "disabled"}>读档</button></div></article>`).join("")}</div><div class="save-toolbar"><button class="btn-purple" id="loadAuto" ${automatic ? "" : "disabled"}>读取自动存档</button><button class="btn-purple" id="exportSaves">导出备份</button><button class="btn-purple" id="importSaves">导入备份</button><button class="btn-gold" id="freshRound">重置当前局</button></div><input id="saveFile" class="import-save" type="file" accept="application/json,.json"><p class="save-message">刷新后可读取自动存档。重置当前局会保留积分、手账和手动存档。</p>`,
    );
    modal.querySelectorAll("[data-save]").forEach(
      (b) =>
        (b.onclick = () => {
          const i = +b.dataset.save,
            v = snapshot(state);
          if (!v) return;
          if (slots[i]) {
            openModal(
              `<h2>覆盖存档 ${i + 1} 吗？</h2><p>原来这个位置的进度将被当前进度替换，其他存档不变。</p><button class="btn-purple" id="overwrite">确认覆盖</button>`,
            );
            on("overwrite", () => {
              slots[i] = v;
              if (!writeSlots(slots)) {
                toast("没有保存成功，请检查浏览器存储空间或导出备份。");
                return;
              }
              saveManager();
              toast("覆盖保存好了。");
            });
          } else {
            slots[i] = v;
            if (!writeSlots(slots)) {
              toast("没有保存成功，请检查浏览器存储空间或导出备份。");
              return;
            }
            saveManager();
            toast("存好啦。");
          }
        }),
    );
    modal
      .querySelectorAll("[data-load]")
      .forEach(
        (b) => (b.onclick = () => confirmRestore(slots[+b.dataset.load])),
      );
    on("loadAuto", () => confirmRestore(automatic));
    on("freshRound", () => {
      openModal(
        '<h2>重新开一桌？</h2><p>当前未结束的对局不计分，已有积分、手账和存档保留。</p><button class="btn-purple" id="resetRound">确认重新开始</button>',
      );
      on("resetRound", () => {
        state.epoch++;
        state.r = null;
        state.taste = null;
        removeAuto();
        home();
      });
    });
    on("exportSaves", () => {
      const v = exportBackup(state);
      const u = URL.createObjectURL(
          new Blob([JSON.stringify(v, null, 2)], {
            type: "application/json",
          }),
        ),
        a = document.createElement("a");
      a.href = u;
      a.download = "witch-supper-backup.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(u), 2000);
    });
    on("importSaves", () => $("saveFile").click());
    $("saveFile").onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      if (f.size > 2500000) {
        toast("备份文件太大了，请检查是否选对。");
        return;
      }
      try {
        const v = parseBackup(await f.text());
        openModal(
          '<h2>导入并替换存档抽屉？</h2><p>三个手动存档将替换为文件中的内容。当前对局和积分暂不改变，读档后才会恢复。</p><button class="btn-purple" id="confirmImport">确认导入</button>',
        );
        on("confirmImport", () => {
          if (!importBackup(v)) {
            toast("导入没有完成，原存档已保留。");
            return;
          }
          saveManager();
          toast("备份导入好了。");
        });
      } catch {
        toast("文件不是有效的游戏备份，现有数据没有改动。");
      }
    };
  }
  function confirmRestore(v) {
    if (!validSnap(v)) {
      toast("这份存档无法读取。");
      return;
    }
    openModal(
      '<h2>回到这份存档？</h2><p>当前对局、积分和手账会恢复到存档时的状态。</p><button class="btn-purple" id="confirmRead">确认读档</button>',
    );
    on("confirmRead", () => restoreSnap(v));
  }
  return { saveManager, restoreSnap };
}
