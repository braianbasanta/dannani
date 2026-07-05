"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { locations } from "@/data/locations";
import { LocationCard } from "@/components/LocationCard";

type Filter = "todos" | "conMesas" | "paraLlevar";

export function LocationList() {
  const [filter, setFilter] = useState<Filter>("todos");
  const t = useTranslations("filtros");

  const filtered = locations.filter((l) => {
    if (filter === "conMesas") return l.type === "dine-in";
    if (filter === "paraLlevar") return l.type === "take-away";
    return true;
  });

  const chip = (value: Filter, label: string) => (
    <button
      type="button"
      onClick={() => setFilter(value)}
      className={
        "rounded-full px-4 py-2 text-sm font-medium transition " +
        (filter === value
          ? "bg-teal-dark text-cream"
          : "bg-white text-teal-dark hover:bg-teal-dark/10")
      }
    >
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {chip("todos", t("todos"))}
        {chip("conMesas", t("conMesas"))}
        {chip("paraLlevar", t("paraLlevar"))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((location) => (
          <LocationCard key={location.slug} location={location} />
        ))}
      </div>
    </div>
  );
}
