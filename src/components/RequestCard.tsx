import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { canStartProcessing, canApproveReject, canRequestClarification } from "@/utils/permissions";

type RequestCardProps = {
  request: { _id: string; title: string; description: string; department: string; requestType: string; status: string; priority: string };
  updatingId: string | null;
  onUpdateStatus: (id: string, status: string) => void;
  role?: string;
  currentUserDepartment?: string;
};

export default function RequestCard({ request, updatingId, onUpdateStatus, role, currentUserDepartment }: RequestCardProps) {
  const busy = updatingId === request._id;

  return (
    <div className="card" style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={`/requests/${request._id}`} style={{ textDecoration: "none" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{request.title}</h2>
          </Link>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px", lineHeight: 1.5 }}>
            {request.description.length > 120 ? request.description.slice(0, 120) + "…" : request.description}
          </p>
          <div style={{ display: "flex", gap: "10px", marginTop: "6px", fontSize: "12px", color: "var(--muted)" }}>
            <span>{request.department}</span><span>·</span><span>{request.requestType.replace("_", " ")}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flexShrink: 0 }}>
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "0.5px solid var(--card-border)", flexWrap: "wrap" }}>
        <Link href={`/requests/${request._id}`} className="btn btn-ghost">View</Link>

        {request.status === "new" && canStartProcessing(role) && (
          <button onClick={() => onUpdateStatus(request._id, "in_progress")} disabled={busy} className="btn btn-blue">
            Start processing
          </button>
        )}

        {request.status === "in_progress" && canRequestClarification(role) && (
          <button onClick={() => onUpdateStatus(request._id, "pending_clarification")} disabled={busy} className="btn btn-amber">
            Request clarification
          </button>
        )}

        {(request.status === "in_progress" || request.status === "pending_clarification") &&
          canApproveReject(role, request.department, currentUserDepartment) && (
            <>
              <button onClick={() => onUpdateStatus(request._id, "approved")} disabled={busy} className="btn btn-green">Approve</button>
              <button onClick={() => onUpdateStatus(request._id, "rejected")} disabled={busy} className="btn btn-red">Reject</button>
            </>
          )}
      </div>
    </div>
  );
}
