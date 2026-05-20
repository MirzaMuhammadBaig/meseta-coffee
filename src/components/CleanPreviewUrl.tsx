"use client";

import { useEffect } from "react";

/**
 * Strips `cache-bust` query params from the address bar.
 *
 * The in-IDE preview browser appends `?cache-bust=<timestamp>` on every
 * reload to defeat the HTTP cache. Because each reload reads the *current*
 * URL (which already carries the previous cache-bust) it keeps appending,
 * so the address bar grows: `?cache-bust=a&cache-bust=b&cache-bust=c…`.
 *
 * The param has already done its job by the time the page is interactive,
 * so removing it here is purely cosmetic and safe — it just keeps the URL
 * clean and stops the runaway accumulation.
 */
export default function CleanPreviewUrl() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("cache-bust")) return;
    url.searchParams.delete("cache-bust");
    window.history.replaceState({}, "", url);
  }, []);

  return null;
}
