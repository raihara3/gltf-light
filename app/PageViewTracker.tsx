"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { sendGAEvent } from "@next/third-parties/google";

/**
 * Sends a `page_view` on client-side route changes. The GA config only fires the
 * initial page_view, so without this an in-app navigation (e.g. `/` → `/legacy`)
 * would not be counted. The first render is skipped to avoid double-counting the
 * initial view.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const isInitial = useRef(true);

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }
    sendGAEvent("event", "page_view", {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname]);

  return null;
}
