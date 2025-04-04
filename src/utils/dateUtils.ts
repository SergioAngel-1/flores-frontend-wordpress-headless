/**
 * Formatea una fecha en formato legible en español
 * @param dateString - String de fecha a formatear
 * @returns Fecha formateada en español (ej: "15 de abril de 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
