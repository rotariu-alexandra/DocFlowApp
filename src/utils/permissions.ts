export type UserRole = "employee" | "hr" | "manager" | "admin";

export function canStartProcessing(role?: string) {
  return role === "hr" || role === "admin";
}

export function canApproveReject(role?: string) {
  return role === "manager" || role === "admin";
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

  return createdBy === currentUserId && status === "new";
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