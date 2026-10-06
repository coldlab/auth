const pinoLogLevels: string[] = ["trace", "debug", "info", "warn", "error", "fatal"];

export function parseLogLevel(value: string): string {
    const normalizedLevel = value.toLowerCase();

    if (!pinoLogLevels.includes(normalizedLevel)){
        throw new Error(`Invalid LOG_LEVEL: ${normalizedLevel}`);
    }

    return normalizedLevel;
}