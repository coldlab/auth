import {type Environment, parseEnvironment} from "./environments.js";
import {parseLogLevel} from "./log-level.js";

type Config = {
    environment: Environment;
    databaseUrl: string,
    logLevel: string,
    webServer: {
        port: number,
        host: string,
    }
}


function getEnv(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function createConfig(): Config {
    const port = Number(getEnv('WEBSERVER_PORT'))
    if (Number.isNaN(port)){
        throw new Error(`Invalid WEBSERVER_PORT: not a number`)
    }

    const env: Environment = parseEnvironment(getEnv('ENVIRONMENT'));
    const logLevel: string = parseLogLevel(getEnv('LOG_LEVEL'));

    return {
        environment: env,
        databaseUrl: getEnv('DATABASE_URL'),
        logLevel: logLevel,
        webServer: {
            port: port,
            host: getEnv('WEBSERVER_HOST'),
        }
    }
}

export const config: Config = createConfig();
