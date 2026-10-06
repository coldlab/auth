import { readFileSync } from "fs";
import {importPKCS8, importSPKI, SignJWT, jwtVerify, type JWTPayload} from "jose";

const keyPaths = {
    privateKeyPath: "keys/private.pem",
    publicKeyPath: "keys/public.pem",
}

const algorithm = "EdDSA"
const expirationTime = "15m"

const privateKeyPem = readFileSync(keyPaths.privateKeyPath, "utf8");
const publicKeyPem = readFileSync(keyPaths.publicKeyPath, "utf8");

const privateKey = await importPKCS8(privateKeyPem, algorithm);
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