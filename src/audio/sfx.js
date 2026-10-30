export function createSfx() {
  let sound = true,
    audio = null;
  function sfx(kind = "safe") {
    if (!sound) return;
    try {
      audio = audio || new AudioContext();
      audio.resume();
      if (kind === "bite") {
        const buf = audio.createBuffer(
            1,
            Math.floor(audio.sampleRate * 0.13),
            audio.sampleRate,
          ),
          arr = buf.getChannelData(0);
        for (let i = 0; i < arr.length; i++)
          arr[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / arr.length, 3);
        const ns = audio.createBufferSource(),
          gain = audio.createGain(),
          filter = audio.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1900;
        gain.gain.value = 0.1;
        ns.buffer = buf;
        ns.connect(filter);
        filter.connect(gain);
        gain.connect(audio.destination);
        ns.start();
      }
      let fs =
        kind === "poison"
          ? [392, 329.63, 233.08]
          : kind === "victory"
            ? [523, 659, 784, 1047]
            : kind === "bite"
              ? [1000, 720, 480]
              : [659, 880];
      fs.forEach((f, i) => {
        const o = audio.createOscillator(),
          g = audio.createGain(),
          at = audio.currentTime + i * 0.105;
        o.type = kind === "bite" ? "triangle" : "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.04, at + 0.01);
        g.gain.exponentialRampToValueAtTime(
          0.001,
          at + (kind === "bite" ? 0.07 : 0.43),
        );
        o.connect(g);
        g.connect(audio.destination);
        o.start(at);
        o.stop(at + 0.45);
      });
    } catch {}
  }
  return {
    play: sfx,
    destroy() {
      audio?.close();
      audio = null;
    },
  };
}
