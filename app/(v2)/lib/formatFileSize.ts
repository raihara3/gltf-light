/**
 * Format a byte count as a human-readable size (e.g. `2.4MB`).
 * Reimplemented for v2 (a copy of the legacy helper — never imported from
 * legacy, per the zero-cross-reference rule).
 */
export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size}B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)}KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)}MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)}GB`;
}
