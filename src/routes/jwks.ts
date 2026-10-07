import type {FastifyInstance, FastifyPluginAsync} from "fastify";
import {getJwks} from "../auth/jwt.js";

export const jwksRoutes: FastifyPluginAsync = async (app: FastifyInstance): Promise<void> => {
    app.get("/.well-known/jwks.json", async () => getJwks());
}