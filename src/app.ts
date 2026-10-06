import Fastify from 'fastify'
import {logger} from "./core/logger.js";
import {healthRoutes} from "./routes/health.js";
import {authRoutes} from "./routes/auth.js";
import {AppError} from "./core/errors.js";
import {hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler} from "fastify-type-provider-zod";

export function buildApp() {
    const app = Fastify({ loggerInstance: logger });

    app.setValidatorCompiler(validatorCompiler);
    app.setSerializerCompiler(serializerCompiler);

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

    return app;
}