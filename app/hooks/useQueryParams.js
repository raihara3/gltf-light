import { useMemo } from "react";

export function useQueryParams() {
  const queryParams = useMemo(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const params = new URLSearchParams(window.location.search);
    const result = {};

    for (const [key, value] of params.entries()) {
      result[key] = value;
    }

    return result;
  }, []);

  return queryParams;
}

export function useTestMode() {
  const params = useQueryParams();
  return params.mode === "test";
}
