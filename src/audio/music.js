import { createLifetime } from "../core/lifetime.js";
/* Two original synthesized scores. The music context is separate from bite effects. */
export function createMusic() {
  const lifetime = createLifetime();
  const button = document.getElementById("soundBtn"),
    nextButton = document.getElementById("nextTrack"),
    label = document.getElementById("musicAction"),
    title = document.getElementById("trackName");
  const tunes = [
    [
      76, 79, 83, 81, 79, 76, 75, 71, 74, 78, 81, 79, 78, 74, 71, 66, 72, 76,
      79, 78, 76, 72, 71, 67, 69, 72, 78, 76, 74, 71, 75, 71, 76, 83, 86, 84,
      83, 79, 78, 75, 74, 81, 84, 83, 81, 78, 74, 71, 72, 79, 83, 81, 79, 76,
      74, 72, 71, 78, 81, 79, 78, 75, 71, 0,
    ],
    [
      72, 75, 79, 84, 82, 79, 75, 72, 74, 77, 81, 86, 84, 81, 77, 74, 71, 74,
      78, 83, 81, 78, 74, 71, 72, 79, 75, 84, 79, 75, 74, 71, 72, 0, 79, 0, 84,
      82, 79, 75, 74, 0, 81, 0, 86, 84, 81, 77, 71, 78, 74, 83, 81, 78, 74, 71,
      72, 75, 79, 84, 79, 75, 72, 0,
    ],
  ];
  const titles = ["南瓜糖果圆舞曲", "月亮躲猫猫"];
  let ctx,
    bus,
    timer,
    playing = false,
    wanted = false,
    track = 0,
    step = 0,
    next = 0,
    operation = 0;
  const voices = new Set();
  try {
    track = Number(localStorage.getItem("witch-track")) === 1 ? 1 : 0;
    wanted = localStorage.getItem("witch-music") !== "off";
  } catch {}
  function remember() {
    try {
      localStorage.setItem("witch-music", wanted ? "on" : "off");
      localStorage.setItem("witch-track", String(track));
    } catch {}
  }
  function ui() {
    button.classList.toggle("music-playing", playing);
    button.setAttribute("aria-pressed", String(playing));
    button.setAttribute(
      "aria-label",
      playing ? "暂停背景音乐" : "播放背景音乐",
    );
    button.title = titles[track] + (playing ? " · 点击暂停" : " · 点击播放");
    label.textContent = playing ? "暂停" : "播放";
    title.textContent = titles[track];
    button.dataset.audioState = ctx?.state || "not-started";
    document.querySelector(".music-dock").dataset.track = String(track + 1);
  }
  function note(m, t, d, v = 0.1, type = "sine") {
    if (!m) return;
    const o = ctx.createOscillator(),
      g = ctx.createGain();
    o.type = type;
    o.frequency.value = 440 * Math.pow(2, (m - 69) / 12);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g);
    g.connect(bus);
    voices.add(o);
    o.onended = () => {
      voices.delete(o);
      g.disconnect();
    };
    o.start(t);
    o.stop(t + d + 0.03);
  }
  function schedule() {
    if (!playing || ctx.state !== "running") return;
    while (next < ctx.currentTime + 0.3) {
      const beat = step % 6,
        bar = Math.floor(step / 6),
        root = (
          track
            ? [48, 53, 50, 55, 48, 56, 53, 55]
            : [52, 47, 48, 47, 52, 50, 48, 47]
        )[Math.floor(bar / 4) % 8];
      note(
        tunes[track][Math.floor(step / (track ? 2 : 3)) % 64],
        next,
        track ? 0.32 : 0.55,
        0.075,
        track ? "triangle" : "sine",
      );
      if (beat === 0) note(root, next, 0.65, 0.065, "triangle");
      if (beat === 2 || beat === 4) {
        note(root + 12, next, 0.32, 0.028);
        note(root + 15, next, 0.32, 0.022);
        note(root + 19, next, 0.32, 0.018);
      }
      if (step % 12 === 0) note(88 + (bar % 3), next, 1.1, 0.015);
      step++;
      next += track ? 0.2 : 0.23;
    }
  }
  function silence() {
    clearInterval(timer);
    for (const o of voices) {
      try {
        o.stop();
      } catch {}
    }
    voices.clear();
    if (bus) bus.gain.setValueAtTime(0, ctx.currentTime);
  }
  async function play() {
    const op = ++operation;
    wanted = true;
    playing = true;
    remember();
    ui();
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (!bus) {
        bus = ctx.createGain();
        bus.connect(ctx.destination);
      }
      await ctx.resume();
      if (op !== operation || !wanted) return;
      bus.gain.setValueAtTime(0.65, ctx.currentTime);
      next = ctx.currentTime + 0.04;
      schedule();
      clearInterval(timer);
      timer = setInterval(schedule, 120);
      ctx.onstatechange = ui;
      ui();
    } catch {
      if (op === operation) {
        playing = false;
        wanted = false;
        remember();
        ui();
        title.textContent = "未能播放，请再点一次";
      }
    }
  }
  function pause(user = true) {
    operation++;
    playing = false;
    if (user) wanted = false;
    silence();
    ctx
      ?.suspend()
      .then(ui)
      .catch(() => {});
    remember();
    ui();
  }
  lifetime.listen(button, "click", () => (playing ? pause() : play()));
  lifetime.listen(nextButton, "click", () => {
    operation++;
    silence();
    playing = false;
    track = (track + 1) % 2;
    step = 0;
    play();
  });
  lifetime.listen(
    document,
    "pointerdown",
    (e) => {
      if (!e.target.closest(".music-dock") && wanted && !playing) play();
    },
    { once: true },
  );
  lifetime.listen(document, "visibilitychange", () => {
    if (document.hidden) {
      if (playing) pause(false);
    } else if (wanted) play();
  });
  ui();
  return {
    destroy() {
      operation++;
      wanted = false;
      playing = false;
      silence();
      lifetime.destroy();
      ctx?.close();
    },
  };
}
