import { useSyncedStore } from "@syncedstore/react";
import { getRandomWords } from "./words";
import {
  store,
  Events,
  Player,
  connect,
  local,
  Event,
  initialState,
  delays,
  ExtractPaload,
  Payload,
  EventName,
} from "~/constants/game";
import { observeDeep } from "@syncedstore/core";

function oneOf<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)] as T;
}

type Guard = keyof typeof guards;

const is = (guard: Guard) => {
  const cond = guards[guard];
  return cond ? cond() : false;
};

function repeat(params: {
  run: () => void;
  every: number;
  until: Guard;
  delay?: number;
}) {
  setTimeout(() => {
    if (!is(params.until)) {
      params.run();
      repeat({ ...params, delay: undefined });
    }
  }, params.delay || params.every);
}

const send = (event: Event) => {
  const action = actions[event.type];
  const { type, ...payload } = event;
  if (!action) {
    throw new Error(`Unknown event type: ${event.type}`);
  }
  // @ts-ignore
  action({ payload });
};

const waitFor = (delay: keyof typeof delays | number, cb: () => void) => {
  const time = typeof delay === "string" ? delays[delay] : delay;
  return setTimeout(cb, time);
};

const guards = {
  round_running: () =>
    store.state.value === "game.running" &&
    store.state.context.remainingTime > 0,
  game_running: () => store.state.value === "game.running",
  myturn: () => store.state.context.currentDrawer === local.atom.get().id,
  leaderboard: () =>
    store.state.value == "game.round_ended" || store.state.value == "done",
  lobby: () => store.state.value === "lobby",
  owner: () => store.state.context.owner === local.atom.get().id,
  all_guessed: () =>
    Object.entries(store.state.context.players)
      .filter(([id, _]) => id !== store.state.context.currentDrawer)
      .every(([_, p]) => p.guessed),
  time_up: () => store.state.context.remainingTime <= 0,
  round_over: () => store.state.value === "game.round_ended",
  word_choosing: () => store.state.value === "game.word_choosing",
  rounds_not_over: () => store.state.context.roundsLeft > 0,
  has_players: () => Object.keys(store.state.context.players).length > 0,
  enough_players: () => Object.keys(store.state.context.players).length > 0,
  room_not_full: () =>
    Object.keys(store.state.context.players).length >=
    store.state.context.config.maxPlayers,
  has_owner: () => store.state.context.owner !== "",
  word_choosing_running: () => store.state.context.word_choosing_time > 0,
  game_over: () => store.state.value === "done",
  owner_in_room: () =>
    Object.keys(store.state.context.players).includes(
      store.state.context.owner,
    ),
} as const;

const actions: Events = {
  create_room: ({ payload }) => {
    store.state.context.gameId = payload.roomId;
    store.state.context.owner = local.get("id");
    local.set("error", null);
  },

  start_game: ({ payload }) => {
    console.log("Action: start_game triggered", payload);
    store.state.context.gameId = payload.gameId;
    // Set first player as drawer explicitly
    const players = Object.keys(store.state.context.players);
    console.log("Players found:", players);

    if (players.length > 0) {
      store.state.context.currentDrawer = players[0];
    } else {
      console.warn("No players to assign drawer!");
    }

    store.state.context.roundsLeft = store.state.context.config.rounds;
    store.state.context.remainingTime = store.state.context.config.roundTime;
    Object.values(store.state.context.players).map((p) => (p.score = 0));
    store.state.context.guesses = [];

    // Timer is now handled by the global interval

    console.log("Sending start_word_choosing...");
    send({ type: "start_word_choosing" });
  },
  end_game: () => {
    store.state.value = "done";
  },
  start_round: () => {
    store.state.canvas = initialState.canvas;
    store.state.value = "game.running";
  },
  calculate_increase: () => {
    const players = Object.entries(store.state.context.players);
    const guessers = players
      .filter(
        ([id, player]) =>
          player.guessed && id !== store.state.context.currentDrawer,
      )
      .sort(
        ([__, a], [_, b]) => (a.timeStamp as number) - (b.timeStamp as number),
      );
    const nguessers = guessers.length;
    const nplayers = players.length;
    const ROUND_TIME = store.state.context.config.roundTime;
    const BASE_SCORE = 100;
    const THRESHOLD = 0.15;
    const MAX_SCORE = 300;
    const EXPONENT = Math.log(BASE_SCORE / MAX_SCORE) / -ROUND_TIME;

    if (nguessers === 0) {
      // @ts-ignore
      store.state.context.players[store.state.context.currentDrawer].increase =
        -BASE_SCORE;
      return;
    }
    guessers.forEach(([id, player], idx) => {
      const weighted_time =
        (1 - THRESHOLD) * store.state.context.config.roundTime;
      if (nguessers === 1 && nplayers > 1) {
        player.increase = MAX_SCORE;
      } else if (store.state.context.remainingTime >= weighted_time) {
        player.increase = MAX_SCORE;
      } else {
        const elapsed = ROUND_TIME - store.state.context.remainingTime;
        const score = Math.floor(BASE_SCORE * Math.exp(-EXPONENT * elapsed));
        player.increase = score;
      }
    });
    // @ts-ignore
    store.state.context.players[store.state.context.currentDrawer].increase =
      Math.floor((nguessers / nplayers) * MAX_SCORE);
  },
  update_scores: () => {
    Object.values(store.state.context.players).forEach((p) => {
      const unit = p.increase > 0 ? 1 : p.increase < 0 ? -1 : 0;
      p.increase -= unit;
      p.score += unit;
    });
  },
  update_drawer: () => {
    const keys = Object.keys(store.state.context.players);
    const drawerIndex = keys.findIndex(
      (id) => id === store.state.context.currentDrawer,
    );
    const index = (drawerIndex + 1) % keys.length;
    store.state.context.currentDrawer = keys[index] as string;
    if (index === 0) {
      store.state.context.roundsLeft -= 1;
    }
  },
  reset_players: () => {
    Object.keys(store.state.context.players).forEach((id) => {
      const player = store.state.context.players[id] as Player;
      player.guessed = false;
      player.drawingRating = undefined;
      player.timeStamp = undefined;
    });

    // @ts-ignore
    const drawer = store.state.context.players[
      store.state.context.currentDrawer
    ] as Player;
    drawer.guessed = true;
  },
  end_round: () => {
    send({ type: "calculate_increase" });
    send({ type: "update_drawer" });
    send({ type: "reset_players" });
    send({ type: "calculate_increase" });
    send({ type: "update_drawer" });
    send({ type: "reset_players" });

    // Set leaderboard time for the countdown
    store.state.context.leaderboard_time = delays.leaderboard / 1000;
    store.state.value = "game.round_ended";
    store.state.context.remainingTime = store.state.context.config.roundTime;
  },
  choose_word: ({ payload }) => {
    store.state.value = "game.running";
    store.state.context.currentWord = payload.word;
    send({ type: "start_round" });
  },
  pick_random_word: () => {
    send({ type: "choose_word", word: oneOf(store.state.context.wordOptions) });
  },
  join: ({ payload }) => {
    if (
      Object.keys(store.state.context.players).length >=
      store.state.context.config.maxPlayers
    ) {
      // Room is full
      return;
    }
    // Also prevent joining if game is already running (optional but robust)
    // Prevent joining if game is running is optional
    if (store.state.value.startsWith("game.")) {
      // Allow join for now
    }

    // Check if player already exists
    if (!store.state.context.players[payload.id]) {
      local.set("id", payload.id);
      connect(payload.roomId);
      store.state.context.players[payload.id] = {
        name: payload.name,
        avatar: payload.avatar,
        score: 0,
        guessed: false,
        increase: 0,
      };
    } else {
      // Just connect to sync
      local.set("id", payload.id);
      connect(payload.roomId);
    }
  },
  leave: () => {
    const id = local.get("id");
    const isOwner = store.state.context.owner === id;
    if (isOwner) {
      const owner = Object.keys(store.state.context.players).find(
        (id) => id !== store.state.context.owner,
      ) as string;
      store.state.context.owner = owner;
    }
    Object.hasOwn(store.state.context.players, id)
      ? delete store.state.context.players[id]
      : null;
    // Do NOT disconnect, as this resets the syncedStore state for other components?
    // Actually disconnect is fine but we should be careful about state access after.
    local.get("conn")?.disconnect();
  },
  rate_drawing: ({ payload }) => {
    (store.state.context.players[payload.player_id] as Player).drawingRating =
      payload.rating;
  },
  guess: ({ payload }) => {
    const player = store.state.context.players[payload.id];
    if (!player) return;
    const newGuess = {
      word: payload.word,
      id: payload.id,
      round: store.state.context.config.rounds - store.state.context.roundsLeft,
      timestamp: store.state.context.remainingTime,
    };
    store.state.context?.guesses.push(newGuess);
    const correct = store.state.context.currentWord === payload.word;
    if (!player.guessed && correct && store.state.context.players[payload.id]) {
      player.guessed = true;
      player.timeStamp = store.state.context.remainingTime;
    }
  },
  decrement_time: () => {
    // Throttle checks
    const THROTTLE_MS = 900;
    const now = Date.now();
    if (now - store.state.context.lastTick < THROTTLE_MS) {
      return;
    }

    // Update Tick
    store.state.context.lastTick = now;

    if (is("round_running")) {
      store.state.context.remainingTime -= 1;
    }
    if (is("word_choosing") && is("word_choosing_running")) {
      store.state.context.word_choosing_time -= 1;
    }
    // New logic for leaderboard countdown
    if (
      store.state.value === "game.round_ended" &&
      store.state.context.leaderboard_time > 0
    ) {
      store.state.context.leaderboard_time -= 1;
    }
  },
  start_word_choosing: () => {
    console.log("Action: start_word_choosing triggered");
    const context = store.state.context;
    context.wordOptions = getRandomWords(3);
    context.word_choosing_time = delays.word_choosing / 1000;
    store.state.value = "game.word_choosing";
    console.log("State value set to game.word_choosing");
  },
  remove_room: () => {
    const conn = local.get("conn");
    conn?.doc.destroy();
    conn?.destroy();
  },
};

// Ensure owner is set immediately if null to avoid race conditions
const ensureOwner = () => {
  const state = store.state;
  // If we have players but no owner, or owner is not in list
  if (Object.keys(state.context.players).length > 0) {
    if (!state.context.owner || !state.context.players[state.context.owner]) {
      // Assign new owner
      state.context.owner = Object.keys(state.context.players)[0];
    }
  }
};

const rules: Record<string, () => boolean> = {
  ENSURE_PLAYERS_COUNT: () => {
    // Only run if we are synced to avoid wiping state on load
    const conn = local.atom.get().conn;
    if (!conn?.synced) return false;

    if (!is("lobby") && !is("enough_players")) {
      store.state.value = "lobby";
      return true;
    }
    return false;
  },
  ENSURE_OWNER: () => {
    const conn = local.atom.get().conn;
    if (!conn?.synced) return false;

    ensureOwner(); // Helper called
    // Original logic
    if (is("has_players") && (!is("has_owner") || !is("owner_in_room"))) {
      store.state.context.owner = Object.keys(
        store.state.context.players,
      )[0] as string;
      return true;
    }
    return false;
  },
  ENSURE_ROUND_END: () => {
    const conn = local.atom.get().conn;
    if (!conn?.synced) return false;

    if (is("game_running") && (is("all_guessed") || is("time_up"))) {
      console.log(store.state.value, store.state.context.remainingTime);
      send({ type: "end_round" });
      return true;
    }
    return false;
  },
  ENSURE_WORD_CHOSEN: () => {
    const conn = local.atom.get().conn;
    if (!conn?.synced) return false;

    if (is("word_choosing") && !is("word_choosing_running")) {
      send({ type: "pick_random_word" });
      return true;
    }
    return false;
  },
  ENSURE_DESTROYED: () => {
    const conn = local.atom.get().conn;
    if (!conn?.synced) return false;

    if (!is("has_players")) {
      waitFor(5000, () => {
        if (!is("has_players")) {
          send({ type: "remove_room" });
        }
      });
      return true;
    }
    return false;
  },
  ENSURE_NEXT_ROUND: () => {
    const conn = local.atom.get().conn;
    if (!conn?.synced) return false;

    // Transition from leaderboard when time is up
    if (
      store.state.value === "game.round_ended" &&
      store.state.context.leaderboard_time <= 0
    ) {
      send({
        type: is("rounds_not_over") ? "start_word_choosing" : "end_game",
      });
      return true;
    }
    return false;
  },
};

observeDeep(store, () => {
  Object.entries(rules).forEach(([ruleName, rule]) => {
    const success = rule();
    if (success) {
      console.log(" Game rule succeeded ", ruleName);
    }
  });
});

export const useGameSyncedStore = () => {
  const { state } = useSyncedStore(store);
  const me = local.use();
  return { state, send, me, is } as const;
};

// Global Timer Loop for Robustness
