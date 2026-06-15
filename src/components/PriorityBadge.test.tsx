import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PriorityBadge from "./PriorityBadge";

describe("PriorityBadge", () => {
    it("afișează 'Low' pentru prioritatea low", () => {
        render(<PriorityBadge priority="low" />);
        expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("afișează 'Medium' pentru prioritatea medium", () => {
        render(<PriorityBadge priority="medium" />);
        expect(screen.getByText("Medium")).toBeInTheDocument();
    });

    it("afișează 'High' pentru prioritatea high", () => {
        render(<PriorityBadge priority="high" />);
        expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("afișează valoarea brută dacă prioritatea nu este recunoscută", () => {
        render(<PriorityBadge priority="critical" />);
        expect(screen.getByText("critical")).toBeInTheDocument();
    });

    it("aplică clasa CSS corectă bazată pe prioritate", () => {
        render(<PriorityBadge priority="high" />);
        expect(screen.getByText("High")).toHaveClass("badge-priority-high");
    });
});
