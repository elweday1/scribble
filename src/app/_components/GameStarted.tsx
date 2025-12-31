"use client";
import { unstable_noStore as noStore } from "next/cache";
import DrawingCanvas from "~/app/_components/drawing-canvas";
import { Players } from "~/app/_components/players";
import { TopBar } from "~/app/_components/topbar";
import { Chat } from "~/app/_components/chat";
import { meta } from "~/constants/game";

export default function GameStarted() {
  noStore();
  return (
    <main className="flex h-full w-full flex-col gap-4 overflow-hidden p-2 lg:p-4">
      <div className="flex shrink-0 items-center justify-between">
        <h1 className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-2xl font-bold text-transparent lg:text-4xl">
          {meta.name}
        </h1>
        {/* Potential place for a small status indicator or menu */}
      </div>
      <TopBar />
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-black/10 shadow-inner ring-1 ring-white/10">
          <DrawingCanvas />
        </div>
        <div className="flex h-1/3 min-h-0 shrink-0 flex-col gap-4 lg:h-auto lg:w-80 xl:w-96">
          <div className="flex min-h-0 flex-1 flex-col">
            <Players />
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
            <Chat />
          </div>
        </div>
      </div>
    </main>
  );
}
