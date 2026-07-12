type CursorPayload = { c: string; i: string };

export function encodeCursor(row: { created_at: string; id: string }): string {
  const payload: CursorPayload = { c: row.created_at, i: row.id };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as CursorPayload;
    if (typeof parsed.c === "string" && typeof parsed.i === "string") {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function keysetOrFilter(cursor: CursorPayload): string {
  return `created_at.lt.${cursor.c},and(created_at.eq.${cursor.c},id.lt.${cursor.i})`;
}
