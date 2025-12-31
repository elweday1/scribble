import { Avatar as AvatarName } from "~/machine";
import { cn } from "~/utils/cn";

export function Crown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="size-7 "
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z"
      ></path>
    </svg>
  );
}

type Size = "small" | "md" | "large" | "xl";
export const Avatar = (props: {
  avatar: AvatarName;
  rank?: number;
  size: Size;
}) => {
  const path = `/avatars/${props.avatar}.svg`;
  return (
    <span className="relative">
      {props.rank && (
        <span
          className={cn(
            "shadow-2 border-white-200 absolute flex size-[1.2rem] place-content-center place-items-center rounded-full border-2 shadow-xl shadow-black lg:size-[1.4rem] ",
            {
              "border-2 border-yellow-200 bg-yellow-500": props.rank == 1,
              "border-2 border-gray-200 bg-gray-500": props.rank == 2,
              "border-2 border-orange-200 bg-orange-700": props.rank == 3,
            },
          )}
        >
          {" "}
          {props.rank <= 3 ? <Crown /> : `#${props.rank}`}
        </span>
      )}

      <img
        className={cn("size-16 rounded-full p-1 lg:size-16", {
          "size-[1rem] lg:size-[1.4rem]": props.size === "small",
          "size-[1.5rem] lg:size-[1.8rem]": props.size === "md",
          "size-[2rem] lg:size-[2.3rem]": props.size === "large",
          "size-[3rem] lg:size-[3.5rem]": props.size === "xl",
        })}
        src={path}
        alt="avatar"
      />
    </span>
  );
};
