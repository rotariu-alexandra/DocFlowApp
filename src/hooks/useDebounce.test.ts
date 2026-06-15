import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returnează valoarea inițială imediat", () => {
        const { result } = renderHook(() => useDebounce("hello", 300));
        expect(result.current).toBe("hello");
    });

    it("nu actualizează valoarea înainte să expire delay-ul", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: "a", delay: 300 } }
        );
        rerender({ value: "ab", delay: 300 });
        act(() => { vi.advanceTimersByTime(200); });
        expect(result.current).toBe("a");
    });

    it("actualizează valoarea după ce delay-ul expiră", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: "a", delay: 300 } }
        );
        rerender({ value: "abc", delay: 300 });
        act(() => { vi.advanceTimersByTime(300); });
        expect(result.current).toBe("abc");
    });

    it("resetează timerul la fiecare modificare rapidă (debounce real)", () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: "a", delay: 300 } }
        );

        rerender({ value: "ab", delay: 300 });
        act(() => { vi.advanceTimersByTime(200); });

        rerender({ value: "abc", delay: 300 });
        act(() => { vi.advanceTimersByTime(200); });

        // 400ms totali de la prima modificare, dar timerul s-a resetat — valoarea nu trebuie actualizată
        expect(result.current).toBe("a");

        act(() => { vi.advanceTimersByTime(100); });
        expect(result.current).toBe("abc");
    });

    it("nu mai actualizează valoarea după demontarea hook-ului", () => {
        const { result, rerender, unmount } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: "initial", delay: 300 } }
        );

        rerender({ value: "updated", delay: 300 });

        unmount();

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current).toBe("initial");
    });
});