"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

type Comment = {
    _id: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    content: string;
    createdAt: string;
};

const ROLE_LABEL: Record<string, string> = {
    employee: "Angajat",
    hr: "HR",
    manager: "Manager",
    admin: "Admin",
};

const ROLE_COLOR: Record<string, string> = {
    employee: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    hr: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    manager: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    admin: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function CommentsSection({ requestId }: { requestId: string }) {
    const { user } = useUser();
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchComments();
    }, [requestId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/requests/${requestId}/comments`);
            const data = await res.json();
            if (data.success) setComments(data.data);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        setError("");
        const trimmed = content.trim();
        if (!trimmed) { setError("Comentariul nu poate fi gol."); return; }

        try {
            setSubmitting(true);
            const res = await fetch(`/api/requests/${requestId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed }),
            });
            const data = await res.json();
            if (data.success) {
                setContent("");
                setComments((prev) => [...prev, data.data]);
            } else {
                setError(data.message || "Eroare.");
            }
        } catch {
            setError("Eroare de conexiune.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Comments
            </h2>

            <div className="mt-5 space-y-4">
                {loading ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Se încarcă...</p>
                ) : comments.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        No comments yet.
                    </p>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment._id}
                            className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {comment.authorName}
                                    </span>
                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLOR[comment.authorRole] ?? ROLE_COLOR.employee}`}>
                                        {ROLE_LABEL[comment.authorRole] ?? comment.authorRole}
                                    </span>
                                    {comment.authorId === user?.id && (
                                        <span className="text-xs text-gray-400">(tu)</span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(comment.createdAt).toLocaleString("ro-RO")}
                                </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
                                {comment.content}
                            </p>
                        </div>
                    ))
                )}
            </div>

            {/* Formular */}
            <div className="mt-6 space-y-3">
                <textarea
                    value={content}
                    onChange={(e) => { setContent(e.target.value); setError(""); }}
                    placeholder="Add a comment..."
                    rows={3}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition dark:bg-gray-950 dark:text-gray-100 ${error
                        ? "border-red-400 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-500 dark:border-gray-700"
                        }`}
                />
                <div className="flex items-center justify-between gap-3">
                    {error ? (
                        <p className="text-sm text-red-600">{error}</p>
                    ) : (
                        <span className="text-xs text-gray-400">{content.length}/2000</span>
                    )}
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? "Submitting" : "Submit Comment"}
                    </button>
                </div>
            </div>
        </div>
    );
}
