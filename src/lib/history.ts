import RequestHistory from "@/models/RequestHistory";

type CreateHistoryEntryParams = {
    requestId: string;
    action: "created" | "updated" | "status_changed" | "deleted";
    performedBy: string;
    performedByRole?: string;
    details?: Record<string, any>;
};

export async function createHistoryEntry({
    requestId,
    action,
    performedBy,
    performedByRole,
    details = {},
}: CreateHistoryEntryParams) {
    return RequestHistory.create({
        requestId,
        action,
        performedBy,
        performedByRole: performedByRole || "employee",
        details,
    });
}