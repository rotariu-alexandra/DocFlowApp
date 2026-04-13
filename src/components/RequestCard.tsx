import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import {
  canStartProcessing,
  canApproveReject,
} from "@/utils/permissions";

type RequestCardProps = {
  request: {
    _id: string;
    title: string;
    description: string;
    department: string;
    requestType: string;
    status: string;
    priority: string;
  };
  updatingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
  role?: string;
  currentUserDepartment?: string;
};

export default function RequestCard({
  request,
  updatingId,
  onUpdateStatus,
  role,
  currentUserDepartment,
}: RequestCardProps) {
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
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        {request.status === "new" && canStartProcessing(role) && (
          <button
            onClick={() => onUpdateStatus(request._id, "in_progress")}
            disabled={updatingId === request._id}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            Start Processing
          </button>
        )}

        {request.status === "in_progress" &&
          canApproveReject(role, request.department, currentUserDepartment) && (
            <>
              <button
                onClick={() => onUpdateStatus(request._id, "approved")}
                disabled={updatingId === request._id}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>

              <button
                onClick={() => onUpdateStatus(request._id, "rejected")}
                disabled={updatingId === request._id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                Reject
              </button>
            </>
          )}
      </div>
    </div>
  );
}