import { AlertTriangle, Megaphone } from "lucide-react";

export default function StoreClosedBanner({
  message,
  tone = "warn",
}: {
  message: string | null;
  tone?: "warn" | "info";
}) {
  if (!message) return null;
  const isWarn = tone === "warn";
  return (
    <div
      role="alert"
      className={
        "relative z-40 px-4 py-3 sm:py-4 " +
        (isWarn ? "bg-coffee-900 text-cream-50" : "bg-gold-500 text-coffee-900")
      }
    >
      <div className="container-base flex items-start justify-center gap-3 text-center sm:items-center">
        {isWarn ? (
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" strokeWidth={2} />
        ) : (
          <Megaphone className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" strokeWidth={2} />
        )}
        {isWarn ? (
          <p className="text-sm sm:text-left">
            <span className="font-semibold">We are temporarily closed.</span>
            <span className="ml-2 opacity-90">{message}</span>
          </p>
        ) : (
          <p className="text-sm font-medium">{message}</p>
        )}
      </div>
    </div>
  );
}
