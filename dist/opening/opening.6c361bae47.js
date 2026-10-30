/* Entrance interaction only; the parent fades the complete frame as one layer. */
(() => {
  const tell = (type, extra = {}) =>
    parent.postMessage(
      { type, ...extra },
      location.origin === "null" ? "*" : location.origin,
    );
  let ready = false,
    finished = false,
    armedAt = 0,
    start = null,
    progress = 0,
    raf = 0,
    wheel = 0,
    wheelTimer;
  const publish = () => {
    raf = 0;
    tell("between:opening-progress", { progress });
  };
  const update = (p) => {
    progress = Math.max(0, Math.min(1, p));
    if (!raf) raf = requestAnimationFrame(publish);
  };
  const finish = () => {
    if (!ready || finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    clearTimeout(wheelTimer);
    tell("between:opening-exit");
    document.body.style.pointerEvents = "none";
  };
  const cancel = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    progress = 0;
    tell("between:opening-cancel");
  };
  document.getElementById("skip").onclick = finish;
  document.addEventListener("keydown", (e) => {
    if (["Escape", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      finish();
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (
      !ready ||
      finished ||
      e.pointerType === "mouse" ||
      e.target.closest("button")
    )
      return;
    start = { id: e.pointerId, x: e.clientX, y: e.clientY, drag: false };
  });
  document.addEventListener(
    "pointermove",
    (e) => {
      if (!start || start.id !== e.pointerId || finished) return;
      const dx = e.clientX - start.x,
        dy = start.y - e.clientY;
      if (!start.drag && Math.abs(dx) > 18 && Math.abs(dx) > Math.abs(dy)) {
        start = null;
        cancel();
        return;
      }
      if (dy > 12 && dy > Math.abs(dx) * 1.2) start.drag = true;
      if (start.drag) {
        e.preventDefault();
        update(dy / Math.max(220, innerHeight * 0.52));
      }
    },
    { passive: false },
  );
  document.addEventListener("pointerup", (e) => {
    if (!start || start.id !== e.pointerId) return;
    const commit = start.drag && progress >= 0.16;
    start = null;
    if (commit) finish();
    else cancel();
  });
  document.addEventListener("pointercancel", () => {
    if (start) {
      start = null;
      cancel();
    }
  });
  document.addEventListener(
    "wheel",
    (e) => {
      if (
        !ready ||
        finished ||
        e.ctrlKey ||
        Math.abs(e.deltaX) > Math.abs(e.deltaY)
      )
        return;
      e.preventDefault();
      const dy =
        e.deltaY *
        (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
      wheel = Math.max(0, wheel + dy);
      update(wheel / 280);
      clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => {
        if (wheel >= 45) finish();
        else cancel();
        wheel = 0;
      }, 130);
    },
    { passive: false },
  );
  document.addEventListener("click", (e) => {
    if (
      e.pointerType === "touch" ||
      e.target.closest("button") ||
      performance.now() - armedAt < 650
    )
      return;
    if (matchMedia("(hover:hover)").matches) finish();
  });
  window.addEventListener("pagehide", () => {
    clearTimeout(wheelTimer);
    cancelAnimationFrame(raf);
  });
  // The iframe can be ready before its host has observed its load event.
  // Repeating readiness is idempotent; the host still validates frame and origin.
  window.addEventListener("message", (e) => {
    if (e.source !== parent || e.origin !== location.origin) return;
    if (ready && e.data?.type === "between:opening-ping")
      tell("between:opening-ready");
  });
  const stars = document.getElementById("starfield");
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = i % 3 ? "✧" : "✦";
    s.style.cssText = `--x:${4 + ((i * 37) % 92)}%;--y:${4 + ((i * 29) % 91)}%;--size:${9 + (i % 4) * 4}px;--color:${i % 2 ? "#f3cc91" : "#cfb4df"};--delay:${-(i % 7) * 0.27}s`;
    stars.append(s);
  }
  document.body.classList.add("preparing");
  let loaded = 0;
  const milestone = (promise) =>
    Promise.resolve(promise)
      .catch(() => {})
      .then(() => tell("between:opening-loading", { done: ++loaded }));
  const images = [...document.images];
  Promise.race([
    Promise.all([
      milestone(
        Promise.allSettled(
          images
            .filter((im) => im.classList.contains("opening-sticker"))
            .map((im) => im.decode()),
        ),
      ),
      milestone(
        Promise.allSettled(
          images
            .filter((im) => !im.classList.contains("opening-sticker"))
            .map((im) => im.decode()),
        ),
      ),
      milestone(document.fonts.ready),
      milestone(new Promise((resolve) => requestAnimationFrame(resolve))),
    ]),
    new Promise((r) => setTimeout(r, 2400)),
  ]).then(() => {
    document.body.classList.remove("preparing");
    ready = true;
    armedAt = performance.now();
    document.querySelector(".gesture-hint").textContent = matchMedia(
      "(hover:hover)",
    ).matches
      ? "滚动鼠标或点击，进入秘密晚餐"
      : "上滑开启秘密晚宴";
    tell("between:opening-ready");
  });
})();
