import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Sun, Timer, Sparkles } from "lucide-react";
import { cn } from "../../lib/cn";

const STORAGE_KEY = "timetrack-theme";

export default function AuthLayout({ children, footer }) {
  const [dark, setDark] = useState(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") {
      const prefersDark = saved === "dark";
      document.documentElement.classList.toggle("dark", prefersDark);
      setDark(prefersDark);
    }
  }, []);

  const toggleDark = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    setDark(next);
  };

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-950">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(99,102,241,0.18),transparent)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(129,140,248,0.22),transparent)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-80 w-80 rounded-full bg-violet-400/15 blur-3xl dark:bg-violet-600/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl dark:bg-indigo-600/10"
        aria-hidden
      />

      <button
        type="button"
        onClick={toggleDark}
        className="fixed right-4 top-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-md transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        aria-label={dark ? "Light mode" : "Dark mode"}
      >
        {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1200px] flex-col lg:flex-row">
        <aside
          className={cn(
            "flex shrink-0 flex-col justify-between px-6 py-10 text-white sm:px-10 lg:w-[42%] lg:min-h-screen lg:px-12 lg:py-14",
            "border-b border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900",
            "lg:border-b-0 lg:border-r lg:border-white/10"
          )}
        >
          <div className="min-w-0">
            <Link
              to="/"
              className="inline-flex min-w-0 max-w-full items-center gap-3 rounded-xl py-1 text-white/95 transition hover:text-white"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/20">
                <Timer className="h-7 w-7" strokeWidth={2} aria-hidden />
              </span>
              <span className="truncate text-xl font-bold tracking-tight sm:text-2xl">TimeTrack</span>
            </Link>

            <h2 className="mt-10 text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[2.25rem] lg:leading-tight">
              Time that ships work. <span className="text-indigo-300">Clearly.</span>
            </h2>
            <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-slate-300 sm:text-[15px]">
              Enterprise-grade time tracking with projects, modules, and role-based dashboards — without the
              clutter.
            </p>
            <ul className="mt-8 max-w-md space-y-3 text-sm text-slate-200 sm:text-[15px]">
              {["Live timers & detailed logs", "Reports & exports", "Billing-ready hours"].map((item) => (
                <li key={item} className="flex gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-12 text-xs text-slate-500 lg:mt-10">© {new Date().getFullYear()} TimeTrack</p>
        </aside>

        <main
          className={cn(
            "flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-12 sm:px-8 lg:py-16",
            "bg-slate-50/90 dark:bg-slate-950/90"
          )}
        >
          <div className="w-full max-w-md min-w-0">{children}</div>
          {footer ? (
            <div className="mt-8 w-full max-w-md min-w-0 px-1 text-center text-xs leading-relaxed text-slate-500 dark:text-slate-500">
              {footer}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}
