"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import RequestsFilters from "@/components/RequestsFilters";
import MyRequestCard from "@/components/MyRequestCard";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchMyRequests, deleteMyRequest } from "@/services/myRequestsService";

type RequestItem = {
  _id: string;
  title: string;
  description: string;
  department: string;
  requestType: string;
  status: string;
  priority: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type PaginationData = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
};

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    loadMyRequests(currentPage);
  }, [currentPage, debouncedSearch, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter]);

  async function loadMyRequests(page: number) {
    try {
      setLoading(true);

      const data = await fetchMyRequests({
        page,
        limit: 5,
        search: debouncedSearch,
        status: statusFilter,
      });

      setRequests(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Fetch my requests error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this request?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteMyRequest(id);

      if (requests.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
        return;
      }

      await loadMyRequests(currentPage);
    } catch (error) {
      console.error("Delete my request error:", error);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Requests"
        description="Vizualizează cererile create de tine și gestionează-le cât timp au statusul new."
      />

      <RequestsFilters
        search={search}
        statusFilter={statusFilter}
        departmentFilter=""
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onDepartmentChange={() => {}}
        hideDepartmentFilter
      />

      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">
            Loading your requests...
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">
                You have no requests yet.
              </p>
            </div>
          ) : (
            requests.map((request) => (
              <MyRequestCard
                key={request._id}
                request={request}
                deletingId={deletingId}
                onDelete={handleDelete}
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
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}