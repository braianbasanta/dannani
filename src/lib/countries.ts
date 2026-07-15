/**
 * Prefijos telefónicos por país para el selector del formulario de reserva.
 * España primero (default), luego los orígenes más habituales de clientes en
 * Barcelona y una selección amplia del resto del mundo. `iso` es la clave única
 * del <option> (evita colisiones cuando dos países comparten prefijo, p. ej. +1).
 */
export interface Country {
  iso: string;
  name: string;
  dial: string;
  flag: string;
}

export const DEFAULT_COUNTRY_ISO = "ES";

export const countries: Country[] = [
  { iso: "ES", name: "España", dial: "+34", flag: "🇪🇸" },
  { iso: "FR", name: "Francia", dial: "+33", flag: "🇫🇷" },
  { iso: "IT", name: "Italia", dial: "+39", flag: "🇮🇹" },
  { iso: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧" },
  { iso: "DE", name: "Alemania", dial: "+49", flag: "🇩🇪" },
  { iso: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { iso: "NL", name: "Países Bajos", dial: "+31", flag: "🇳🇱" },
  { iso: "BE", name: "Bélgica", dial: "+32", flag: "🇧🇪" },
  { iso: "CH", name: "Suiza", dial: "+41", flag: "🇨🇭" },
  { iso: "AT", name: "Austria", dial: "+43", flag: "🇦🇹" },
  { iso: "IE", name: "Irlanda", dial: "+353", flag: "🇮🇪" },
  { iso: "US", name: "Estados Unidos", dial: "+1", flag: "🇺🇸" },
  { iso: "CA", name: "Canadá", dial: "+1", flag: "🇨🇦" },
  { iso: "SE", name: "Suecia", dial: "+46", flag: "🇸🇪" },
  { iso: "NO", name: "Noruega", dial: "+47", flag: "🇳🇴" },
  { iso: "DK", name: "Dinamarca", dial: "+45", flag: "🇩🇰" },
  { iso: "FI", name: "Finlandia", dial: "+358", flag: "🇫🇮" },
  { iso: "IS", name: "Islandia", dial: "+354", flag: "🇮🇸" },
  { iso: "PL", name: "Polonia", dial: "+48", flag: "🇵🇱" },
  { iso: "CZ", name: "Chequia", dial: "+420", flag: "🇨🇿" },
  { iso: "GR", name: "Grecia", dial: "+30", flag: "🇬🇷" },
  { iso: "RO", name: "Rumanía", dial: "+40", flag: "🇷🇴" },
  { iso: "HU", name: "Hungría", dial: "+36", flag: "🇭🇺" },
  { iso: "HR", name: "Croacia", dial: "+385", flag: "🇭🇷" },
  { iso: "RU", name: "Rusia", dial: "+7", flag: "🇷🇺" },
  { iso: "UA", name: "Ucrania", dial: "+380", flag: "🇺🇦" },
  { iso: "TR", name: "Turquía", dial: "+90", flag: "🇹🇷" },
  { iso: "MX", name: "México", dial: "+52", flag: "🇲🇽" },
  { iso: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { iso: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷" },
  { iso: "CL", name: "Chile", dial: "+56", flag: "🇨🇱" },
  { iso: "CO", name: "Colombia", dial: "+57", flag: "🇨🇴" },
  { iso: "PE", name: "Perú", dial: "+51", flag: "🇵🇪" },
  { iso: "UY", name: "Uruguay", dial: "+598", flag: "🇺🇾" },
  { iso: "VE", name: "Venezuela", dial: "+58", flag: "🇻🇪" },
  { iso: "EC", name: "Ecuador", dial: "+593", flag: "🇪🇨" },
  { iso: "MA", name: "Marruecos", dial: "+212", flag: "🇲🇦" },
  { iso: "DZ", name: "Argelia", dial: "+213", flag: "🇩🇿" },
  { iso: "TN", name: "Túnez", dial: "+216", flag: "🇹🇳" },
  { iso: "EG", name: "Egipto", dial: "+20", flag: "🇪🇬" },
  { iso: "ZA", name: "Sudáfrica", dial: "+27", flag: "🇿🇦" },
  { iso: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { iso: "AE", name: "Emiratos Árabes", dial: "+971", flag: "🇦🇪" },
  { iso: "SA", name: "Arabia Saudí", dial: "+966", flag: "🇸🇦" },
  { iso: "QA", name: "Catar", dial: "+974", flag: "🇶🇦" },
  { iso: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { iso: "JP", name: "Japón", dial: "+81", flag: "🇯🇵" },
  { iso: "KR", name: "Corea del Sur", dial: "+82", flag: "🇰🇷" },
  { iso: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { iso: "TH", name: "Tailandia", dial: "+66", flag: "🇹🇭" },
  { iso: "SG", name: "Singapur", dial: "+65", flag: "🇸🇬" },
  { iso: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { iso: "NZ", name: "Nueva Zelanda", dial: "+64", flag: "🇳🇿" },
];

export function dialForIso(iso: string): string {
  return countries.find((c) => c.iso === iso)?.dial ?? "+34";
}
