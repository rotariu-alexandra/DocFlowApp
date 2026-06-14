"use client";

import { useState } from "react";
import { requestSchema } from "@/utils/requestValidation";
import PageHeader from "@/components/PageHeader";
import { UploadDropzone } from "@/utils/uploadthing";

type FormData = {
  title: string; description: string;
  requestType: "leave_request" | "shift_change" | "certificate" | "equipment_request" | "other";
  department: "HR" | "IT" | "Finance" | "Legal" | "Operations" | "Marketing" | "Sales" | "Admin" | "Management";
  priority: "low" | "medium" | "high";
};
type Attachment = { fileName: string; fileUrl: string; fileKey: string; fileType: string; fileSize: number; uploadedBy: string; uploadedAt: string };
type FormErrors = { title?: string; description?: string; requestType?: string; department?: string; priority?: string };

const requestTypeDefaults = {
  leave_request: { title: "Leave Request", department: "HR" },
  shift_change: { title: "Shift Change", department: "HR" },
  certificate: { title: "Certificate Request", department: "HR" },
  equipment_request: { title: "Equipment Request", department: "IT" },
  other: { title: "General Request", department: "Admin" },
} as const;

const inputStyle: React.CSSProperties = {
  width: "100%", fontSize: "13px", padding: "8px 12px",
  borderRadius: "8px", border: "0.5px solid var(--card-border)",
  background: "var(--card-bg)", color: "var(--foreground)",
  outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "12px", fontWeight: 500,
  color: "var(--muted)", marginBottom: "6px",
  textTransform: "uppercase", letterSpacing: ".04em",
};

export default function CreateRequestPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "General Request", description: "", requestType: "other", department: "Admin", priority: "medium",
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "requestType") {
      const t = value as keyof typeof requestTypeDefaults;
      const d = requestTypeDefaults[t];
      setFormData(prev => ({
        ...prev, requestType: t,
        department: d.department as FormData["department"],
        title: prev.title === requestTypeDefaults[prev.requestType].title || prev.title.trim() === "" ? d.title : prev.title,
      }));
      setErrors(prev => ({ ...prev, requestType: undefined, department: undefined, title: undefined }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const result = requestSchema.safeParse(formData);
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({ title: fe.title?.[0], description: fe.description?.[0], requestType: fe.requestType?.[0], department: fe.department?.[0], priority: fe.priority?.[0] });
      return;
    }
    setErrors({});
    try {
      setLoading(true);
      const res = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, attachments }) });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "Request submitted successfully.", ok: true });
        setFormData({ title: "General Request", description: "", requestType: "other", department: "Admin", priority: "medium" });
        setAttachments([]);
        // auto-dismiss after 4s
        setTimeout(() => setMessage(null), 4000);
      } else {
        setMessage({ text: data.message || "Error submitting request.", ok: false });
      }
    } catch {
      setMessage({ text: "Connection error.", ok: false });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <PageHeader title="Create Request" description="Fill out the form to submit a new internal request." />

      <div className="card" style={{ marginTop: "20px" }}>
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Title */}
          <div>
            <label style={labelStyle}>Title</label>
            <input name="title" type="text" value={formData.title} onChange={handleChange}
              style={{ ...inputStyle, borderColor: errors.title ? "var(--accent-red)" : "var(--card-border)" }} />
            {errors.title && <p style={{ fontSize: "11px", color: "var(--accent-red)", marginTop: "4px" }}>{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" rows={5} value={formData.description} onChange={handleChange}
              placeholder="Describe your request…"
              style={{ ...inputStyle, resize: "vertical", borderColor: errors.description ? "var(--accent-red)" : "var(--card-border)" }} />
            {errors.description && <p style={{ fontSize: "11px", color: "var(--accent-red)", marginTop: "4px" }}>{errors.description}</p>}
          </div>

          {/* Type + Department */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={labelStyle}>Request type</label>
              <select name="requestType" value={formData.requestType} onChange={handleChange} style={inputStyle}>
                <option value="leave_request">Leave Request</option>
                <option value="shift_change">Shift Change</option>
                <option value="certificate">Certificate</option>
                <option value="equipment_request">Equipment Request</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} style={inputStyle}>
                {["HR", "IT", "Finance", "Legal", "Operations", "Marketing", "Sales", "Admin", "Management"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label style={labelStyle}>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange} style={inputStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Attachments */}
          <div style={{ border: "0.5px dashed var(--card-border)", borderRadius: "8px", padding: "14px" }}>
            <label style={labelStyle}>Attachments</label>
            <p style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "12px" }}>PDF, DOCX, images — max 8 MB · max 5 files</p>

            <UploadDropzone
              endpoint="requestAttachment"
              onClientUploadComplete={(res) => {
                const uploaded: Attachment[] = res.map(f => ({
                  fileName: f.name, fileUrl: f.ufsUrl, fileKey: f.key,
                  fileType: f.type || "unknown", fileSize: f.size,
                  uploadedBy: typeof f.serverData?.uploadedBy === "string" ? f.serverData.uploadedBy : "",
                  uploadedAt: new Date().toISOString(),
                }));
                setAttachments(prev => [...prev, ...uploaded]);
              }}
              onUploadError={(e: Error) => setMessage({ text: `Upload error: ${e.message}`, ok: false })}
              appearance={{
                container: "border border-dashed border-[var(--card-border)] p-4 rounded-lg",
                uploadIcon: "h-6 w-6 text-[var(--muted)]",
                label: "text-[var(--muted)] text-sm",
                allowedContent: "text-[var(--muted)] text-xs",
                button: "btn btn-primary bg-[var(--foreground)] text-[var(--background)] px-4 py-2 rounded-md text-sm font-medium hover:opacity-80 transition",
              }}
            />

            {attachments.length > 0 && (
              <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)", margin: 0 }}>
                  Attached ({attachments.length})
                </p>
                {attachments.map(f => (
                  <div key={f.fileKey} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: "6px", background: "var(--muted-bg)", border: "0.5px solid var(--card-border)" }}>
                    <div>
                      <a href={f.fileUrl} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: "12px", fontWeight: 500, color: "var(--foreground)", textDecoration: "none" }}
                        onMouseEnter={e => ((e.target as HTMLElement).style.textDecoration = "underline")}
                        onMouseLeave={e => ((e.target as HTMLElement).style.textDecoration = "none")}
                      >📎 {f.fileName}</a>
                      <p style={{ fontSize: "11px", color: "var(--muted)", margin: 0 }}>{(f.fileSize / 1024).toFixed(1)} KB · {f.fileType}</p>
                    </div>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter(x => x.fileKey !== f.fileKey))}
                      className="btn btn-red" style={{ fontSize: "11px", padding: "3px 8px" }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Success / error message */}
          {message && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: 500,
              background: message.ok ? "var(--accent-green-bg)" : "var(--accent-red-bg)",
              color: message.ok ? "var(--accent-green)" : "var(--accent-red)",
              border: `0.5px solid ${message.ok ? "#C6E4A8" : "#F5C5C5"}`,
            }}>
              {message.ok ? "✓ " : "✕ "}{message.text}
            </div>
          )}

          {/* Submit */}
          <div>
            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ padding: "8px 20px", fontSize: "13px" }}>
              {loading ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
