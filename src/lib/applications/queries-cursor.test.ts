import { describe, expect, it } from "vitest";

import {
  decodeCursor,
  encodeCursor,
  keysetOrFilter,
} from "@/lib/applications/queries-cursor";

describe("application list cursor", () => {
  const row = {
    created_at: "2026-07-10T12:00:00.000Z",
    id: "550e8400-e29b-41d4-a716-446655440000",
  };

  it("round-trips encode and decode", () => {
    const encoded = encodeCursor(row);
    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual({ c: row.created_at, i: row.id });
  });

  it("returns null for invalid input", () => {
    expect(decodeCursor("not-valid-base64!!!")).toBeNull();
  });

  it("builds a keyset or-filter", () => {
    const decoded = decodeCursor(encodeCursor(row));
    expect(decoded).not.toBeNull();
    expect(keysetOrFilter(decoded!)).toMatch(
      /created_at\.lt\.2026-07-10T12:00:00\.000Z,and\(created_at\.eq\.2026-07-10T12:00:00\.000Z,id\.lt\.550e8400-e29b-41d4-a716-446655440000\)/,
    );
  });
});
