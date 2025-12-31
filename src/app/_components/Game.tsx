"use client";
import GameLobby from "~/app/_components/GameLobby";
import GameStarted from "~/app/_components/GameStarted";
import WordChoosing from "./choose";
import Leaderboard from "./leaderboard";
import { useEffect, useCallback } from "react";
import { useGameSyncedStore } from "~/data/gameStore";
import { local } from "~/constants/game";
import { useRouter } from "next/navigation";

export default function Home(props: { gameId: string }) {
  const { state, send, is, me } = useGameSyncedStore();
  const { avatar, name, id } = local.use();

  const addPlayer = useCallback(() => {
    send({ type: "join", name, avatar, roomId: props.gameId, id });
  }, [name, avatar, props.gameId, id]);

  useEffect(function onJoin() {
    addPlayer();
  }, []); // Run only once on mount

  useEffect(() => {
    const handler = () => send({ type: "leave", id });
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [id]);

  // Robust Timer Hook
  useEffect(() => {
    const interval = setInterval(() => {
      const ownerId = state.context.owner;
      const myId = id; // id from local.use()

      // Only the owner ticks the clock
      if (ownerId && ownerId === myId) {
        // Check if we need to decrement time
        if (
          (state.value === "game.running" && state.context.remainingTime > 0) ||
          (state.value === "game.word_choosing" &&
            state.context.word_choosing_time > 0) ||
          (state.value === "game.round_ended" &&
            state.context.leaderboard_time > 0)
        ) {
          send({ type: "decrement_time" });
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [
    state.context.owner,
    state.value,
    state.context.remainingTime,
    state.context.word_choosing_time,
    state.context.leaderboard_time,
    id,
  ]);

  return (
    <>
      {is("leaderboard") && <Leaderboard />}
      {is("word_choosing") && <WordChoosing />}
      {is("lobby") ? <GameLobby gameId={props.gameId} /> : <GameStarted />}
    </>
  );
}
