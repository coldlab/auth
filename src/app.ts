import Fastify from 'fastify'
import {logger} from "./core/logger.js";
import {healthRoutes} from "./routes/health.js";
import {authRoutes} from "./routes/auth.js";
import {AppError, RateLimitError} from "./core/errors.js";
import {
    hasZodFastifySchemaValidationErrors,
    jsonSchemaTransform,
    serializerCompiler,
    validatorCompiler
} from "fastify-type-provider-zod";
import rateLimit from "@fastify/rate-limit";
import helmet from "@fastify/helmet"
import {jwksRoutes} from "./routes/jwks.js";
import {config} from "./core/config.js";
import {Environment} from "./core/environments.js";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui"

export async function buildApp() {
    const app = Fastify({ loggerInstance: logger });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

    await app.register(rateLimit, {
        max: 100,
        timeWindow: "1 minute" ,
        errorResponseBuilder: (_request, context) =>
            new RateLimitError(context.after),
    });
    await app.register(helmet);

    if (config.environment === Environment.Development) {
        await app.register(swagger, {
            openapi: { info: { title: "Auth Service", version: "1.0.0" } },
            transform: jsonSchemaTransform,
        });
        await app.register(swaggerUi, { routePrefix: "/documentation" });
    }

    app.decorateRequest("user", null);

    app.setErrorHandler((error, _request, reply) => {
        if (hasZodFastifySchemaValidationErrors(error)) {
            const message = error.validation.map((issue) => `${issue.instancePath} ${issue.message}`).join(", ");
            return reply.code(400).send({error: message});
        }
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({ error: error.message });
        }
        logger.error(error);
        return reply.code(500).send({ error: "Internal Server Error" });
    })

    app.register(healthRoutes);
    app.register(authRoutes);
    app.register(jwksRoutes);

    return app;
}