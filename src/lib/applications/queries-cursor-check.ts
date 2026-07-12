import assert from "node:assert/strict";

import {
  decodeCursor,
  encodeCursor,
  keysetOrFilter,
} from "@/lib/applications/queries-cursor";

const row = {
  created_at: "2026-07-10T12:00:00.000Z",
  id: "550e8400-e29b-41d4-a716-446655440000",
};

const encoded = encodeCursor(row);
const decoded = decodeCursor(encoded);
assert.ok(decoded);
assert.equal(decoded.c, row.created_at);
assert.equal(decoded.i, row.id);

assert.equal(decodeCursor("not-valid-base64!!!"), null);

const filter = keysetOrFilter(decoded);
assert.match(
  filter,
  /created_at\.lt\.2026-07-10T12:00:00\.000Z,and\(created_at\.eq\.2026-07-10T12:00:00\.000Z,id\.lt\.550e8400-e29b-41d4-a716-446655440000\)/,
);

console.log("queries cursor self-check passed");
