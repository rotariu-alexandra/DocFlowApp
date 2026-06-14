type PriorityBadgeProps = { priority: string };

const LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <span className={`badge badge-priority badge-priority-${priority}`}>
      {LABELS[priority] ?? priority}
    </span>
  );
}
