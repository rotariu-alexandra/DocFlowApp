import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MyRequestCard from "./MyRequestCard";

const baseRequest = {
    _id: "req_001",
    title: "Cerere concediu",
    description: "Am nevoie de 5 zile libere în august.",
    department: "IT",
    requestType: "leave_request",
    status: "new",
    priority: "medium",
    createdAt: "2026-06-01T10:00:00Z",
};

describe("MyRequestCard", () => {
    it("afișează titlul cererii", () => {
        render(<MyRequestCard request={baseRequest} deletingId={null} onDelete={vi.fn()} />);
        expect(screen.getByText("Cerere concediu")).toBeInTheDocument();
    });

    it("afișează descrierea cererii", () => {
        render(<MyRequestCard request={baseRequest} deletingId={null} onDelete={vi.fn()} />);
        expect(screen.getByText(/Am nevoie de 5 zile/)).toBeInTheDocument();
    });

    it("trunchiază descrierile mai lungi de 120 de caractere", () => {
        const longDesc = "A".repeat(130);
        render(
            <MyRequestCard
                request={{ ...baseRequest, description: longDesc }}
                deletingId={null}
                onDelete={vi.fn()}
            />
        );
        expect(screen.getByText("A".repeat(120) + "…")).toBeInTheDocument();
    });

    it("afișează butoanele View, Edit și Delete când statusul este new", () => {
        render(<MyRequestCard request={baseRequest} deletingId={null} onDelete={vi.fn()} />);
        expect(screen.getAllByText("View").length).toBeGreaterThan(0);
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("afișează Edit dar nu Delete pentru statusul pending_clarification", () => {
        render(
            <MyRequestCard
                request={{ ...baseRequest, status: "pending_clarification" }}
                deletingId={null}
                onDelete={vi.fn()}
            />
        );
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("nu afișează Edit sau Delete pentru statusul approved", () => {
        render(
            <MyRequestCard
                request={{ ...baseRequest, status: "approved" }}
                deletingId={null}
                onDelete={vi.fn()}
            />
        );
        expect(screen.queryByText("Edit")).not.toBeInTheDocument();
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("nu afișează Delete pentru statusul in_progress", () => {
        render(
            <MyRequestCard
                request={{ ...baseRequest, status: "in_progress" }}
                deletingId={null}
                onDelete={vi.fn()}
            />
        );
        expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    });

    it("apelează onDelete cu ID-ul corect la click pe Delete", async () => {
        const onDelete = vi.fn();
        render(<MyRequestCard request={baseRequest} deletingId={null} onDelete={onDelete} />);
        await userEvent.click(screen.getByText("Delete"));
        expect(onDelete).toHaveBeenCalledWith("req_001");
    });

    it("afișează 'Deleting…' și dezactivează butonul în timpul ștergerii", () => {
        render(
            <MyRequestCard request={baseRequest} deletingId="req_001" onDelete={vi.fn()} />
        );
        const btn = screen.getByText("Deleting…");
        expect(btn).toBeDisabled();
    });

    it("afișează data formatată corect", () => {
        render(<MyRequestCard request={baseRequest} deletingId={null} onDelete={vi.fn()} />);
        expect(screen.getByText("01/06/2026")).toBeInTheDocument();
    });

    it("nu permite click pe Delete când cererea este deja în proces de ștergere", async () => {
        const user = userEvent.setup();
        const onDelete = vi.fn();

        render(
            <MyRequestCard
                request={baseRequest}
                deletingId="req_001"
                onDelete={onDelete}
            />
        );

        const deleteButton = screen.getByRole("button", { name: "Deleting…" });

        expect(deleteButton).toBeDisabled();

        await user.click(deleteButton);

        expect(onDelete).not.toHaveBeenCalled();
    });

});
