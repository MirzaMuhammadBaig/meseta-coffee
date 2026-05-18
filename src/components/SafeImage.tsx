"use client";

import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type SafeImageProps = Omit<ImageProps, "onError" | "src"> & {
  src: string | null | undefined;
  /** Optional URL to swap in if the primary `src` fails to load. */
  fallbackSrc?: string;
  /** Custom UI rendered when no image loads (replaces the default placeholder). */
  fallbackContent?: React.ReactNode;
  /** Class for the placeholder wrapper. */
  placeholderClassName?: string;
};

/**
 * `next/image` wrapper that handles broken / removed remote URLs.
 *
 * Why this exists: marketing imagery comes from Unsplash + the brand's
 * Instagram CDN. Those URLs can return 404 or 403 at any time and
 * native `<Image>` just leaves an empty hole. SafeImage catches the
 * load error, optionally retries with a `fallbackSrc`, and renders a
 * tasteful placeholder if both fail — so the layout never breaks.
 */
export default function SafeImage({
  src,
  fallbackSrc,
  alt,
  fallbackContent,
  placeholderClassName,
  className,
  fill,
  ...rest
}: SafeImageProps) {
  const [current, setCurrent] = useState<string | null>(src ?? null);
  const [failed, setFailed] = useState(false);

  // Reset when the parent passes a new src (e.g. cart updates, search filters).
  useEffect(() => {
    setCurrent(src ?? null);
    setFailed(false);
  }, [src]);

  function onError() {
    if (fallbackSrc && current !== fallbackSrc) {
      setCurrent(fallbackSrc);
      return;
    }
    setFailed(true);
  }

  if (!current || failed) {
    const fallback = fallbackContent ?? (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-cream-100 via-cream-50 to-coffee-100 text-coffee-300">
        <ImageOff className="h-5 w-5" strokeWidth={1.6} />
        <span className="px-3 text-center text-[10px] uppercase tracking-[0.2em] text-coffee-400">
          {alt || "image unavailable"}
        </span>
      </div>
    );

    if (fill) {
      return (
        <div
          aria-label={alt}
          role="img"
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            placeholderClassName,
            className,
          )}
        >
          {fallback}
        </div>
      );
    }

    return (
      <div
        aria-label={alt}
        role="img"
        className={cn(
          "flex items-center justify-center",
          placeholderClassName,
          className,
        )}
        style={
          // Reserve space so the layout doesn't collapse when we lose the image.
          typeof rest.width === "number" && typeof rest.height === "number"
            ? { width: rest.width, height: rest.height }
            : undefined
        }
      >
        {fallback}
      </div>
    );
  }

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      fill={fill}
      className={className}
      onError={onError}
    />
  );
}
