import {buildApp} from "./app.js";
import {config} from "./core/config.js";

const app = await buildApp();

const start:() => Promise<void> = async (): Promise<void> => {
    try {
        const address = await app.listen({ port: config.webServer.port, host: config.webServer.host });
        app.log.info(`Server running on ${address}`);
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

await start();
