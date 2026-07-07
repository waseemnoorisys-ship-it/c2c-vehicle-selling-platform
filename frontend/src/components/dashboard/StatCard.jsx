export default function StatCard({ label, value, sub, icon }) {
  return (
    <div className="p-5 rounded-xl border border-border bg-surface">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-text-muted uppercase tracking-wide">{label}</p>
          <p className="font-display text-2xl sm:text-3xl font-bold text-text-primary mt-1">{value}</p>
          {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-400/20 flex items-center justify-center text-text-accent">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
