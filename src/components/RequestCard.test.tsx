import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import RequestCard from "./RequestCard";

const HR_USER_ID = "user_hr";
const OTHER_USER_ID = "user_other";

const baseRequest = {
    _id: "req_001",
    title: "Cerere decont",
    description: "Cerere pentru decontarea transportului.",
    department: "IT",
    requestType: "equipment_request",
    status: "new",
    priority: "medium",
    createdBy: OTHER_USER_ID, // cererea aparține altcuiva
};

describe("RequestCard", () => {
    it("afișează titlul și descrierea cererii", () => {
        render(
            <RequestCard
                request={baseRequest}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.getByText("Cerere decont")).toBeInTheDocument();
        expect(screen.getByText("Cerere pentru decontarea transportului.")).toBeInTheDocument();
    });

    it("afișează butonul Start processing pentru HR când statusul este new", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "new" }}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /start processing/i })).toBeInTheDocument();
    });

    it("nu afișează Start processing pentru employee", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "new" }}
                role="employee"
                currentUserDepartment="IT"
                currentUserId={OTHER_USER_ID}
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.queryByRole("button", { name: /start processing/i })).not.toBeInTheDocument();
    });

    it("nu afișează Start processing pentru HR pe propria cerere", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "new", createdBy: HR_USER_ID }}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.queryByRole("button", { name: /start processing/i })).not.toBeInTheDocument();
    });

    it("apelează onUpdateStatus cu in_progress la click pe Start processing", async () => {
        const user = userEvent.setup();
        const onUpdateStatus = vi.fn();

        render(
            <RequestCard
                request={{ ...baseRequest, status: "new" }}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={onUpdateStatus}
            />
        );

        await user.click(screen.getByRole("button", { name: /start processing/i }));

        expect(onUpdateStatus).toHaveBeenCalledTimes(1);
        expect(onUpdateStatus).toHaveBeenCalledWith("req_001", "in_progress");
    });

    it("afișează Request clarification pentru HR când statusul este in_progress", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress" }}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /request clarification/i })).toBeInTheDocument();
    });

    it("nu afișează Request clarification pentru HR pe propria cerere", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress", createdBy: HR_USER_ID }}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.queryByRole("button", { name: /request clarification/i })).not.toBeInTheDocument();
    });

    it("apelează onUpdateStatus cu pending_clarification la click pe Request clarification", async () => {
        const user = userEvent.setup();
        const onUpdateStatus = vi.fn();

        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress" }}
                role="hr"
                currentUserDepartment="HR"
                currentUserId={HR_USER_ID}
                updatingId={null}
                onUpdateStatus={onUpdateStatus}
            />
        );

        await user.click(screen.getByRole("button", { name: /request clarification/i }));

        expect(onUpdateStatus).toHaveBeenCalledTimes(1);
        expect(onUpdateStatus).toHaveBeenCalledWith("req_001", "pending_clarification");
    });

    it("permite managerului să aprobe o cerere din propriul departament", async () => {
        const user = userEvent.setup();
        const onUpdateStatus = vi.fn();

        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress", department: "IT" }}
                role="manager"
                currentUserDepartment="IT"
                currentUserId="user_manager"
                updatingId={null}
                onUpdateStatus={onUpdateStatus}
            />
        );

        await user.click(screen.getByRole("button", { name: /approve/i }));

        expect(onUpdateStatus).toHaveBeenCalledTimes(1);
        expect(onUpdateStatus).toHaveBeenCalledWith("req_001", "approved");
    });

    it("permite managerului să respingă o cerere din propriul departament", async () => {
        const user = userEvent.setup();
        const onUpdateStatus = vi.fn();

        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress", department: "IT" }}
                role="manager"
                currentUserDepartment="IT"
                currentUserId="user_manager"
                updatingId={null}
                onUpdateStatus={onUpdateStatus}
            />
        );

        await user.click(screen.getByRole("button", { name: /reject/i }));

        expect(onUpdateStatus).toHaveBeenCalledTimes(1);
        expect(onUpdateStatus).toHaveBeenCalledWith("req_001", "rejected");
    });

    it("afișează Approve și Reject pentru admin indiferent de departament", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress", department: "Finance" }}
                role="admin"
                currentUserDepartment="IT"
                currentUserId="user_admin"
                updatingId={null}
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /approve/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /reject/i })).toBeInTheDocument();
    });

    it("dezactivează butoanele când cererea este în curs de actualizare", () => {
        render(
            <RequestCard
                request={{ ...baseRequest, status: "in_progress", department: "IT" }}
                role="manager"
                currentUserDepartment="IT"
                currentUserId="user_manager"
                updatingId="req_001"
                onUpdateStatus={vi.fn()}
            />
        );

        expect(screen.getByRole("button", { name: /approve/i })).toBeDisabled();
        expect(screen.getByRole("button", { name: /reject/i })).toBeDisabled();
    });
});