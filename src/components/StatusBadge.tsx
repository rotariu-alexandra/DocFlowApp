type StatusBadgeProps = {
  status: string;
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "new":
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
        status
      )}`}
    >
      {status}
    </span>
  );
}