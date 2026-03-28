import { cn } from "../../lib/cn";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  fullWidth = false,
  loading = false,
  loadingLabel = "Please wait…",
  disabled = false,
  className,
  ...rest
}) {
  const variants = {
    primary: cn(
      "border-2 border-indigo-600 bg-indigo-600 text-white",
      "shadow-md shadow-indigo-600/25",
      "hover:border-indigo-700 hover:bg-indigo-700",
      "active:border-indigo-800 active:bg-indigo-800",
      "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
      "disabled:border-slate-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none",
      "dark:border-indigo-500 dark:bg-indigo-600 dark:hover:border-indigo-400 dark:hover:bg-indigo-500"
    ),
    secondary: cn(
      "border-2 border-slate-200 bg-white text-slate-800",
      "shadow-sm hover:border-slate-300 hover:bg-slate-50",
      "focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2",
      "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
    ),
    ghost: "border-2 border-transparent text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "box-border inline-flex min-h-[3rem] cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold tracking-tight outline-none transition select-none",
        "focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
        variants[variant] || variants.primary,
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-80",
        className
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 shrink-0 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
