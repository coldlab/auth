import {DrizzleQueryError} from "drizzle-orm/errors";
import {NeonDbError} from "@neondatabase/serverless";

export function isPostgresUniqueViolation(error: unknown) {
    return (
        error instanceof DrizzleQueryError &&
        error.cause instanceof NeonDbError &&
        error.cause.code === "23505"
    )
}

export class AppError extends Error {
    constructor(message: string, public readonly statusCode: number) {
        super(message);
        this.name = new.target.name;
    }
}

export class EmailAlreadyExistsError extends AppError {
    constructor(email: string) {
        super(`Email already exists: ${email}`, 409);
    }
}

export class InvalidCredentialsError extends AppError {
    constructor() {
        super("The email or password you entered isn't recognised by the system",401);
    }
}

export class UnauthorizedError extends AppError {
    constructor() {
        super("Missing or invalid authentication token",401);
    }
}

export class InvalidRefreshTokenError extends AppError {
    constructor() {
        super("Invalid or expired refresh token",401);
    }
}
