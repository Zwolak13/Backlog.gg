"use client";

import useEmblaCarousel from "embla-carousel-react";
import ProfileGameCard from "@/app/dashboard/profile/ProfileGameCard";

export default function ProfileCarousel({ items }) {
  const slides = [...items, ...items];

  const [emblaRef] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  return (
    <div className="embla max-w-full overflow-hidden px-4">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {slides.map((game, i) => (
            <div className="embla__slide" key={i}>
              <ProfileGameCard game={game} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
