import type {FastifyRequest} from "fastify";
import {UnauthorizedError} from "../core/errors.js";
import {verifyAccessToken} from "./jwt.js";

declare module "fastify" {
    interface FastifyRequest {
        user: { id: string } | null;
    }
}

export async function authenticate(request: FastifyRequest): Promise<void> {
    const header = request.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        throw new UnauthorizedError();
    }

    const token = header.slice("Bearer ".length);

    try {
        const payload = await verifyAccessToken(token);
        if (!payload.sub) {
            throw new UnauthorizedError();
        }
        request.user = { id: payload.sub}
    } catch {
        throw new UnauthorizedError();
    }
}
