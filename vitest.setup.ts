import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// jsdom does not implement scrollIntoView; mock to a no-op
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
} else {
  Element.prototype.scrollIntoView = vi.fn();
}
