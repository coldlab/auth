import argon2 from 'argon2';

export async function hashPassword(password: string): Promise<string> {
    try {
        return await argon2.hash(password);
    } catch (error) {
        console.error('Hashing failed: ', error);
        throw error;
    }
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    try {
        return await argon2.verify(hashedPassword, password);
    } catch (error) {
        console.error('Verification failed: ', error);
        throw error;
    }
}
