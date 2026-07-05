import { ReviewCard } from "./ReviewCard";

interface MarqueeReview {
  author: string;
  text: string;
  neighborhood: string;
  rating: number;
}

function MarqueeRow({
  items,
  reverse = false,
}: {
  items: MarqueeReview[];
  reverse?: boolean;
}) {
  const loop = [...items, ...items];
  return (
    <div className="marquee relative overflow-hidden py-2">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent sm:w-32" />

      <div
        className={`marquee-track flex w-max gap-4${
          reverse ? " marquee-track--reverse" : ""
        }`}
      >
        {loop.map((review, i) => (
          <div key={`${review.author}-${i}`} aria-hidden={i >= items.length}>
            <ReviewCard
              author={review.author}
              text={review.text}
              neighborhood={review.neighborhood}
              rating={review.rating}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewsMarquee({ reviews }: { reviews: MarqueeReview[] }) {
  return <MarqueeRow items={reviews} />;
}
