"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requestSchema } from "@/utils/requestValidation";
import PageHeader from "@/components/PageHeader";

type FormData = {
  title: string;
  description: string;
  department: "HR" | "IT" | "Finance" | "Admin" | "Management";
  priority: "low" | "medium" | "high";
  requestType:
    | "leave_request"
    | "shift_change"
    | "certificate"
    | "equipment_request"
    | "other";
};

type FormErrors = {
  title?: string[];
  description?: string[];
  department?: string[];
  priority?: string[];
  requestType?: string[];
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);

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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = requestSchema.safeParse(formData);

    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validation.data),
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Edit Request"
        description="Modifică informațiile cererii și salvează schimbările."
      />

      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
            {errors.title && (
              <p className="mt-2 text-sm text-red-600">{errors.title[0]}</p>
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
              rows={5}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-600">
                {errors.description[0]}
              </p>
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
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="leave_request">Leave Request</option>
                <option value="shift_change">Shift Change</option>
                <option value="certificate">Certificate</option>
                <option value="equipment_request">Equipment Request</option>
                <option value="other">Other</option>
              </select>
              {errors.requestType && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.requestType[0]}
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
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              >
                <option value="HR">HR</option>
                <option value="IT">IT</option>
                <option value="Finance">Finance</option>
                <option value="Admin">Admin</option>
                <option value="Management">Management</option>
              </select>
              {errors.department && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.department[0]}
                </p>
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
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="mt-2 text-sm text-red-600">
                {errors.priority[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Update Request
          </button>
        </form>
      </div>
    </div>
  );
}