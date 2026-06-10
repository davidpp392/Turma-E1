/** Remove tags HTML e limita tamanho de strings de entrada */
export function sanitizeText(input: string, maxLength = 5000): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 200);
}
