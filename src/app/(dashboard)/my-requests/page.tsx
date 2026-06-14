"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import RequestsFilters from "@/components/RequestsFilters";
import MyRequestCard from "@/components/MyRequestCard";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchMyRequests, deleteMyRequest } from "@/services/myRequestsService";

type RequestItem = {
  _id: string; title: string; description: string; department: string;
  requestType: string; status: string; priority: string;
  createdBy: string; createdAt: string; updatedAt: string;
};
type PaginationData = { currentPage: number; totalPages: number; totalItems: number; limit: number };

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { loadMyRequests(currentPage); }, [currentPage, debouncedSearch, statusFilter]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter]);

  async function loadMyRequests(page: number) {
    try {
      setLoading(true);
      const data = await fetchMyRequests({ page, limit: 5, search: debouncedSearch, status: statusFilter });
      setRequests(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    try {
      setDeletingId(id);
      await deleteMyRequest(id);
      if (requests.length === 1 && currentPage > 1) { setCurrentPage(p => p - 1); return; }
      await loadMyRequests(currentPage);
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <PageHeader title="My Requests" description="View and manage the requests you created." />

      <RequestsFilters
        search={search} statusFilter={statusFilter} departmentFilter=""
        onSearchChange={setSearch} onStatusChange={setStatusFilter}
        onDepartmentChange={() => { }} hideDepartmentFilter
      />

      {loading ? (
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading…</p>
      ) : requests.length === 0 ? (
        <div className="card"><p style={{ fontSize: "13px", color: "var(--muted)" }}>No requests found.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {requests.map(r => (
            <MyRequestCard key={r._id} request={r} deletingId={deletingId} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="pagination-btn">
            ← Previous
          </button>
          <span className="pagination-info">Page {pagination.currentPage} of {pagination.totalPages}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === pagination.totalPages} className="pagination-btn">
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
