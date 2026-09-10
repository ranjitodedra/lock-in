import { describe, expect, it } from "vitest";

import {
  addCalendarDays,
  resolveAppliedFields,
  suggestFollowUpDate,
  todayDateInput,
} from "@/lib/applications/follow-up";

describe("follow-up helpers", () => {
  it("adds 14 calendar days", () => {
    const jan1 = new Date(2026, 0, 1);
    expect(addCalendarDays(jan1, 14).getDate()).toBe(15);
    expect(suggestFollowUpDate(jan1)).toBe("2026-01-15");
  });

  it("sets today and a follow-up when transitioning to Applied", () => {
    const resolved = resolveAppliedFields("Applied", null, "", "Wishlist");
    expect(resolved.applied_at).toHaveLength(10);
    expect(resolved.follow_up_date).toHaveLength(10);
  });

  it("suggests follow-up 14 days after applied_at when staying Applied", () => {
    const withExisting = resolveAppliedFields(
      "Applied",
      "2026-01-01",
      "",
      "Applied",
    );
    expect(withExisting.follow_up_date).toBe("2026-01-15");
  });

  it("does not mutate fields for non-Applied statuses", () => {
    const unchanged = resolveAppliedFields("Wishlist", null, "");
    expect(unchanged.applied_at).toBeNull();
    expect(unchanged.follow_up_date).toBe("");
  });

  it("preserves an existing follow-up when staying Applied", () => {
    const custom = resolveAppliedFields(
      "Applied",
      "2026-01-01",
      "2026-02-01",
      "Applied",
    );
    expect(custom.follow_up_date).toBe("2026-02-01");
  });

  it("recalculates follow-up from today on transition to Applied", () => {
    const transition = resolveAppliedFields(
      "Applied",
      "2026-01-01",
      "2026-02-01",
      "Wishlist",
    );
    expect(transition.applied_at).toBe(todayDateInput());
    expect(transition.follow_up_date).toBe(
      suggestFollowUpDate(new Date(`${todayDateInput()}T12:00:00`)),
    );
  });
});
