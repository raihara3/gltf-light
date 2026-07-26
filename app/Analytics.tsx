import { GoogleAnalytics } from "@next/third-parties/google";
import { PageViewTracker } from "./PageViewTracker";

/**
 * Root GA4 tag. Placed in the root layout so `page_view` is collected for both
 * `/` (v2) and `/legacy` — differentiated by `page_path`. The GA config only
 * fires the initial page_view, so `PageViewTracker` adds one per client-side
 * route change. Custom interaction events fire only from v2 code. Renders
 * nothing (and sends nothing) unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, so
 * local/test builds stay silent.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) {
    return null;
  }
  return (
    <>
      <GoogleAnalytics gaId={gaId} />
      <PageViewTracker />
    </>
  );
}
