import { readFileSync } from "fs";
import {importPKCS8, importSPKI, SignJWT, jwtVerify, exportJWK, type JWTPayload} from "jose";
import {config} from "../core/config.js";

const publicKeyPath = "keys/public.pem"

const algorithm = "EdDSA"
const expirationTime = "15m"

const publicKeyPem = readFileSync(publicKeyPath, "utf8");

const privateKey = await importPKCS8(config.privateKeyPem, algorithm);
const publicKey = await importSPKI(publicKeyPem, algorithm);

// The email rides along so apps can show who did something without asking
// this service - it's only as fresh as the token (15 min).
export async function signAccessToken(user: { id: string; email: string }): Promise<string> {
    return new SignJWT({ sub: user.id, email: user.email })
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
