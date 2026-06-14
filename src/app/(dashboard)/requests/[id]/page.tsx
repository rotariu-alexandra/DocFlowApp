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
import { canStartProcessing, canApproveReject, canEditOwnRequest, canDeleteOwnRequest, canRequestClarification } from "@/utils/permissions";

type Attachment = { fileName: string; fileUrl: string; fileKey: string; fileType: string; fileSize: number; uploadedBy: string; uploadedAt: string };
type RequestDetails = { _id: string; title: string; description: string; department: string; requestType: string; status: string; priority: string; createdBy: string; createdAt: string; updatedAt: string; attachments?: Attachment[] };

const fmt = (size: number) => size < 1024 ? `${size} B` : size < 1048576 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(1)} MB`;

export default function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [request, setRequest] = useState<RequestDetails | null>(null);
  const [createdByName, setCreatedByName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const { user } = useUser();
  const role = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role.toLowerCase() : undefined;
  const currentUserId = user?.id;
  const dept = user?.publicMetadata?.department as string | undefined;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/requests/${id}`);
        const data = await res.json();
        if (data.success) {
          setRequest(data.data);
          const ur = await fetch(`/api/users/${data.data.createdBy}/name`);
          const ud = await ur.json();
          if (ud.success) setCreatedByName(ud.name);
        }
      } finally { setLoading(false); }
    })();
  }, [id]);

  const updateStatus = async (status: string) => {
    if (!request) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/requests/${request._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (data.success) setRequest(data.data);
      else alert(data.message || "Error updating status.");
    } finally { setUpdating(false); }
  };

  const handleDelete = async () => {
    if (!request || !window.confirm("Delete this request?")) return;
    const res = await fetch(`/api/requests/${request._id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) router.push("/requests");
  };

  if (loading) return <p style={{ color: "var(--muted)", fontSize: "13px" }}>Loading…</p>;
  if (!request) return <p style={{ color: "var(--muted)", fontSize: "13px" }}>Request not found.</p>;

  const isOwner = request.createdBy === currentUserId;
  const isPending = request.status === "pending_clarification";
  const lbl: React.CSSProperties = { fontSize: "11px", fontWeight: 500, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "3px" };
  const val: React.CSSProperties = { fontSize: "14px", color: "var(--foreground)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Back */}
      <div>
        <button onClick={() => router.back()} className="btn btn-link" style={{ fontSize: "12px" }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        >← Back</button>
      </div>

      <PageHeader title={request.title} description={`${request.department} · ${request.requestType.replace("_", " ")}`} />

      {/* Clarification banner */}
      {isPending && isOwner && (
        <div style={{
          background: "var(--accent-orange-bg)",
          border: "0.5px solid var(--accent-orange)",
          borderRadius: "10px",
          padding: "14px 16px",
          display: "flex",
          gap: "10px",
        }}>
          <span style={{ color: "var(--accent-orange)", flexShrink: 0 }}>⚠</span>
          <div>
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--accent-orange)", margin: 0 }}>
              Clarifications required
            </p>
            <p style={{ fontSize: "12px", color: "var(--accent-orange)", marginTop: "3px", opacity: 0.85 }}>
              Edit your request then click <strong>"Clarifications provided"</strong> to resubmit.
            </p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="card">
        <div style={{ display: "flex", gap: "6px", marginBottom: "18px" }}>
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px" }}>
          <div><p style={lbl}>Department</p><p style={val}>{request.department}</p></div>
          <div><p style={lbl}>Request type</p><p style={val}>{request.requestType.replace("_", " ")}</p></div>
          <div><p style={lbl}>Created at</p><p style={val}>{new Date(request.createdAt).toLocaleString("en-GB")}</p></div>
          <div><p style={lbl}>Created by</p><p style={val}>{createdByName || "—"}</p></div>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={lbl}>Description</p>
            <p style={{ ...val, lineHeight: 1.7 }}>{request.description}</p>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <p style={lbl}>Attachments</p>
            {request.attachments?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                {request.attachments.map(f => (
                  <div key={f.fileKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "8px", background: "var(--muted-bg)", border: "0.5px solid var(--card-border)" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>{f.fileName}</p>
                      <p style={{ fontSize: "11px", color: "var(--muted)", marginTop: "1px" }}>{f.fileType} · {fmt(f.fileSize)}</p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <a href={f.fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View</a>
                      <a href={f.fileUrl} download className="btn btn-ghost">Download</a>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>No attachments.</p>}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginBottom: "12px" }}>Actions</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {canEditOwnRequest(role, request.createdBy, currentUserId, request.status) && (
            <Link href={`/requests/${request._id}/edit`} className="btn btn-orange">Edit request</Link>
          )}
          {isPending && isOwner && (
            <button onClick={() => updateStatus("in_progress")} disabled={updating} className="btn btn-amber">
              ✓ Clarifications provided
            </button>
          )}
          {canDeleteOwnRequest(role, request.createdBy, currentUserId, request.status) && (
            <button onClick={handleDelete} className="btn btn-red">Delete</button>
          )}
          {request.status === "new" && canStartProcessing(role) && (
            <button onClick={() => updateStatus("in_progress")} disabled={updating} className="btn btn-blue">Start processing</button>
          )}
          {request.status === "in_progress" && canRequestClarification(role) && (
            <button onClick={() => updateStatus("pending_clarification")} disabled={updating} className="btn btn-amber">Request clarification</button>
          )}
          {(request.status === "in_progress" || isPending) && canApproveReject(role, request.department, dept) && (
            <>
              <button onClick={() => updateStatus("approved")} disabled={updating} className="btn btn-green">Approve</button>
              <button onClick={() => updateStatus("rejected")} disabled={updating} className="btn btn-red">Reject</button>
            </>
          )}
        </div>
      </div>

      <RequestHistory requestId={request._id} />
      <CommentsSection requestId={request._id} />
    </div>
  );
}
