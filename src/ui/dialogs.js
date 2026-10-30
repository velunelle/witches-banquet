import { $ } from "./helpers.js";
import { createLifetime } from "../core/lifetime.js";
export function createUI() {
  const lifetime = createLifetime(),
    app = $("app"),
    modal = $("modal");
  let focusBefore = null,
    toastTimer = null;
  function toast(text) {
    lifetime.cancel(toastTimer);
    $("snackbar").textContent = text;
    $("snackbar").classList.add("visible");
    toastTimer = lifetime.delay(
      () => $("snackbar").classList.remove("visible"),
      3500,
    );
  }
  function on(id, fn) {
    const node = $(id);
    if (node) node.addEventListener("click", fn);
  }
  function closeModal(force = false) {
    if (!force && modal.dataset.lock === "1") return;
    modal.hidden = true;
    modal.innerHTML = "";
    document.body.style.overflow = "";
    if (focusBefore?.isConnected) focusBefore.focus({ preventScroll: true });
  }
  function openModal(html, cls = "", lock = false) {
    if (modal.hidden) focusBefore = document.activeElement;
    modal.hidden = false;
    modal.dataset.lock = lock ? "1" : "0";
    modal.innerHTML = `<section role="dialog" aria-modal="true" aria-label="${lock ? "品尝美食" : "女巫晚宴便笺"}" class="modal-card ${cls}">${lock ? "" : '<button class="close-modal" aria-label="关闭">×</button>'}${html}</section>`;
    document.body.style.overflow = "hidden";
    modal
      .querySelector(".close-modal")
      ?.addEventListener("click", () => closeModal(), { once: true });
    requestAnimationFrame(() =>
      modal.querySelector("button,input")?.focus({ preventScroll: true }),
    );
  }
  lifetime.listen(modal, "click", (e) => {
    if (e.target === modal) closeModal();
  });
  lifetime.listen(document, "keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      const f = [
        ...modal.querySelectorAll("button:not(:disabled),input,select,a"),
      ].filter((e) => e.getClientRects().length);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) {
        e.preventDefault();
        f.at(-1).focus();
      } else if (!e.shiftKey && document.activeElement === f.at(-1)) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
  return {
    app,
    modal,
    toast,
    on,
    closeModal,
    openModal,
    destroy: () => lifetime.destroy(),
  };
}
