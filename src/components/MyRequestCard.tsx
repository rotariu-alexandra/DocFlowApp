import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";

type MyRequestCardProps = {
  request: {
    _id: string; title: string; description: string;
    department: string; requestType: string;
    status: string; priority: string; createdAt?: string;
  };
  deletingId: string | null;
  onDelete: (id: string) => void;
};

export default function MyRequestCard({ request, deletingId, onDelete }: MyRequestCardProps) {
  const canManage = request.status === "new" || request.status === "pending_clarification";
  const canDelete = request.status === "new";

  return (
    <div className="card" style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link href={`/requests/${request._id}`} style={{ textDecoration: "none" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 500, color: "var(--foreground)", margin: 0, lineHeight: 1.4 }}>
              {request.title}
            </h2>
          </Link>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px", lineHeight: 1.5 }}>
            {request.description.length > 120 ? request.description.slice(0, 120) + "…" : request.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px", fontSize: "12px", color: "var(--muted)" }}>
            <span>{request.department}</span>
            <span>·</span>
            <span>{request.requestType.replace("_", " ")}</span>
            {request.createdAt && (<><span>·</span><span>{new Date(request.createdAt).toLocaleDateString("en-GB")}</span></>)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end", flexShrink: 0 }}>
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "0.5px solid var(--card-border)" }}>
        {/* View — ghost + hover underline on text */}
        <Link href={`/requests/${request._id}`} className="btn btn-ghost">
          View
        </Link>

        {/* Edit — orange */}
        {canManage && (
          <Link href={`/requests/${request._id}/edit`} className="btn btn-orange">
            Edit
          </Link>
        )}

        {/* Delete — red */}
        {canDelete && (
          <button
            onClick={() => onDelete(request._id)}
            disabled={deletingId === request._id}
            className="btn btn-red"
          >
            {deletingId === request._id ? "Deleting…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
