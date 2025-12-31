"use client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselApi,
} from "./ui/carousel";
import { useEffect, useState } from "react";
import { avatars, AvatarName } from "~/constants/avatars";
import { Avatar } from "./avatar";
import { local } from "~/constants/game";
import { cn } from "~/utils/cn";

export const AvatarSwitcher = () => {
  const [api, setApi] = useState<CarouselApi>();
  const { avatar } = local.use();
  const setAvatar = (a: AvatarName) => local.set("avatar", a);
  const currentIndex = avatars.indexOf(avatar);
  useEffect(() => {
    api?.on("scroll", () => {
      const idx = api.selectedScrollSnap();
      setAvatar(avatars[idx] as AvatarName);
    });
    api?.scrollTo(currentIndex);
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      className="mx-auto w-full max-w-xs"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {avatars.map((av, i) => (
          <CarouselItem
            key={av}
            className="flex basis-1/3 justify-center py-8 pl-2 md:basis-1/5 md:pl-4"
          >
            <div
              className={cn("transition-transform duration-300 ease-out", {
                "z-10 scale-150": i === api?.selectedScrollSnap(),
                "scale-75 opacity-50": i !== api?.selectedScrollSnap(),
              })}
            >
              <Avatar key={i} size="xl" avatar={av} />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="-left-4 border-0 bg-white/10 hover:bg-white/20" />
      <CarouselNext className="-right-4 border-0 bg-white/10 hover:bg-white/20" />
    </Carousel>
  );
};
