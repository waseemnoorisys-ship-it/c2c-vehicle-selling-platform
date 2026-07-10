const STATUS_STYLES = {
  active: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  accepted: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
  paid: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning border-warning/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
  draft: "bg-text-muted/15 text-text-muted border-border",
  inactive: "bg-text-muted/15 text-text-muted border-border",
  sold: "bg-primary-400/15 text-text-accent border-primary-400/30",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${style}`}>
      {status}
    </span>
  );
}
