import { DurableObject } from "cloudflare:workers";

import type { RoomSummary } from "../shared";

export class Registry extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.ctx.storage.sql.exec(
      `CREATE TABLE IF NOT EXISTS rooms (id TEXT PRIMARY KEY, created INTEGER, lastActive INTEGER)`,
    );
  }

  addRoom(id: string) {
    const now = Date.now();
    this.ctx.storage.sql.exec(
      `INSERT INTO rooms (id, created, lastActive) VALUES (?, ?, ?)
       ON CONFLICT (id) DO UPDATE SET lastActive = excluded.lastActive`,
      id,
      now,
      now,
    );
  }

  listRooms(): RoomSummary[] {
    return this.ctx.storage.sql
      .exec(`SELECT id, created, lastActive FROM rooms ORDER BY lastActive DESC`)
      .toArray() as unknown as RoomSummary[];
  }
}
