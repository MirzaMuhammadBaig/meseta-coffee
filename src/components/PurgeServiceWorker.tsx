"use client";

import { useEffect } from "react";

/**
 * Meseta is NOT a PWA and registers no service worker.
 *
 * But other apps run on the same `localhost` origin during development,
 * and a service worker any one of them registered persists across
 * projects — it keeps intercepting requests ("200 OK (from service
 * worker)") and, critically, mangles the POST → redirect of the admin
 * login, so the page never navigates after sign-in.
 *
 * This unregisters any service worker on the origin and clears its
 * caches on every load. If one was actively controlling the page, it
 * triggers a single reload to land on a clean, worker-free page (a
 * sessionStorage flag prevents a reload loop).
 */
export default function PurgeServiceWorker() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    (async () => {
      // Drop any caches a stale worker may have populated.
      if ("caches" in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch {
          /* ignore */
        }
      }

      let hadWorker = false;
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          hadWorker = true;
          await reg.unregister();
        }
      } catch {
        /* ignore */
      }

      // A worker controlling THIS page keeps control until a reload.
      // One reload (guarded against looping) gets us a clean page.
      if (
        hadWorker &&
        navigator.serviceWorker.controller &&
        !sessionStorage.getItem("__sw_purged")
      ) {
        sessionStorage.setItem("__sw_purged", "1");
        window.location.reload();
      }
    })();
  }, []);

  return null;
}
