export type SensitiveDetectionResult = {
  hasSensitiveContent: boolean;
  flags: string[];
};

export function detectSensitiveContent(text: string): SensitiveDetectionResult {
  const flags: string[] = [];
  const lowerText = text.toLowerCase();

  // Patrones Regex
  const phonePattern = /\b\d{8,12}\b|\b\d{2,3}[\s-]?\d{4}[\s-]?\d{4}\b/;
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const matriculaPattern = /\b[0-9]{7,8}\b/; // Aproximación a matrículas estudiantiles

  if (phonePattern.test(text)) flags.push("posible_telefono");
  if (emailPattern.test(text)) flags.push("posible_correo");
  if (matriculaPattern.test(text)) flags.push("posible_matricula");

  // Palabras sensibles clave
  const sensitiveWords = [
    "violación", "violacion", "abuso", "arma", "dormitorio", "baño", "bano", 
    "cuarto", "casa", "compañera", "companera", "profesor", "rector", 
    "denuncia", "amenaza"
  ];

  for (const word of sensitiveWords) {
    // Usamos regex con límites de palabra para evitar falsos positivos
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      flags.push(`palabra_sensible_${word.replace(/[áéíóúñ]/g, 'x')}`); // sanitizado
    }
  }

  // Detección heurística básica de direcciones (muy simplificada)
  const addressKeywords = ["calle", "avenida", "av.", "num", "número", "mz", "lt", "manzana", "lote"];
  let addressHits = 0;
  for (const kw of addressKeywords) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(lowerText)) {
      addressHits++;
    }
  }
  if (addressHits >= 2 || (addressHits >= 1 && /\d+/.test(text))) {
    flags.push("posible_direccion");
  }

  return {
    hasSensitiveContent: flags.length > 0,
    flags
  };
}
