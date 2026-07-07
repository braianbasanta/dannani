import { ReviewCard } from "./ReviewCard";

interface MarqueeReview {
  author: string;
  text: string;
  neighborhood: string;
  rating: number;
}

/* La animación recorre el 50% de la pista, así que con duración fija la
   velocidad dependería de cuántas reseñas haya (la home lleva ~63, un local
   ~10). Duración proporcional al nº de tarjetas = misma velocidad en todas. */
const SECONDS_PER_CARD = 10;

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
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-night to-transparent sm:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-night to-transparent sm:w-32" />

      <div
        className={`marquee-track flex w-max gap-4${
          reverse ? " marquee-track--reverse" : ""
        }`}
        style={{ animationDuration: `${items.length * SECONDS_PER_CARD}s` }}
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
