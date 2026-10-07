import { readFileSync } from "fs";
import {importPKCS8, importSPKI, SignJWT, jwtVerify, exportJWK, type JWTPayload} from "jose";
import {config} from "../core/config.js";

const publicKeyPath = "keys/public.pem"

const algorithm = "EdDSA"
const expirationTime = "15m"

const publicKeyPem = readFileSync(publicKeyPath, "utf8");

const privateKey = await importPKCS8(config.privateKeyPem, algorithm);
const publicKey = await importSPKI(publicKeyPem, algorithm);

export async function signAccessToken(userId: string): Promise<string> {
    return new SignJWT({ sub: userId })
        .setProtectedHeader({ alg: algorithm })
        .setIssuedAt()
        .setExpirationTime(expirationTime)
        .sign(privateKey);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, publicKey, { algorithms: [algorithm] });
    return payload;
}

export async function getJwks() {
    const jwk = await exportJWK(publicKey);
    return { keys: [{ ...jwk, alg: algorithm, use: "sig" }]};
}
