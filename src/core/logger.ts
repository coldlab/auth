import pino from "pino";
import {config} from "./config.js";
import {Environment} from "./environments.js";

function createLogger(): pino.Logger {
    const options: pino.LoggerOptions = { level: config.logLevel };

    if (config.environment === Environment.Development) {
        options.transport = { target: "pino-pretty" };
    }

    return pino(options);
}

export const logger: pino.Logger = createLogger()