import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
    it("afișează 'New' pentru statusul new", () => {
        render(<StatusBadge status="new" />);
        expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("afișează 'In progress' pentru statusul in_progress", () => {
        render(<StatusBadge status="in_progress" />);
        expect(screen.getByText("In progress")).toBeInTheDocument();
    });

    it("afișează 'Clarification' pentru statusul pending_clarification", () => {
        render(<StatusBadge status="pending_clarification" />);
        expect(screen.getByText("Clarification")).toBeInTheDocument();
    });

    it("afișează 'Approved' pentru statusul approved", () => {
        render(<StatusBadge status="approved" />);
        expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("afișează 'Rejected' pentru statusul rejected", () => {
        render(<StatusBadge status="rejected" />);
        expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("afișează valoarea brută dacă statusul nu este recunoscut", () => {
        render(<StatusBadge status="archived" />);
        expect(screen.getByText("archived")).toBeInTheDocument();
    });

    it("înlocuiește underscoreul cu cratimă în clasa CSS", () => {
        render(<StatusBadge status="in_progress" />);
        expect(screen.getByText("In progress")).toHaveClass("badge-in-progress");
    });
});
