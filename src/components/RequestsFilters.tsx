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
  search,
  statusFilter,
  departmentFilter,
  onSearchChange,
  onStatusChange,
  onDepartmentChange,
  hideDepartmentFilter = false,
}: RequestsFiltersProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
      <input
        type="text"
        placeholder="Search requests..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
      />

      <div className="flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="in_progress">In Progress</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {!hideDepartmentFilter && (
          <select
            value={departmentFilter}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
          >
            <option value="">All Departments</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
            <option value="Admin">Admin</option>
            <option value="Management">Management</option>
          </select>
        )}
      </div>
    </div>
  );
}