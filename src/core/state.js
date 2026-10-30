import { MENU } from "../data/menu.js";
import { loadDb } from "./persistence.js";
/** One explicit application state. Features own behaviour, never hidden copies. */
export const state = {
  db: loadDb(),
  theme: MENU[0],
  mode: "solo",
  phase: "home",
  selecting: 0,
  selected: null,
  secrets: [null, null],
  r: null,
  log: [],
  taste: null,
  scored: false,
  epoch: 0,
  transitioning: false,
  network: {
    peer: null,
    conn: null,
    roomCode: "",
    netSlot: 0,
    netNames: null,
    netConnected: false,
    netSeq: 0,
    myCommit: null,
    theirCommit: null,
    mySalt: null,
    mySecret: null,
    onlineStarted: false,
    joinTimer: null,
    generation: 0,
    verified: false,
    sessionScores: [0, 0],
  },
};
export const net = state.network;
