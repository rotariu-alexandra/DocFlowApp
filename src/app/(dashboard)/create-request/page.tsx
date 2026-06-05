"use client";

import { useState } from "react";
import { requestSchema } from "@/utils/requestValidation";
import PageHeader from "@/components/PageHeader";
import { UploadDropzone } from "@/utils/uploadthing";

type FormData = {
  title: string;
  description: string;
  requestType:
  | "leave_request"
  | "shift_change"
  | "certificate"
  | "equipment_request"
  | "other";
  department: "HR" | "IT" | "Finance" | "Admin" | "Management";
  priority: "low" | "medium" | "high";
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

type FormErrors = {
  title?: string;
  description?: string;
  requestType?: string;
  department?: string;
  priority?: string;
};

const requestTypeDefaults = {
  leave_request: { title: "Leave Request", department: "HR" },
  shift_change: { title: "Shift Change Request", department: "HR" },
  certificate: { title: "Certificate Request", department: "HR" },
  equipment_request: { title: "Equipment Request", department: "IT" },
  other: { title: "General Request", department: "Admin" },
} as const;

export default function CreateRequestPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "General Request",
    description: "",
    requestType: "other",
    department: "Admin",
    priority: "medium",
  });

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "requestType") {
      const selectedType = value as keyof typeof requestTypeDefaults;
      const defaults = requestTypeDefaults[selectedType];

      setFormData((prev) => {
        const previousDefaultTitle = requestTypeDefaults[prev.requestType].title;
        const shouldAutofillTitle =
          prev.title.trim() === "" || prev.title === previousDefaultTitle;

        return {
          ...prev,
          requestType: selectedType,
          department: defaults.department as FormData["department"],
          title: shouldAutofillTitle ? defaults.title : prev.title,
        };
      });

      setErrors((prev) => ({
        ...prev,
        requestType: undefined,
        department: undefined,
        title: undefined,
      }));

      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = () => {
    const result = requestSchema.safeParse({
      title: formData.title,
      description: formData.description,
      requestType: formData.requestType,
      department: formData.department,
      priority: formData.priority,
    });

    if (result.success) {
      setErrors({});
      return true;
    }

    const fieldErrors = result.error.flatten().fieldErrors;
    setErrors({
      title: fieldErrors.title?.[0],
      description: fieldErrors.description?.[0],
      requestType: fieldErrors.requestType?.[0],
      department: fieldErrors.department?.[0],
      priority: fieldErrors.priority?.[0],
    });

    return false;
  };

  const removeAttachment = (fileKey: string) => {
    setAttachments((prev) => prev.filter((f) => f.fileKey !== fileKey));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      console.log("ATTACHMENTS BEFORE SUBMIT:", attachments);

      console.log("FULL PAYLOAD:", {
        ...formData,
        attachments,
      });

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, attachments }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Your request was submitted successfully.");
        setFormData({
          title: "General Request",
          description: "",
          requestType: "other",
          department: "Admin",
          priority: "medium",
        });
        setAttachments([]);
        setErrors({});
      } else {
        setMessage(data.message || "Eroare la salvarea cererii.");

        if (data.errors?.fieldErrors) {
          setErrors({
            title: data.errors.fieldErrors.title?.[0],
            description: data.errors.fieldErrors.description?.[0],
            requestType: data.errors.fieldErrors.requestType?.[0],
            department: data.errors.fieldErrors.department?.[0],
            priority: data.errors.fieldErrors.priority?.[0],
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessage("Eroare de conexiune cu serverul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create Request"
        description="Fill out the form to submit a new internal request."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Leave Request"
              className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${errors.title
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrie cererea..."
              rows={5}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${errors.description
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Request Type + Department */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Request Type
              </label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="leave_request">Leave Request</option>
                <option value="shift_change">Shift Change</option>
                <option value="certificate">Certificate</option>
                <option value="equipment_request">Equipment Request</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
                <option value="Management">Management</option>
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Atașamente */}
          <div className="rounded-2xl border border-dashed border-gray-300 p-4 dark:border-gray-700">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Justified Documents
            </label>
            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              PDF, DOCX, imag — max. 8 MB per filie, max. 5 filies.
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
                  uploadedBy:
                    typeof file.serverData?.uploadedBy === "string"
                      ? file.serverData.uploadedBy
                      : "",
                  uploadedAt: new Date().toISOString(),
                }));

                setAttachments((prev) => [...prev, ...uploaded]);
                setMessage(`${uploaded.length} file(s) uploaded cu successfully.`);
              }}
              onUploadError={(error: Error) => {
                setMessage(`Eroare upload: ${error.message}`);
              }}
              appearance={{
                container:
                  "border border-dashed border-gray-300 p-4 rounded-xl max-w-m",
                uploadIcon: "h-8 w-8 text-blue-500",
                label: "text-gray-600 dark:text-gray-400 text-sm",
                allowedContent: "text-gray-400 text-xs",
                button:
                  "bg-blue-600 text-white px-4 py-2 rounded-lg text-sm",
              }}
            />

            {/* Lista fișiere încărcate */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attached Files ({attachments.length})
                </p>

                {attachments.map((file) => (
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
                        {(file.fileSize / 1024).toFixed(1)} KB · {file.fileType}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAttachment(file.fileKey)}
                      className="shrink-0 rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting" : "Submit Requests"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
