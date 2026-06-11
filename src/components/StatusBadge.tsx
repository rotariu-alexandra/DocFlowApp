type StatusBadgeProps = {
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  pending_clarification: "Pending Clarification",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  pending_clarification: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
  new: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.new;
  const label = STATUS_LABELS[status] ?? status;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
