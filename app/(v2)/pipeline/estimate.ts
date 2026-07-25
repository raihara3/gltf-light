export interface Estimate {
  /** Output byte length. */
  afterBytes: number;
  /** Size reduction vs the original, as a whole percentage (e.g. 67 → "-67%"). */
  deltaPct: number;
}

/** Compute the size-reduction estimate from the original and optimized sizes. */
export function computeEstimate(beforeBytes: number, afterBytes: number): Estimate {
  const deltaPct = beforeBytes > 0 ? Math.round(((beforeBytes - afterBytes) / beforeBytes) * 100) : 0;
  return { afterBytes, deltaPct };
}
