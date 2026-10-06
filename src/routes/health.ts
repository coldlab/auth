import type {FastifyInstance, FastifyPluginAsync} from "fastify";

function healthCheckHandler(): { status: string} {
    return { status: 'ok' };
}

export const healthRoutes: FastifyPluginAsync = async (app: FastifyInstance): Promise<void> => {
    app.get("/health-check", healthCheckHandler);
}
