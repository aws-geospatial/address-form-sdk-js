import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "./debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return the initial value immediately", () => {
    const initialValue = "test";
    const { result } = renderHook(() => useDebounce(initialValue, 500));
    expect(result.current).toBe(initialValue);
  });

  it("should not update the value before the delay", () => {
    const initialValue = "test";
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: initialValue, delay: 500 },
    });
    rerender({ value: "updated", delay: 500 });
    expect(result.current).toBe(initialValue);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe(initialValue);
  });

  it("should update the value after the delay", () => {
    const initialValue = "test";
    const updatedValue = "updated";
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: initialValue, delay: 500 },
    });
    rerender({ value: updatedValue, delay: 500 });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(updatedValue);
  });
});
