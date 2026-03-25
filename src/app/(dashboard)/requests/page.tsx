"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import PageHeader from "@/components/PageHeader";
import RequestsFilters from "@/components/RequestsFilters";
import RequestCard from "@/components/RequestCard";
import { useUser } from "@clerk/nextjs";

type RequestItem = {
  _id: string;
  title: string;
  description: string;
  department: string;
  requestType: string;
  status: string;
  priority: string;
  createdBy: string;
};

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
};

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  const { user } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;

  useEffect(() => {
    fetchRequests(currentPage);
  }, [currentPage, debouncedSearch, statusFilter, departmentFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, departmentFilter]);

  const fetchRequests = async (page: number) => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        page: page.toString(),
        limit: "5",
        search: debouncedSearch,
        status: statusFilter,
        department: departmentFilter,
      });

      const res = await fetch(`/api/requests?${query.toString()}`);
      const data = await res.json();

      if (data.success) {
        setRequests(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingId(id);

      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchRequests(currentPage);
      }
    } catch (error) {
      console.error("Status update error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requests"
        description="Vizualizează și gestionează toate cererile din sistem."
      />

      <RequestsFilters
        search={search}
        statusFilter={statusFilter}
        departmentFilter={departmentFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDepartmentChange={setDepartmentFilter}
      />

      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">Loading requests...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">No requests found.</p>
            </div>
          ) : (
            requests.map((req) => (
              <RequestCard
                key={req._id}
                request={req}
                updatingId={updatingId}
                onUpdateStatus={updateStatus}
                role={role}
              />
            ))
          )}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
          <button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Previous
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === pagination.totalPages}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 