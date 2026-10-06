import {db} from "../db/index.js";
import {usersTable} from "../db/schema/index.js";
import {EmailAlreadyExistsError, isPostgresUniqueViolation} from "../core/errors.js";
import {eq} from "drizzle-orm";

export async function createUser(email: string, passwordHash: string) {
    try {
        const [user] = await db.insert(usersTable)
            .values({email, passwordHash})
            .returning({ id: usersTable.id, email: usersTable.email});
        return user;
    } catch (error) {
        if (isPostgresUniqueViolation(error)) {
            throw new EmailAlreadyExistsError(email);
        }
        throw error;
    }
}

export async function findUserByEmail(email: string) {
    const [user] = await db.select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
    return user;
}

export async function findUserById(id: string) {
    const [user] = await db.select({ id: usersTable.id, email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, id))
    return user;
}