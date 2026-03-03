interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  sub?: string;
}

export function MetricCard({ icon, label, value, sub }: MetricCardProps) {
  return (
    <div className="glass-card-light rounded-xl p-4 space-y-2 group">
      <div className="flex items-center gap-1.5">
        <span className="text-sm leading-none opacity-70">{icon}</span>
        <span className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-lg font-bold text-foreground font-display leading-none">
        {value}
      </div>
      {sub && (
        <div className="text-xs font-medium text-primary/60 leading-none">
          {sub}
        </div>
      )}
    </div>
  );
}
