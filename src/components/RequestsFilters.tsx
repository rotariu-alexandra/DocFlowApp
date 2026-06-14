type RequestsFiltersProps = {
  search: string;
  statusFilter: string;
  departmentFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  hideDepartmentFilter?: boolean;
};

export default function RequestsFilters({
  search, statusFilter, departmentFilter,
  onSearchChange, onStatusChange, onDepartmentChange,
  hideDepartmentFilter = false,
}: RequestsFiltersProps) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search requests…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="filter-search"
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className="filter-select">
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="in_progress">In progress</option>
          <option value="pending_clarification">Clarification</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {!hideDepartmentFilter && (
          <select value={departmentFilter} onChange={(e) => onDepartmentChange(e.target.value)} className="filter-select">
            <option value="">All departments</option>
            {["HR", "IT", "Finance", "Legal", "Operations", "Marketing", "Sales", "Admin", "Management"].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
