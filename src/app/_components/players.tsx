"use client";

import { cn } from "~/utils/cn";
import { Avatar } from "./avatar";
import { useGameSyncedStore } from "~/data/gameStore";
import EditDialog from "./name-dialog";
import { ButtonHTMLAttributes, useState } from "react";
import { local } from "~/constants/game";

import React from "react";

function EditButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className="cursor-pointer justify-self-end ">
      <svg
        className=""
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          fillRule="evenodd"
          d="M14.279 2.152C13.909 2 13.439 2 12.5 2s-1.408 0-1.779.152a2.008 2.008 0 0 0-1.09 1.083c-.094.223-.13.484-.145.863a1.615 1.615 0 0 1-.796 1.353a1.64 1.64 0 0 1-1.579.008c-.338-.178-.583-.276-.825-.308a2.026 2.026 0 0 0-1.49.396c-.318.242-.553.646-1.022 1.453c-.47.807-.704 1.21-.757 1.605c-.07.526.074 1.058.4 1.479c.148.192.357.353.68.555c.477.297.783.803.783 1.361c0 .558-.306 1.064-.782 1.36c-.324.203-.533.364-.682.556a1.99 1.99 0 0 0-.399 1.479c.053.394.287.798.757 1.605c.47.807.704 1.21 1.022 1.453c.424.323.96.465 1.49.396c.242-.032.487-.13.825-.308a1.64 1.64 0 0 1 1.58.008c.486.28.774.795.795 1.353c.015.38.051.64.145.863c.204.49.596.88 1.09 1.083c.37.152.84.152 1.779.152s1.409 0 1.779-.152a2.008 2.008 0 0 0 1.09-1.083c.094-.223.13-.483.145-.863c.02-.558.309-1.074.796-1.353a1.64 1.64 0 0 1 1.579-.008c.338.178.583.276.825.308c.53.07 1.066-.073 1.49-.396c.318-.242.553-.646 1.022-1.453c.47-.807.704-1.21.757-1.605a1.99 1.99 0 0 0-.4-1.479c-.148-.192-.357-.353-.68-.555c-.477-.297-.783-.803-.783-1.361c0-.558.306-1.064.782-1.36c.324-.203.533-.364.682-.556a1.99 1.99 0 0 0 .399-1.479c-.053-.394-.287-.798-.757-1.605c-.47-.807-.704-1.21-1.022-1.453a2.026 2.026 0 0 0-1.49-.396c-.242.032-.487.13-.825.308a1.64 1.64 0 0 1-1.58-.008a1.615 1.615 0 0 1-.795-1.353c-.015-.38-.051-.64-.145-.863a2.007 2.007 0 0 0-1.09-1.083M12.5 15c1.67 0 3.023-1.343 3.023-3S14.169 9 12.5 9c-1.67 0-3.023 1.343-3.023 3s1.354 3 3.023 3"
          clipRule="evenodd"
        ></path>
      </svg>
    </button>
  );
}

export function KeyIcon() {
  return (
    <svg
      className="text-yellow-500"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M7 14c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m5.6-4c-.8-2.3-3-4-5.6-4c-3.3 0-6 2.7-6 6s2.7 6 6 6c2.6 0 4.8-1.7 5.6-4H16v4h4v-4h3v-4z"
      ></path>
    </svg>
  );
}

export const Players = () => {
  const { state, is } = useGameSyncedStore();
  const [open, setOpen] = useState(false);
  const lobby = state.value == "lobby";
  const players = Object.entries(state.context.players);
  const p = local.use();

  const isEmpty = players.length === 0;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col gap-2 rounded-xl bg-black/10 p-4 transition-all duration-300",
        {
          "overflow-y-auto lg:grid lg:auto-rows-min lg:grid-cols-2 lg:content-start":
            lobby,
          "flex-1 overflow-y-auto": !lobby,
        },
      )}
    >
      {<EditDialog open={open} setOpen={setOpen} />}

      {isEmpty && (
        <div className="flex h-32 flex-1 flex-col items-center justify-center opacity-50">
          <p className="text-sm font-medium">Waiting for players...</p>
        </div>
      )}

      {!isEmpty &&
        players.map(([id, { avatar, score, name, guessed }], index) => (
          <div
            key={index}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 flex items-center justify-between rounded-lg bg-white/5 p-2 transition-colors duration-300 hover:bg-white/10",
              {
                "bg-purple-500/10 ring-1 ring-purple-500": id === p.id,
                "w-full": lobby,
              },
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <Avatar
                rank={lobby ? undefined : index + 1}
                size="md"
                avatar={avatar}
              />
              <div className="flex min-w-0 flex-col">
                <span
                  className={cn("truncate text-sm font-bold", {
                    "text-green-400": guessed && !lobby,
                    "text-purple-400":
                      state.context.currentDrawer === id && !lobby,
                  })}
                >
                  {name}
                </span>
                {!lobby && (
                  <span className="text-xs text-white/50">{score} pts</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {id === state.context.owner && <KeyIcon />}
              {is("lobby") && id === p.id && (
                <EditButton onClick={() => setOpen(true)} />
              )}
            </div>
          </div>
        ))}
    </div>
  );
};
