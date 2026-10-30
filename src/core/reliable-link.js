/** In-memory ordered journal: ACK only after applying; reconnect replays unacked events.
 * No game snapshot is transmitted, so a reconnect cannot reveal hidden state.
 */
export function createReliableLink({
  session,
  apply,
  write,
  onFault = () => {},
}) {
  let sent = 0,
    received = 0,
    processing = false,
    stopped = false;
  const outbox = new Map(),
    inbox = new Map();
  const emit = (packet) => {
    if (!stopped) write({ ...packet, session, protocol: 3 });
  };
  async function drain() {
    if (processing || stopped) return;
    processing = true;
    try {
      while (!stopped && inbox.has(received + 1)) {
        const no = received + 1,
          value = inbox.get(no);
        await apply(value);
        if (stopped) break;
        inbox.delete(no);
        received = no;
        emit({ kind: "ack", ack: received });
      }
    } catch (error) {
      onFault(error);
    } finally {
      processing = false;
    }
  }
  return {
    send(value) {
      if (stopped || outbox.size >= 128) return false;
      const packet = { kind: "event", seq: ++sent, value };
      outbox.set(sent, packet);
      emit(packet);
      return true;
    },
    receive(packet) {
      if (stopped || packet?.protocol !== 3 || packet.session !== session)
        return;
      if (packet.kind === "ack") {
        if (
          !Number.isSafeInteger(packet.ack) ||
          packet.ack < 0 ||
          packet.ack > sent
        )
          return;
        for (const no of outbox.keys()) if (no <= packet.ack) outbox.delete(no);
      } else if (packet.kind === "event") {
        if (
          !Number.isSafeInteger(packet.seq) ||
          packet.seq < 1 ||
          packet.seq > received + 128
        )
          return;
        if (packet.seq <= received) emit({ kind: "ack", ack: received });
        else {
          if (!inbox.has(packet.seq)) inbox.set(packet.seq, packet.value);
          void drain();
        }
      }
    },
    replay() {
      emit({ kind: "ack", ack: received });
      for (const packet of outbox.values()) emit(packet);
    },
    get pending() {
      return outbox.size;
    },
    destroy() {
      stopped = true;
      outbox.clear();
      inbox.clear();
    },
  };
}
