export enum Environment {
    Development = "dev",
    Production = "prod",
}

export function parseEnvironment(value: string): Environment {
    if (!Object.values(Environment).includes(value as Environment)) {
        throw new Error(`Environment ${value} is not a valid environment`);
    }
    return value as Environment;
}