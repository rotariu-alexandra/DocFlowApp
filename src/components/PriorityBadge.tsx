type PriorityBadgeProps = {
  priority: string;
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "low":
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(
        priority
      )}`}
    >
      {priority}
    </span>
  );
}