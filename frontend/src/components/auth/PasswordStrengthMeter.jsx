import { cn } from "../../lib/cn";
import { evaluatePasswordStrength } from "../../lib/passwordStrength";

export default function PasswordStrengthMeter({ password }) {
  const { score, label, meetsAll } = evaluatePasswordStrength(password);
  if (!password) return null;

  const litCount = Math.min(4, Math.max(0, Math.round((score / 5) * 4)));
  const tone =
    score <= 2 ? "bg-rose-400 dark:bg-rose-500" : score === 3 ? "bg-amber-400 dark:bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors duration-300",
              i < litCount ? tone : "bg-slate-200 dark:bg-slate-700"
            )}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span
          className={cn(
            "font-semibold",
            meetsAll ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400"
          )}
        >
          {label}
        </span>
        {meetsAll ? (
          <span className="shrink-0 text-emerald-600 dark:text-emerald-400">Meets requirements</span>
        ) : (
          <span className="max-w-[14rem] text-right text-slate-500">
            8+ chars, upper &amp; lower, number, symbol
          </span>
        )}
      </div>
    </div>
  );
}
