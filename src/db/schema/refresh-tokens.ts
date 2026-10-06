import {pgTable, text, timestamp, uuid} from "drizzle-orm/pg-core";
import {usersTable} from "./users.js";

export const refreshTokensTable = pgTable("refresh_tokens",
    {
        id: uuid().primaryKey().defaultRandom(),
        userId: uuid().notNull().references(() => usersTable.id),
        tokenHash: text().notNull().unique(),
        expiresAt: timestamp().notNull(),
        revokedAt: timestamp(),
        createdAt: timestamp().defaultNow().notNull(),
    })