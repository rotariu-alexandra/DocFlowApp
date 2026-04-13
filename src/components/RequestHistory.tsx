"use client";

import { useEffect, useState } from "react";

type HistoryItem = {
    _id: string;
    action: "created" | "updated" | "status_changed" | "deleted";
    performedBy: string;
    performedByRole?: string;
    details?: {
        message?: string;
        from?: string;
        to?: string;
        title?: string;
    };
    createdAt: string;
};

type RequestHistoryProps = {
    requestId: string;
};

function getHistoryText(item: HistoryItem) {
    if (item.action === "created") {
        return "Request created";
    }

    if (item.action === "updated") {
        return "Request details updated";
    }

    if (item.action === "deleted") {
        return "Request deleted";
    }

    if (item.action === "status_changed") {
        return `Status changed from "${item.details?.from}" to "${item.details?.to}"`;
    }

    return "Action performed";
}

export default function RequestHistory({ requestId }: RequestHistoryProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/requests/${requestId}/history`);
                const data = await res.json();

                if (data.success) {
                    setHistory(data.data);
                }
            } catch (error) {
                console.error("Fetch request history error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [requestId]);

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                History
            </h2>

            {loading ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Loading history...
                </p>
            ) : history.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    No history found.
                </p>
            ) : (
                <div className="mt-4 space-y-4">
                    {history.map((item) => (
                        <div
                            key={item._id}
                            className="rounded-xl border border-gray-200 p-4 dark:border-gray-800"
                        >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {getHistoryText(item)}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
                                <span>By: {item.performedBy}</span>
                                <span>Role: {item.performedByRole || "employee"}</span>
                                <span>
                                    At: {new Date(item.createdAt).toLocaleString("ro-RO")}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}