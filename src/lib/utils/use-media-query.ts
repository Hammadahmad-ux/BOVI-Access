"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query.
 *
 * Uses useSyncExternalStore rather than useEffect + setState so that:
 *   - there is no cascading render on mount,
 *   - the value stays correct when the user rotates or resizes,
 *   - server rendering is explicit rather than accidental.
 *
 * The server snapshot is always `false`. Server-rendered markup therefore
 * reflects the conservative branch (no video, no motion), and the client
 * upgrades after hydration if the query actually matches.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(
    () => window.matchMedia(query).matches,
    [query],
  );

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
