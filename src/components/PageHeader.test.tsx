import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PageHeader from "./PageHeader";

describe("PageHeader", () => {
    it("afișează titlul corect", () => {
        render(<PageHeader title="Cereri" description="Lista cererilor" />);
        expect(screen.getByRole("heading", { name: "Cereri" })).toBeInTheDocument();
    });

    it("afișează descrierea corectă", () => {
        render(<PageHeader title="Cereri" description="Lista cererilor" />);
        expect(screen.getByText("Lista cererilor")).toBeInTheDocument();
    });

    it("titlul este un element h1", () => {
        render(<PageHeader title="Dashboard" description="Sumar activitate" />);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
    });
});
