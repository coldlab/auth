import {text, pgTable, uuid, varchar, timestamp} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    email: varchar().notNull().unique(),
    passwordHash: text().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
});
