export default function AuthDivider({ label = "or" }) {
  return (
    <div className="relative py-1">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-slate-200 dark:bg-slate-700" />
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-xs font-bold uppercase tracking-widest text-slate-400 dark:bg-slate-900 dark:text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}
