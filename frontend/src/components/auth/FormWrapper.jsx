import { cn } from "../../lib/cn";

export default function FormWrapper({ eyebrow, title, description, children, className }) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md rounded-3xl border-2 border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10",
        "dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40",
        className
      )}
    >
      {(eyebrow || title || description) && (
        <header className="mb-8 space-y-2 text-center sm:text-left">
          {eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem] dark:text-white">
              {title}
            </h1>
          ) : null}
          {description ? (
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
          ) : null}
        </header>
      )}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}
