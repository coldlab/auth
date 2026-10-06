import type {FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";
import {createUser, findUserByEmail, findUserById} from "../service/users.js";
import {InvalidCredentialsError} from "../core/errors.js";
import {hashPassword, verifyPassword} from "../auth/password.js";
import {signAccessToken} from "../auth/jwt.js";
import {authenticate} from "../auth/middleware.js";
import {issueRefreshToken, revokeRefreshToken, rotateRefreshToken} from "../service/refresh-tokens.js";
import {z} from "zod";
import {loginSchema, logoutSchema, refreshSchema, signupSchema} from "../schema/auth.js";

type SignupBody = z.infer<typeof signupSchema>
type LoginBody = z.infer<typeof loginSchema>
type RefreshBody = z.infer<typeof refreshSchema>
type LogoutBody = z.infer<typeof logoutSchema>

async function signupCheckHandler(
    request: FastifyRequest<{ Body: SignupBody}>,
    reply: FastifyReply
){
    const { email, password } = request.body;

    const passwordHash = await hashPassword(password);
    const user = await createUser(email, passwordHash);

    return reply.code(201).send(user)
}

async function loginHandler(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
){
    const { email, password } = request.body;

    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(user.passwordHash, password))) {
        throw new InvalidCredentialsError();
    }

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await issueRefreshToken(user.id);
    return reply.code(200).send({ accessToken, refreshToken });
}

async function meHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    const user = await findUserById(request.user!.id);
    if (!user) {
        return reply.code(404).send({ error: "User not found" });
    }

    return reply.code(200).send(user)
}

async function refreshHandler(
    request: FastifyRequest<{ Body: RefreshBody}>,
    reply: FastifyReply
){
    const { refreshToken } = request.body;

    const { userId, refreshToken: newRefreshToken } = await rotateRefreshToken(refreshToken)
    const accessToken = await signAccessToken(userId)

    return reply.code(200).send({ accessToken, refreshToken: newRefreshToken });

}


async function logoutHandler(
    request: FastifyRequest<{ Body: LogoutBody }>,
    reply: FastifyReply
) {
    const { refreshToken } = request.body;
    await revokeRefreshToken(refreshToken);

    return reply.code(204).send();
}


export const authRoutes: FastifyPluginAsync = async (app: FastifyInstance): Promise<void> => {
    app.post<{Body: SignupBody}>("/signup", { schema: {body: signupSchema} }, signupCheckHandler);
    app.post<{Body: LoginBody}>("/login", { schema: {body: loginSchema} }, loginHandler);
    app.get('/me', { preHandler: authenticate }, meHandler);
    app.post<{Body: RefreshBody}>("/refresh", { schema: {body: refreshSchema} }, refreshHandler);
    app.post<{Body: LogoutBody}>("/logout", { schema: {body: logoutSchema} }, logoutHandler);
}
