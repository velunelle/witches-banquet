/** Own listeners and timers so replay/teardown cannot accumulate hidden work. */
export function createLifetime() {
  const controller = new AbortController();
  const timers = new Set();
  return {
    get signal() {
      return controller.signal;
    },
    listen(target, type, callback, options = {}) {
      target.addEventListener(type, callback, {
        ...options,
        signal: controller.signal,
      });
    },
    delay(callback, ms) {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!controller.signal.aborted) callback();
      }, ms);
      timers.add(id);
      return id;
    },
    cancel(id) {
      clearTimeout(id);
      timers.delete(id);
    },
    destroy() {
      controller.abort();
      for (const id of timers) clearTimeout(id);
      timers.clear();
    },
  };
}
