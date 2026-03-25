"use client";

import { useState } from "react";
import { requestSchema } from "@/utils/requestValidation";
import PageHeader from "@/components/PageHeader";

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

type FormErrors = {
  title?: string;
  description?: string;
  requestType?: string;
  department?: string;
  priority?: string;
};

const requestTypeDefaults = {
  leave_request: {
    title: "Leave Request",
    department: "HR",
  },
  shift_change: {
    title: "Shift Change Request",
    department: "HR",
  },
  certificate: {
    title: "Certificate Request",
    department: "HR",
  },
  equipment_request: {
    title: "Equipment Request",
    department: "IT",
  },
  other: {
    title: "General Request",
    department: "Admin",
  },
} as const;

export default function CreateRequestPage() {
  const [formData, setFormData] = useState<FormData>({
    title: "General Request",
    description: "",
    requestType: "other",
    department: "Admin",
    priority: "medium",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const isValid = validateForm();
    if (!isValid) return;

    try {
      setLoading(true);

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Request created successfully.");
        setFormData({
          title: "General Request",
          description: "",
          requestType: "other",
          department: "Admin",
          priority: "medium",
        });
        setErrors({});
      } else {
        setMessage(
          data.message || "Something went wrong while saving the request."
        );

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
      setMessage("Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Create Request"
        description="Completează formularul pentru a trimite o nouă cerere internă."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
              className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${
                errors.title
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
              }`}
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

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
              className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
              }`}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Request Type
              </label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${
                  errors.requestType
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
              >
                <option value="leave_request">Leave Request</option>
                <option value="shift_change">Shift Change</option>
                <option value="certificate">Certificate</option>
                <option value="equipment_request">Equipment Request</option>
                <option value="other">Other</option>
              </select>
              {errors.requestType && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.requestType}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${
                  errors.department
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                }`}
              >
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
                <option value="Management">Management</option>
              </select>
              {errors.department && (
                <p className="mt-2 text-sm text-red-600">{errors.department}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition dark:bg-gray-950 dark:text-gray-100 ${
                errors.priority
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
              }`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="mt-2 text-sm text-red-600">{errors.priority}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
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