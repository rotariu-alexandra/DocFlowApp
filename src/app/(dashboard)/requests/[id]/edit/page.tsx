"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestSchema } from "@/utils/requestValidation";
import PageHeader from "@/components/PageHeader";
import { UploadDropzone } from "@/utils/uploadthing";

type FormData = {
  title: string;
  description: string;
  department: "HR" | "IT" | "Finance" | "Admin" | "Management";
  priority: "low" | "medium" | "high";
  requestType: "leave_request" | "shift_change" | "certificate" | "equipment_request" | "other";
};

type FormErrors = {
  title?: string[];
  description?: string[];
  department?: string[];
  priority?: string[];
  requestType?: string[];
};

type Attachment = {
  fileName: string;
  fileUrl: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
};

export default function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    department: "HR",
    priority: "medium",
    requestType: "other",
  });

  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [newAttachments, setNewAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const res = await fetch(`/api/requests/${id}`);
        const data = await res.json();

        if (data.success) {
          setFormData({
            title: data.data.title,
            description: data.data.description,
            department: data.data.department,
            priority: data.data.priority,
            requestType: data.data.requestType,
          });
          setExistingAttachments(data.data.attachments || []);
        }
      } catch (error) {
        console.error("Fetch request error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const removeNewAttachment = (fileKey: string) => {
    setNewAttachments((prev) => prev.filter((f) => f.fileKey !== fileKey));
  };

  const removeExistingAttachment = (fileKey: string) => {
    setExistingAttachments((prev) => prev.filter((f) => f.fileKey !== fileKey));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = requestSchema.safeParse(formData);
    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    try {
      const allAttachments = [...existingAttachments, ...newAttachments];

      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.data, attachments: allAttachments }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/requests/${id}`);
      }
    } catch (error) {
      console.error("Update request error:", error);
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-500 dark:text-gray-400">Loading...</p>;
  }

  const allAttachments = [...existingAttachments, ...newAttachments];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit Request"
        description="Update the request details and save your changes."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
            {errors.title && <p className="mt-2 text-sm text-red-600">{errors.title[0]}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
            {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description[0]}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Request Type</label>
              <select name="requestType" value={formData.requestType} onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
                <option value="leave_request">Leave Request</option>
                <option value="shift_change">Shift Change</option>
                <option value="certificate">Certificate</option>
                <option value="equipment_request">Equipment Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Department</label>
              <select name="department" value={formData.department} onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Atașamente */}
          <div className="rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Attached files
            </label>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              You can add new files or remove existing documents.
            </p>

            <UploadDropzone
              endpoint="requestAttachment"
              onClientUploadComplete={(res) => {
                const uploaded: Attachment[] = res.map((file) => ({
                  fileName: file.name,
                  fileUrl: file.ufsUrl,
                  fileKey: file.key,
                  fileType: file.type || "unknown",
                  fileSize: file.size,
                  uploadedBy: typeof file.serverData?.uploadedBy === "string" ? file.serverData.uploadedBy : "",
                  uploadedAt: new Date().toISOString(),
                }));
                setNewAttachments((prev) => [...prev, ...uploaded]);
                setUploadMessage(`${uploaded.length} file(s) submitted.`);
              }}
              onUploadError={(error: Error) => setUploadMessage(`Eroare: ${error.message}`)}
              appearance={{
                container: "border-0 p-0 bg-transparent",
                uploadIcon: "h-8 w-8 text-blue-500",
                label: "text-gray-600 dark:text-gray-400 text-sm",
                allowedContent: "text-gray-400 text-xs",
                button: "bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg px-4 py-2",
              }}
            />

            {uploadMessage && (
              <p className="mt-2 text-sm text-green-600">{uploadMessage}</p>
            )}

            {allAttachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Files ({allAttachments.length})
                </p>

                {allAttachments.map((file) => {
                  const isNew = newAttachments.some((f) => f.fileKey === file.fileKey);
                  return (
                    <div
                      key={file.fileKey}
                      className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm dark:border-gray-700"
                    >
                      <div className="min-w-0">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate font-medium text-blue-600 hover:underline"
                        >
                          📎 {file.fileName}
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.fileSize / 1024).toFixed(1)} KB
                          {isNew && <span className="ml-2 text-green-600">· nou</span>}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isNew
                            ? removeNewAttachment(file.fileKey)
                            : removeExistingAttachment(file.fileKey)
                        }
                        className="shrink-0 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Save edit
          </button>
        </form>
      </div>
    </div>
  );
}
