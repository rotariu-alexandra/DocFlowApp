"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import PageHeader from "@/components/PageHeader";
import RequestsFilters from "@/components/RequestsFilters";
import RequestCard from "@/components/RequestCard";
import { useUser } from "@clerk/nextjs";

type RequestItem = {
  _id: string; title: string; description: string; department: string;
  requestType: string; status: string; priority: string; createdBy: string;
};
type PaginationData = { currentPage: number; totalPages: number; totalItems: number; limit: number };

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

  const { user, isLoaded } = useUser();
  const role = user?.publicMetadata?.role as string | undefined;
  const currentUserDepartment = user?.publicMetadata?.department as string | undefined;

  useEffect(() => { if (isLoaded) fetchRequests(currentPage); }, [currentPage, debouncedSearch, statusFilter, departmentFilter, isLoaded]);
  useEffect(() => { setCurrentPage(1); }, [debouncedSearch, statusFilter, departmentFilter]);

  const fetchRequests = async (page: number) => {
    try {
      setLoading(true);
      const q = new URLSearchParams({ page: page.toString(), limit: "5", search: debouncedSearch, status: statusFilter, department: departmentFilter });
      const res = await fetch(`/api/requests?${q}`);
      const data = await res.json();
      if (data.success) { setRequests(data.data); setPagination(data.pagination); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await res.json();
      if (data.success) await fetchRequests(currentPage);
    } catch (e) { console.error(e); }
    finally { setUpdatingId(null); }
  };

  if (!isLoaded) return <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading…</p>;

  if (role === "employee") return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <PageHeader title="Requests" description="Request processing page." />
      <div className="card"><p style={{ fontSize: "13px", color: "var(--muted)" }}>You can manage your own requests from the "My Requests" page.</p></div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <PageHeader title="Requests" description="View and manage all system requests." />

      <RequestsFilters
        search={search} statusFilter={statusFilter} departmentFilter={departmentFilter}
        onSearchChange={setSearch} onStatusChange={setStatusFilter} onDepartmentChange={setDepartmentFilter}
      />

      {loading ? (
        <p style={{ fontSize: "13px", color: "var(--muted)" }}>Loading…</p>
      ) : requests.length === 0 ? (
        <div className="card"><p style={{ fontSize: "13px", color: "var(--muted)" }}>No requests found.</p></div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {requests.map(req => (
            <RequestCard key={req._id} request={req} updatingId={updatingId}
              onUpdateStatus={updateStatus} role={role} currentUserDepartment={currentUserDepartment} />
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
