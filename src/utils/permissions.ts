export type UserRole = "employee" | "hr" | "manager" | "admin";

export function canStartProcessing(
  role?: string,
  createdBy?: string,
  currentUserId?: string
) {
  if (role !== "hr" && role !== "admin") return false;
  // HR nu poate procesa propria cerere
  if (role === "hr" && createdBy && currentUserId && createdBy === currentUserId) return false;
  return true;
}

export function canApproveReject(
  role?: string,
  requestDepartment?: string,
  currentUserDepartment?: string,
  createdBy?: string,
  currentUserId?: string
) {
  // Nimeni nu poate aproba/respinge propria cerere
  if (createdBy && currentUserId && createdBy === currentUserId && role !== "admin") return false;

  if (role === "admin") return true;
  if (role === "manager") return true;

  if (
    role === "hr" &&
    requestDepartment === "HR" &&
    currentUserDepartment === "HR"
  ) {
    return true;
  }

  return false;
}

export function canRequestClarification(
  role?: string,
  createdBy?: string,
  currentUserId?: string
) {
  if (!["hr", "manager", "admin"].includes(role ?? "")) return false;
  // HR nu poate cere clarificări pe propria cerere
  if (role === "hr" && createdBy && currentUserId && createdBy === currentUserId) return false;
  return true;
}

export function canManageAllRequests(role?: string) {
  return role === "hr" || role === "admin";
}

export function canViewDepartmentRequests(role?: string) {
  return role === "manager";
}

export function canCreateRequest(role?: string) {
  return !!role;
}

export function canEditOwnRequest(
  role?: string,
  createdBy?: string,
  currentUserId?: string,
  status?: string
) {
  if (role === "admin") return true;


  return (
    createdBy === currentUserId &&
    (status === "new" || status === "pending_clarification")
  );
}

export function canDeleteOwnRequest(
  role?: string,
  createdBy?: string,
  currentUserId?: string,
  status?: string
) {
  if (role === "admin") return true;


  return createdBy === currentUserId && status === "new";
}
