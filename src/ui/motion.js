import { createLifetime } from "../core/lifetime.js";
import { asset } from "./helpers.js";
/** Visual effects own their DOM and cleanup, with no access to game secrets. */
export function createMotion() {
  const lifetime = createLifetime(),
    rm = matchMedia("(prefers-reduced-motion: reduce)");
  const bat = `<svg viewBox="0 0 120 66" fill="currentColor"><path class="wing wl" d="M59 36Q31 0 2 11Q16 22 11 40Q25 28 33 48Q45 34 58 51Z"/><path class="wing wr" d="M61 36Q89 0 118 11Q104 22 109 40Q95 28 87 48Q75 34 62 51Z"/><path d="M51 19L52 3L60 14L68 3L69 19Q82 43 66 57L60 65L54 57Q38 43 51 19"/><circle cx="56" cy="27" r="2" fill="#ffdc93"/><circle cx="65" cy="27" r="2" fill="#ffdc93"/></svg>`;
  let openingLifetime = null,
    transitionLifetime = null,
    lastStage = null;
  function pop(el, text) {
    if (!el) return;
    if (!rm.matches)
      el.animate(
        [
          { transform: "scale(.9) rotate(-3deg)" },
          { transform: "scale(1.07) rotate(2deg)", offset: 0.6 },
          { transform: "scale(1)" },
        ],
        { duration: 380, easing: "cubic-bezier(.2,.8,.3,1)" },
      );
    if (text) {
      const t = document.createElement("span");
      t.className = "comic-pop";
      t.textContent = text;
      el.append(t);
      lifetime.delay(() => t.remove(), 1000);
    }
  }
  function flock() {
    if (
      rm.matches ||
      document.hidden ||
      document.querySelector(".privacy-notice")
    )
      return;
    for (let i = 0; i < 4; i++) {
      const b = document.createElement("div");
      b.className = "flying-bat";
      b.innerHTML = bat;
      b.style.cssText = `--flight-y:${20 + i * 15}vh;--flight-delay:${i * 0.18}s;--bat-size:${36 + (i % 3) * 15}px;--flight-tilt:${i % 2 ? 8 : -8}deg`;
      document.body.append(b);
      lifetime.delay(() => b.remove(), 4300);
    }
  }
  function bite() {
    const p = document.querySelector(".hero-plate");
    p?.classList.add("chewing");
    pop(p, "啊——呜！");
    if (!rm.matches)
      p?.animate(
        [
          { transform: "rotate(-5deg) scale(1)" },
          { transform: "rotate(5deg) scale(.9)", offset: 0.35 },
          { transform: "rotate(-2deg) scale(1.04)", offset: 0.7 },
          { transform: "none" },
        ],
        { duration: 430 },
      );
  }
  function verdict(hit) {
    const c = document.querySelector(".taste-card");
    pop(document.querySelector(".speech-bubble"));
    document.querySelector(".hero-plate")?.classList.remove("chewing");
    c?.classList.add(hit ? "comic-disaster" : "comic-yummy");
    if (hit) flock();
  }
  function clearOpening() {
    openingLifetime?.destroy();
    openingLifetime = null;
    document.querySelector("#openingFrame")?.remove();
  }
  function opening() {
    clearOpening();
    document.body.classList.remove("opening-revealed");
    if (rm.matches) {
      document.documentElement.classList.remove("opening-boot");
      return;
    }
    document.documentElement.classList.add("opening-boot");
    const own = (openingLifetime = createLifetime()),
      f = document.createElement("iframe");
    f.id = "openingFrame";
    f.title = "女巫的紫色魔法开场";
    const underlay = document.querySelector("#app");
    let progress = 0,
      animationFrame = 0,
      exiting = false;
    const apply = (p) => {
      progress = p;
      f.style.transform = `translate3d(0,${-p * innerHeight * 0.72}px,0)`;
      f.style.opacity = String(1 - p);
      if (underlay) {
        underlay.style.transform = `translate3d(0,${(1 - p) * Math.min(80, innerHeight * 0.1)}px,0)`;
        underlay.style.opacity = String(0.45 + p * 0.55);
      }
    };
    const restore = () => {
      if (underlay) {
        underlay.style.removeProperty("transform");
        underlay.style.removeProperty("opacity");
      }
    };
    window.scrollTo({ top: 0, behavior: "instant" });
    const finish = () => {
      if (openingLifetime !== own) return;
      document.documentElement.classList.remove("opening-boot");
      restore();
      clearOpening();
    };
    const loader = document.querySelector("#bootLoader"),
      count = document.querySelector("#bootCount");
    loader?.style.setProperty("--load", "0");
    if (count) count.textContent = "0 / 4";
    let ready = false;
    const continueButton = document.querySelector("#bootContinue"),
      loadingMessage = document.querySelector("#bootMessage");
    if (continueButton) continueButton.hidden = true;
    if (loadingMessage) loadingMessage.textContent = "正在点亮秘密晚餐";
    // A stalled frame must not silently skip the opening or trap the player.
    const watchdog = own.delay(() => {
      if (loadingMessage) loadingMessage.textContent = "开场加载较慢，可以先进入晚宴";
      if (continueButton) continueButton.hidden = false;
    }, 15000);
    if (continueButton) own.listen(continueButton, "click", finish);
    own.listen(f, "load", () => {
      f.contentWindow?.postMessage(
        { type: "between:opening-ping" },
        location.origin === "null" ? "*" : location.origin,
      );
    });
    const settle = (target, complete = false) => {
      cancelAnimationFrame(animationFrame);
      const from = progress,
        start = performance.now(),
        duration = complete ? 760 - from * 180 : 300;
      const tick = (now) => {
        if (openingLifetime !== own) return;
        const t = Math.min(1, (now - start) / duration),
          ease = 1 - Math.pow(1 - t, 3);
        apply(from + (target - from) * ease);
        if (t < 1) animationFrame = requestAnimationFrame(tick);
        else if (complete) finish();
      };
      animationFrame = requestAnimationFrame(tick);
    };
    own.listen(window, "message", (e) => {
      if (
        e.source !== f.contentWindow ||
        e.origin !== location.origin ||
        openingLifetime !== own
      )
        return;
      const d = e.data;
      if (
        d?.type === "between:opening-loading" &&
        Number.isInteger(d.done) &&
        d.done >= 0 &&
        d.done <= 4
      ) {
        loader?.style.setProperty("--load", String(d.done / 4));
        if (count) count.textContent = `${d.done} / 4`;
      }
      if (d?.type === "between:opening-ready" && !ready) {
        ready = true;
        own.cancel(watchdog);
        own.delay(
          () => document.documentElement.classList.remove("opening-boot"),
          320,
        );
      }
      if (
        d?.type === "between:opening-progress" &&
        !exiting &&
        Number.isFinite(d.progress)
      ) {
        cancelAnimationFrame(animationFrame);
        apply(Math.max(0, Math.min(0.9, d.progress)));
      }
      if (d?.type === "between:opening-cancel" && !exiting) settle(0);
      if (d?.type === "between:opening-exit" && !exiting) {
        exiting = true;
        document.documentElement.classList.remove("opening-boot");
        settle(1, true);
      }
      if (d?.type === "between:opening-error") finish();
    });
    own.signal.addEventListener(
      "abort",
      () => {
        cancelAnimationFrame(animationFrame);
        restore();
      },
      { once: true },
    );
    if (window.SUPPER_OPENING_HTML)
      f.srcdoc = window.SUPPER_OPENING_HTML.replace(
        /\.\.\/(assets\/[^\s"'()<>]+)/g,
        (_, path) => asset(path),
      );
    else f.src = "opening/index.html?v=1.0.0";
    document.body.append(f);
  }
  function cancelTransition() {
    transitionLifetime?.destroy();
    transitionLifetime = null;
    document.body.classList.remove("new-transition");
    document.querySelector("#sceneTransition").replaceChildren();
  }
  function transition(text, fn) {
    cancelTransition();
    const own = (transitionLifetime = createLifetime()),
      el = document.querySelector("#sceneTransition");
    el.innerHTML =
      '<div class="magic-wipe"><div class="orbit">✦<i>✧</i></div><div class="turning-seal">☾</div><b></b></div>';
    el.querySelector("b").textContent = text;
    document.body.classList.add("new-transition");
    own.delay(fn, rm.matches ? 0 : 340);
    own.delay(cancelTransition, rm.matches ? 20 : 800);
  }
  const observer = new MutationObserver((ms) => {
    for (const m of ms)
      for (const n of m.addedNodes) {
        if (n.nodeType !== 1 || !n.matches(".stage") || rm.matches) continue;
        const phase = document.body.dataset.phase;
        if (phase === lastStage) continue;
        lastStage = phase;
        n.querySelectorAll(".dish").forEach((d, i) =>
          d.animate(
            [
              { opacity: 0, transform: "translateY(17px) scale(.94)" },
              { opacity: 1, transform: "none" },
            ],
            {
              duration: 380,
              delay: i * 18,
              easing: "cubic-bezier(.2,.85,.3,1)",
              fill: "backwards",
            },
          ),
        );
      }
  });
  observer.observe(document.querySelector("#app"), { childList: true });
  const replay = document.createElement("button");
  replay.className = "replay-magic";
  replay.textContent = "✦ 重播小魔法";
  lifetime.listen(replay, "click", opening);
  document.querySelector("footer").prepend(replay);
  lifetime.listen(document, "pointermove", (e) => {
    if (e.pointerType === "touch" || rm.matches) return;
    const c = e.target.closest(".witch-card");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty(
      "--rx",
      ((e.clientY - r.top) / r.height - 0.5) * -8 + "deg",
    );
    c.style.setProperty(
      "--ry",
      ((e.clientX - r.left) / r.width - 0.5) * 8 + "deg",
    );
  });
  lifetime.listen(document, "pointerout", (e) => {
    const c = e.target.closest(".witch-card");
    if (c && !c.contains(e.relatedTarget)) {
      c.style.removeProperty("--rx");
      c.style.removeProperty("--ry");
    }
  });
  lifetime.listen(document, "visibilitychange", () =>
    document.body.classList.toggle("motion-paused", document.hidden),
  );
  const scenery = document.createElement("div");
  scenery.className = "banquet-scenery";
  scenery.setAttribute("aria-hidden", "true");
  const stickers = [
    ["cat", "cat-large"],
    ["ghost-lantern", "ghost-small"],
    ["lantern", "lantern-large"],
    ["cauldron", "cauldron-mid"],
    ["potion", "potion-small"],
  ];
  scenery.innerHTML =
    '<div class="bg-paper paper-one"></div><div class="bg-paper paper-two"></div><div class="bg-paper paper-three"></div><div class="bg-ticket ticket-one"></div><div class="bg-ticket ticket-two"></div>' +
    stickers
      .map(([file, cls], i) => {
        const src = asset("assets/journal-v5/" + file + ".png");
        return `<div class="bg-sticker ${cls}" style="--cutout:url('${src}');--lag:${-i * 1.37}s"><img src="${src}" alt=""></div>`;
      })
      .join("") +
    '<i class="bg-star star-one">✦</i><i class="bg-star star-two">✧</i><i class="bg-star star-three">✦</i><i class="bg-star star-four">✧</i>';
  document.body.append(scenery);
  opening();
  return {
    pop,
    flock,
    bite,
    verdict,
    opening,
    transition,
    cancelTransition,
    destroy() {
      clearOpening();
      cancelTransition();
      observer.disconnect();
      lifetime.destroy();
      replay.remove();
      scenery.remove();
      document
        .querySelectorAll(".flying-bat,.comic-pop,.taste-particle")
        .forEach((n) => n.remove());
    },
  };
}
