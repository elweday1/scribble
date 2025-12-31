"use client";
import NameForm from "./_components/name-form";
import { meta } from "~/constants/game";

export default function Home() {
  return (
    <main className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-2">
        <div className="mb-4 rounded-full bg-white/10 p-6 shadow-2xl ring-1 ring-white/20 backdrop-blur-md">
          <span className="block animate-bounce text-6xl">✏️</span>
        </div>
        <h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text pb-4 text-center text-5xl font-extrabold text-transparent drop-shadow-sm md:text-7xl lg:text-8xl">
          {meta.name}
        </h1>
        <p className="mt-2 max-w-md text-center text-xl text-indigo-200">
          The ultimate real-time drawing and guessing game.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-lg transition-colors duration-300 hover:bg-white/10">
        <NameForm />
      </div>
    </main>
  );
}
