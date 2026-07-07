/**
 * Renderiza un string con marcas **negrita** como <strong>, para poder
 * escribir énfasis en los textos de src/data sin meter JSX en los datos.
 * El resaltado sube el texto a cream pleno + semibold sobre el cuerpo
 * atenuado (cream/85) para que el párrafo se pueda escanear.
 */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((chunk, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-cream">
            {chunk}
          </strong>
        ) : (
          chunk
        )
      )}
    </>
  );
}
