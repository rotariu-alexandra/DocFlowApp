type StatusBadgeProps = { status: string };

const LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  pending_clarification: "Clarification",
  approved: "Approved",
  rejected: "Rejected",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`badge badge-status badge-${status.replace(/_/g, "-")}`}>
      {LABELS[status] ?? status}
    </span>
  );
}
