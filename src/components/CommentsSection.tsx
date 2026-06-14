"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Comment = { _id: string; authorId: string; authorName: string; authorRole: string; content: string; createdAt: string };

const ROLE_LABEL: Record<string, string> = { employee: "Employee", hr: "HR", manager: "Manager", admin: "Admin" };
const ROLE_STYLE: Record<string, React.CSSProperties> = {
    employee: { background: "#F1EFE8", color: "#5F5E5A" },
    hr: { background: "#E6F1FB", color: "#185FA5" },
    manager: { background: "#F3EDFC", color: "#6B21A8" },
    admin: { background: "#FCEBEB", color: "#A32D2D" },
};

export default function CommentsSection({ requestId }: { requestId: string }) {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/requests/${requestId}/comments`);
            const data = await res.json();
            if (data.success) setComments(data.data);
        } catch { /* silent */ } finally { setLoading(false); }
    };

    useEffect(() => { fetchComments(); }, [requestId]);

    const handleSubmit = async () => {
        setError("");
        const trimmed = content.trim();
        if (!trimmed) { setError("Comment cannot be empty."); return; }
        try {
            setSubmitting(true);
            const res = await fetch(`/api/requests/${requestId}/comments`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });
            const data = await res.json();
            if (data.success) { setContent(""); setComments(prev => [...prev, data.data]); }
            else setError(data.message || "Error.");
        } catch { setError("Connection error."); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="card">
            <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)", marginBottom: "14px" }}>Comments</p>

            {loading ? (
                <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading…</p>
            ) : comments.length === 0 ? (
                <p style={{ fontSize: "13px", color: "var(--muted)" }}>No comments yet.</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                    {comments.map(c => (
                        <div key={c._id} style={{ padding: "12px 14px", borderRadius: "8px", background: "var(--muted-bg)", border: "0.5px solid var(--card-border)" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--foreground)" }}>{c.authorName}</span>
                                    <span style={{ fontSize: "10px", fontWeight: 500, padding: "1px 7px", borderRadius: "20px", ...(ROLE_STYLE[c.authorRole] ?? ROLE_STYLE.employee) }}>
                                        {ROLE_LABEL[c.authorRole] ?? c.authorRole}
                                    </span>
                                    {c.authorId === user?.id && <span style={{ fontSize: "11px", color: "var(--muted)" }}>(you)</span>}
                                </div>
                                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{new Date(c.createdAt).toLocaleString("en-GB")}</span>
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--foreground)", lineHeight: 1.6, margin: 0 }}>{c.content}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Input */}
            <div style={{ borderTop: comments.length ? "0.5px solid var(--card-border)" : "none", paddingTop: comments.length ? "14px" : 0 }}>
                <textarea
                    value={content}
                    onChange={e => { setContent(e.target.value); setError(""); }}
                    placeholder="Add a comment…"
                    rows={3}
                    style={{
                        width: "100%", fontSize: "13px", padding: "8px 12px",
                        borderRadius: "8px", border: `0.5px solid ${error ? "var(--accent-red)" : "var(--card-border)"}`,
                        background: "var(--card-bg)", color: "var(--foreground)",
                        outline: "none", resize: "vertical",
                    }}
                />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px" }}>
                    <span style={{ fontSize: "11px", color: error ? "var(--accent-red)" : "var(--muted)" }}>
                        {error || `${content.length}/2000`}
                    </span>
                    <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary" style={{ padding: "6px 16px" }}>
                        {submitting ? "Submitting…" : "Submit comment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
