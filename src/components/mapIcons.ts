import L from "leaflet";

/** Iconos compartidos por los mapas Leaflet del sitio (mapa de locales de la home y mapa de cada local). Solo importar desde componentes cargados con ssr:false. */

export const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg"><path d="M17 1C8.2 1 1 8.2 1 17c0 11.6 16 26 16 26s16-14.4 16-26C33 8.2 25.8 1 17 1Z" fill="#4693aa" stroke="#fdfbf6" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="#d98e2b"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 42],
  popupAnchor: [0, -40],
});

export const userIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:#5599aa;border:3px solid #fdfbf6;box-shadow:0 0 0 6px rgba(85,153,170,.25)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
