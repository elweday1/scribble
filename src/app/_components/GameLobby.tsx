"use client";
import { unstable_noStore as noStore } from "next/cache";
import { Players } from "~/app/_components/players";
import CopyToClipboard from "../_components/copy-to-clipboard";
import StartGameForm from "./start-game-form";
import { meta } from "~/constants/game";

export default function GameLobby(props: { gameId: string }) {
  noStore();
  const url = meta.link + props.gameId;
  return (
    <main className="flex w-full flex-1 flex-col items-center justify-center overflow-y-auto p-4 lg:p-8">
      <div className="flex w-full max-w-3xl flex-col gap-6 rounded-2xl bg-black/20 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm lg:p-10">
        <div className="space-y-2 text-center">
          <h1 className="bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 bg-clip-text pb-2 text-5xl font-extrabold text-transparent drop-shadow-sm lg:text-7xl">
            {meta.name}
          </h1>
          <p className="text-lg text-white/70">
            Waiting for friends to join...
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4">
          <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-white/50">
            Invite Link
          </h3>
          <CopyToClipboard copyText={url} />
        </div>

        <div className="flex flex-col gap-4">
          <div className="max-h-[40vh] min-h-[200px] overflow-y-auto rounded-xl border border-white/5 bg-white/5 p-4">
            <Players />
          </div>
          <div className="pt-2">
            <StartGameForm gameId={props.gameId} />
          </div>
        </div>
      </div>
    </main>
  );
}
