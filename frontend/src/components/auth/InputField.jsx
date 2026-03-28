import { cn } from "../../lib/cn";

/**
 * Accessible stacked label + input (reliable across Tailwind v4 / browsers).
 * Optional left icon and right slot (e.g. password toggle).
 */
export default function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  rightSlot,
  autoComplete,
  disabled,
  placeholder,
  className,
  inputClassName
}) {
  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-200"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 z-[1] h-[18px] w-[18px] -translate-y-1/2 text-slate-400",
              error && "text-rose-500"
            )}
            aria-hidden
          />
        ) : null}
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          disabled={disabled}
          className={cn(
            "box-border min-h-[3rem] w-full rounded-xl border-2 bg-white px-3.5 text-base text-slate-900 shadow-sm outline-none transition",
            "placeholder:text-slate-400",
            "border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15",
            "dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-400/20",
            Icon && "pl-11",
            rightSlot && "pr-12",
            error &&
              "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15 dark:border-rose-500 dark:focus:border-rose-400",
            disabled && "cursor-not-allowed bg-slate-50 opacity-70 dark:bg-slate-800/50",
            inputClassName
          )}
        />
        {rightSlot ? (
          <div className="absolute right-2 top-1/2 z-[1] flex -translate-y-1/2 items-center">{rightSlot}</div>
        ) : null}
      </div>
      {error ? (
        <p className="text-xs font-medium text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
