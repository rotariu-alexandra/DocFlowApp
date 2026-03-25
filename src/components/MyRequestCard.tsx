import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

type MyRequestCardProps = {
  request: {
    _id: string;
    title: string;
    description: string;
    department: string;
    requestType: string;
    status: string;
    priority: string;
    createdAt?: string;
  };
  deletingId: string | null;
  onDelete: (id: string) => void;
};

export default function MyRequestCard({
  request,
  deletingId,
  onDelete,
}: MyRequestCardProps) {
  const canManage = request.status === "new";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <Link href={`/requests/${request._id}`}>
            <h2 className="text-xl font-semibold text-gray-800 transition hover:text-blue-600 dark:text-gray-100">
              {request.title}
            </h2>
          </Link>

          <p className="mt-2 text-gray-600 dark:text-gray-300">
            {request.description}
          </p>

          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Department: {request.department}</span>
            <span>Type: {request.requestType}</span>
            {request.createdAt && (
              <span>
                Created: {new Date(request.createdAt).toLocaleDateString("ro-RO")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={`/requests/${request._id}`}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          View Details
        </Link>

        {canManage && (
          <>
            <Link
              href={`/requests/${request._id}/edit`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Edit
            </Link>

            <button
              onClick={() => onDelete(request._id)}
              disabled={deletingId === request._id}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {deletingId === request._id ? "Deleting..." : "Delete"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}