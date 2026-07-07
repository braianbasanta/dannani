const STAR_PATH =
  "M12 2.6l2.7 5.95 6.55.55-4.97 4.3 1.5 6.4L12 17.1 5.72 19.8l1.5-6.4L2.25 9.1l6.55-.55z";

function CardStars({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex gap-0.5"
      role="img"
      aria-label={`${rating} de 5 estrellas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill={i < rating ? "var(--color-mustard)" : "var(--color-cream)"}
          style={i < rating ? undefined : { opacity: 0.18 }}
          aria-hidden
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/* Wordmark de Google con sus colores de marca */
function GoogleMark() {
  const letters: [string, string][] = [
    ["G", "#4285F4"],
    ["o", "#EA4335"],
    ["o", "#FBBC05"],
    ["g", "#4285F4"],
    ["l", "#34A853"],
    ["e", "#EA4335"],
  ];
  return (
    <span
      className="select-none font-sans text-[0.95rem] font-semibold tracking-tight"
      aria-label="Google"
    >
      {letters.map(([ch, color], i) => (
        <span key={i} style={{ color }}>
          {ch}
        </span>
      ))}
    </span>
  );
}

const AVATAR_COLORS = [
  "#4693aa",
  "#b8791f",
  "#5c8a5f",
  "#8a5a3e",
  "#35aed6",
  "#a06a35",
];

function Avatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  const color = AVATAR_COLORS[initial.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-cream"
      style={{ backgroundColor: color }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

export function ReviewCard({
  author,
  text,
  neighborhood,
  rating,
}: {
  author: string;
  text: string;
  neighborhood: string;
  rating: number;
}) {
  return (
    <article className="flex h-[260px] w-[300px] shrink-0 flex-col rounded-[1.75rem] bg-night-soft p-6 shadow-card ring-1 ring-cream/10 sm:w-[340px]">
      <CardStars rating={rating} />
      <p className="mt-3.5 line-clamp-4 text-[0.95rem] leading-relaxed text-cream/80">
        {text}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-cream/10 pt-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={author} />
          <span className="min-w-0 truncate text-sm">
            <span className="block truncate font-medium text-cream">
              {author}
            </span>
            <span className="block truncate text-xs text-cream/55">
              Da Nanni {neighborhood}
            </span>
          </span>
        </div>
        <GoogleMark />
      </div>
    </article>
  );
}
