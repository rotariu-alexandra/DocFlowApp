"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { useUser } from "@clerk/nextjs";
import {
  canStartProcessing,
  canApproveReject,
  canEditOwnRequest,
  canDeleteOwnRequest,
} from "@/utils/permissions";

type RequestDetails = {
  _id: string;
  title: string;
  description: string;
  department: string;
  requestType: string;
  status: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export default function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const currentUserId = user?.id;
  const currentUserDepartment = user?.publicMetadata?.department as
    | string
    | undefined;

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/requests/${id}`);
        const data = await res.json();

        if (data.success) {
          setRequest(data.data);
        }
      } catch (error) {
        console.error("Fetch request details error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!request) return;

    try {
      setUpdating(true);

      const res = await fetch(`/api/requests/${request._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        setRequest(data.data);
      }
    } catch (error) {
      console.error("Update request status error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this request?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/requests/${request._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        router.push("/requests");
      }
    } catch (error) {
      console.error("Delete request error:", error);
    }
  };

  if (loading) {
    return (
      <p className="p-4 text-gray-500 dark:text-gray-400">
        Loading request details...
      </p>
    );
  }

  if (!request) {
    return (
      <p className="p-4 text-gray-500 dark:text-gray-400">
        Request not found.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back
        </button>
      </div>

      <PageHeader
        title={request.title}
        description="Vizualizează detaliile complete ale cererii."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="flex flex-wrap gap-3">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Department
            </p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">
              {request.department}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Request Type
            </p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">
              {request.requestType}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created At
            </p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">
              {new Date(request.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created By
            </p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">
              {request.createdBy}
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Description
            </p>
            <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300">
              {request.description}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Actions
        </h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {canEditOwnRequest(
            role,
            request.createdBy,
            currentUserId,
            request.status
          ) && (
            <Link
              href={`/requests/${request._id}/edit`}
              className="inline-flex rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Edit Request
            </Link>
          )}

          {canDeleteOwnRequest(
            role,
            request.createdBy,
            currentUserId,
            request.status
          ) && (
            <button
              onClick={handleDelete}
              className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Request
            </button>
          )}

          {request.status === "new" && canStartProcessing(role) && (
            <button
              onClick={() => updateStatus("in_progress")}
              disabled={updating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Start Processing
            </button>
          )}

          {request.status === "in_progress" &&
            canApproveReject(
              role,
              request.department,
              currentUserDepartment
            ) && (
              <>
                <button
                  onClick={() => updateStatus("approved")}
                  disabled={updating}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus("rejected")}
                  disabled={updating}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </>
            )}
        </div>
      </div>
    </div>
  );
}