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

/**
 * The same subscription, but the server snapshot is `null` rather than
 * `false` — "not known yet" instead of "no".
 *
 * `useMediaQuery` is right when the conservative branch is a safe thing
 * to render: no motion, no video. It is WRONG when the two branches load
 * different files, because the server would commit to one and the client
 * would then switch, and the browser would have started fetching both.
 * The hero picks between a 16:9 and a 9:16 encode of the same footage;
 * downloading the loser is exactly what must not happen.
 *
 * Callers render nothing while this is null. The hero still is server
 * rendered underneath regardless, so there is never a blank frame.
 */
export function useResolvedMediaQuery(query: string): boolean | null {
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

  return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, () => null);
}
