/** Próximo número de versão sequencial para um draft (1, 2, 3, …). */
export function computeNextVersionNo(existing: number[]): number {
  return (existing.length ? Math.max(...existing) : 0) + 1;
}
