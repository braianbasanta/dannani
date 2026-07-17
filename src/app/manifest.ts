import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Da Nanni – Pizzería Napolitana en Barcelona",
    short_name: "Da Nanni",
    description:
      "Pizzería napolitana y restaurante italiano en Barcelona. 6 locales del Born a Gràcia.",
    start_url: "/",
    display: "browser",
    background_color: "#0a0f11",
    theme_color: "#0a0f11",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
