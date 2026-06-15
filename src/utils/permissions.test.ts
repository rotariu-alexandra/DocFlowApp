import { describe, it, expect } from "vitest";
import {
    canStartProcessing,
    canApproveReject,
    canRequestClarification,
    canEditOwnRequest,
    canDeleteOwnRequest,
    canCreateRequest,
} from "./permissions";

describe("canStartProcessing", () => {
    it("permite HR să înceapă procesarea pe cererea altcuiva", () => {
        expect(canStartProcessing("hr", "user_other", "user_hr")).toBe(true);
    });
    it("permite adminului să înceapă procesarea", () => {
        expect(canStartProcessing("admin", "user_other", "user_admin")).toBe(true);
    });
    it("blochează HR să proceseze propria cerere", () => {
        expect(canStartProcessing("hr", "user_hr", "user_hr")).toBe(false);
    });
    it("blochează employee-ul să înceapă procesarea", () => {
        expect(canStartProcessing("employee", "user_other", "user_emp")).toBe(false);
    });
    it("blochează managerul să înceapă procesarea", () => {
        expect(canStartProcessing("manager", "user_other", "user_mgr")).toBe(false);
    });
    it("blochează rolul undefined", () => {
        expect(canStartProcessing(undefined)).toBe(false);
    });
});

describe("canApproveReject", () => {
    it("permite adminului să aprobe indiferent de departament", () => {
        expect(canApproveReject("admin", "IT", "Management", "user_other", "user_admin")).toBe(true);
    });
    it("permite managerului să aprobe orice cerere", () => {
        expect(canApproveReject("manager", "Finance", "IT", "user_other", "user_mgr")).toBe(true);
    });
    it("permite HR să aprobe cereri din departamentul HR (altă persoană)", () => {
        expect(canApproveReject("hr", "HR", "HR", "user_other", "user_hr")).toBe(true);
    });
    it("blochează HR să aprobe propria cerere", () => {
        expect(canApproveReject("hr", "HR", "HR", "user_hr", "user_hr")).toBe(false);
    });
    it("blochează HR să aprobe cereri din alt departament", () => {
        expect(canApproveReject("hr", "IT", "HR", "user_other", "user_hr")).toBe(false);
    });
    it("blochează employee-ul să aprobe", () => {
        expect(canApproveReject("employee", "IT", "IT", "user_other", "user_emp")).toBe(false);
    });
});

describe("canRequestClarification", () => {
    it("permite HR să ceară clarificări pe cererea altcuiva", () => {
        expect(canRequestClarification("hr", "user_other", "user_hr")).toBe(true);
    });
    it("blochează HR să ceară clarificări pe propria cerere", () => {
        expect(canRequestClarification("hr", "user_hr", "user_hr")).toBe(false);
    });
    it("permite manager și admin să ceară clarificări", () => {
        expect(canRequestClarification("manager", "user_other", "user_mgr")).toBe(true);
        expect(canRequestClarification("admin", "user_other", "user_admin")).toBe(true);
    });
    it("blochează employee-ul să ceară clarificări", () => {
        expect(canRequestClarification("employee", "user_other", "user_emp")).toBe(false);
    });
});

describe("canEditOwnRequest", () => {
    const userId = "user_123";
    const otherId = "user_456";

    it("permite editarea propriei cereri cu statusul new", () => {
        expect(canEditOwnRequest("employee", userId, userId, "new")).toBe(true);
    });
    it("permite editarea propriei cereri cu statusul pending_clarification", () => {
        expect(canEditOwnRequest("employee", userId, userId, "pending_clarification")).toBe(true);
    });
    it("blochează editarea cererii altcuiva", () => {
        expect(canEditOwnRequest("employee", otherId, userId, "new")).toBe(false);
    });
    it("blochează editarea dacă statusul este in_progress", () => {
        expect(canEditOwnRequest("employee", userId, userId, "in_progress")).toBe(false);
    });
    it("permite adminului să editeze orice cerere", () => {
        expect(canEditOwnRequest("admin", otherId, userId, "approved")).toBe(true);
    });
});

describe("canDeleteOwnRequest", () => {
    const userId = "user_123";
    const otherId = "user_456";

    it("permite ștergerea propriei cereri cu statusul new", () => {
        expect(canDeleteOwnRequest("employee", userId, userId, "new")).toBe(true);
    });
    it("blochează ștergerea dacă statusul nu este new", () => {
        expect(canDeleteOwnRequest("employee", userId, userId, "in_progress")).toBe(false);
        expect(canDeleteOwnRequest("employee", userId, userId, "approved")).toBe(false);
    });
    it("blochează ștergerea cererii altcuiva", () => {
        expect(canDeleteOwnRequest("employee", otherId, userId, "new")).toBe(false);
    });
    it("permite adminului să șteargă orice cerere în orice status", () => {
        expect(canDeleteOwnRequest("admin", otherId, userId, "approved")).toBe(true);
    });
});

describe("canCreateRequest", () => {
    it("permite oricui cu un rol să creeze cereri", () => {
        expect(canCreateRequest("employee")).toBe(true);
        expect(canCreateRequest("hr")).toBe(true);
    });
    it("blochează utilizatorii fără rol", () => {
        expect(canCreateRequest(undefined)).toBe(false);
    });
});