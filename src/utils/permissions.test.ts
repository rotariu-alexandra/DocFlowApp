import {
    canStartProcessing,
    canApproveReject,
    canEditOwnRequest,
    canDeleteOwnRequest,
} from "./permissions";

// ─────────────────────────────────────────────────────────────
// canStartProcessing
// ─────────────────────────────────────────────────────────────
describe("canStartProcessing", () => {
    it("permite HR să înceapă procesarea", () => {
        expect(canStartProcessing("hr")).toBe(true);
    });

    it("permite adminului să înceapă procesarea", () => {
        expect(canStartProcessing("admin")).toBe(true);
    });

    it("blochează angajatul să înceapă procesarea", () => {
        expect(canStartProcessing("employee")).toBe(false);
    });

    it("blochează rolul undefined", () => {
        expect(canStartProcessing(undefined)).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────
// canApproveReject
// ─────────────────────────────────────────────────────────────
describe("canApproveReject", () => {
    it("permite managerului să aprobe o cerere din propriul departament", () => {
        expect(canApproveReject("manager", "IT", "IT")).toBe(true);
    });

    it("blochează managerul să aprobe o cerere din alt departament", () => {
        expect(canApproveReject("manager", "Finance", "IT")).toBe(true);
    });

    it("permite adminului să aprobe indiferent de departament", () => {
        expect(canApproveReject("admin", "IT", "Management")).toBe(true);
    });

    it("blochează angajatul să aprobe", () => {
        expect(canApproveReject("employee", "IT", "IT")).toBe(false);
    });

    it("blochează rolul undefined", () => {
        expect(canApproveReject(undefined, "IT", "IT")).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────
// canEditOwnRequest
// ─────────────────────────────────────────────────────────────
describe("canEditOwnRequest", () => {
    const userId = "user_abc123";
    const otherId = "user_xyz456";

    it("permite angajatului să editeze propria cerere cu status new", () => {
        expect(canEditOwnRequest("employee", userId, userId, "new")).toBe(true);
    });

    it("blochează angajatul să editeze cererea altcuiva", () => {
        expect(canEditOwnRequest("employee", otherId, userId, "new")).toBe(false);
    });

    it("blochează editarea dacă cererea este deja in_progress", () => {
        expect(canEditOwnRequest("employee", userId, userId, "in_progress")).toBe(false);
    });

    it("blochează editarea dacă cererea este aprobată", () => {
        expect(canEditOwnRequest("employee", userId, userId, "approved")).toBe(false);
    });

    it("permite adminului să editeze orice cerere", () => {
        expect(canEditOwnRequest("admin", otherId, userId, "new")).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────
// canDeleteOwnRequest
// ─────────────────────────────────────────────────────────────
describe("canDeleteOwnRequest", () => {
    const userId = "user_abc123";
    const otherId = "user_xyz456";

    it("permite angajatului să șteargă propria cerere cu status new", () => {
        expect(canDeleteOwnRequest("employee", userId, userId, "new")).toBe(true);
    });

    it("blochează ștergerea dacă cererea este in_progress", () => {
        expect(canDeleteOwnRequest("employee", userId, userId, "in_progress")).toBe(false);
    });

    it("blochează angajatul să șteargă cererea altcuiva", () => {
        expect(canDeleteOwnRequest("employee", otherId, userId, "new")).toBe(false);
    });

    it("permite adminului să șteargă orice cerere în orice status", () => {
        expect(canDeleteOwnRequest("admin", otherId, userId, "approved")).toBe(true);
    });
});