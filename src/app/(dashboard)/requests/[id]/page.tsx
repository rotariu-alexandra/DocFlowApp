"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import RequestHistory from "@/components/RequestHistory";
import CommentsSection from "@/components/CommentsSection";
import { useUser } from "@clerk/nextjs";
import {
  canStartProcessing,
  canApproveReject,
  canEditOwnRequest,
  canDeleteOwnRequest,
  canRequestClarification,
} from "@/utils/permissions";

type Attachment = {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
};

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
  attachments?: Attachment[];
};

export default function RequestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [createdByName, setCreatedByName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { user } = useUser();
  const role =
    typeof user?.publicMetadata?.role === "string"
      ? user.publicMetadata.role.toLowerCase()
      : undefined;
  const currentUserId = user?.id;
  const currentUserDepartment = user?.publicMetadata?.department as string | undefined;

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/requests/${id}`);
        const data = await res.json();

        if (data.success) {
          setRequest(data.data);
          const userRes = await fetch(`/api/users/${data.data.createdBy}/name`);
          const userData = await userRes.json();
          if (userData.success) setCreatedByName(userData.name);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequest(data.data);
      } else {
        alert(data.message || "Error updating request status.");
      }
    } catch (error) {
      console.error("Update request status error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      const res = await fetch(`/api/requests/${request._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) router.push("/requests");
    } catch (error) {
      console.error("Delete request error:", error);
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    if (fileType.includes("word") || fileType.includes("docx")) return "📝";
    return "📎";
  };

  if (loading) {
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading request details...</p>;
  }

  if (!request) {
    return <p className="p-4 text-gray-500 dark:text-gray-400">Request not found.</p>;
  }

  const isOwner = request.createdBy === currentUserId;
  const isPendingClarification = request.status === "pending_clarification";

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-sm font-medium text-blue-600 hover:underline">
          ← Back
        </button>
      </div>

      <PageHeader title={request.title} description="View request details" />

      {/* Clarification warning banner — visible to owner only */}
      {isPendingClarification && isOwner && (
        <div className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950/40">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-orange-800 dark:text-orange-300">
              Clarifications required
            </p>
            <p className="mt-1 text-sm text-orange-700 dark:text-orange-400">
              HR or your manager has requested additional information. Edit your request (e.g. attach the required document),
              then click <strong>"Clarifications provided"</strong> to resubmit it for processing.
            </p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <div className="flex flex-wrap gap-3">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Department</p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">{request.department}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Request Type</p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">{request.requestType}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">
              {new Date(request.createdAt).toLocaleString("ro-RO")}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
            <p className="mt-1 text-base text-gray-800 dark:text-gray-100">{createdByName || "—"}</p>
          </div>

          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
            <p className="mt-2 text-base leading-7 text-gray-700 dark:text-gray-300">{request.description}</p>
          </div>

          {/* Attachments */}
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Attached documents</p>

            {request.attachments && request.attachments.length > 0 ? (
              <div className="mt-3 grid gap-3">
                {request.attachments.map((file) => (
                  <div
                    key={file.fileKey}
                    className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-lg dark:bg-blue-950">
                        {getFileIcon(file.fileType)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{file.fileName}</p>
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {file.fileType} · {formatFileSize(file.fileSize)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
                      >
                        View
                      </a>
                      <a
                        href={file.fileUrl}
                        download
                        className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No document attached.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Actions</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {/* Edit — available to owner when status is new or pending_clarification */}
          {canEditOwnRequest(role, request.createdBy, currentUserId, request.status) && (
            <Link
              href={`/requests/${request._id}/edit`}
              className="inline-flex rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              Edit Request
            </Link>
          )}

          {/* Resubmit after clarification */}
          {isPendingClarification && isOwner && (
            <button
              onClick={() => updateStatus("in_progress")}
              disabled={updating}
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:opacity-50"
            >
              ✓ Clarifications provided
            </button>
          )}

          {/* Delete — only when status is new */}
          {canDeleteOwnRequest(role, request.createdBy, currentUserId, request.status) && (
            <button
              onClick={handleDelete}
              className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete Request
            </button>
          )}

          {/* HR: Start Processing */}
          {request.status === "new" && canStartProcessing(role) && (
            <button
              onClick={() => updateStatus("in_progress")}
              disabled={updating}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              Start Processing
            </button>
          )}

          {/* HR/Manager: Request clarifications */}
          {request.status === "in_progress" && canRequestClarification(role) && (
            <button
              onClick={() => updateStatus("pending_clarification")}
              disabled={updating}
              className="rounded-lg border border-orange-400 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-900/60 disabled:opacity-50"
            >
              Request Clarifications
            </button>
          )}

          {/* Approve / Reject */}
          {(request.status === "in_progress" || request.status === "pending_clarification") &&
            canApproveReject(role, request.department, currentUserDepartment) && (
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

      <RequestHistory requestId={request._id} />

      {/* Comments */}
      <CommentsSection requestId={request._id} />
    </div>
  );
}
