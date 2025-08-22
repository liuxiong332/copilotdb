// Encryption utilities for sensitive user data and general encryption needs
import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const HASH_ALGORITHM = 'sha256';

export class EncryptionService {
    private static getEncryptionKey(): string {
        // In production, this should come from environment variables
        return process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
    }

    static encrypt(text: string): string {
        try {
            const key = this.getEncryptionKey();
            const iv = randomBytes(16);
            const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
            const cipher = createCipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);

            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            return iv.toString('hex') + ':' + encrypted;
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    static decrypt(encryptedText: string): string {
        try {
            const key = this.getEncryptionKey();
            const parts = encryptedText.split(':');

            if (parts.length !== 2) {
                throw new Error('Invalid encrypted data format');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = parts[1];

            const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
            const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, keyBuffer, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    static hash(text: string): string {
        return createHash(HASH_ALGORITHM).update(text).digest('hex');
    }

    static generateSalt(): string {
        return randomBytes(32).toString('hex');
    }

    static hashWithSalt(text: string, salt: string): string {
        return createHash(HASH_ALGORITHM).update(text + salt).digest('hex');
    }

    static verifyHash(text: string, hash: string, salt?: string): boolean {
        const computedHash = salt ? this.hashWithSalt(text, salt) : this.hash(text);
        return computedHash === hash;
    }
}

// Utility functions for general data encryption
export const encryptData = (data: any): string => {
    const dataString = JSON.stringify(data);
    return EncryptionService.encrypt(dataString);
};

export const decryptData = (encryptedData: string): any => {
    const dataString = EncryptionService.decrypt(encryptedData);
    return JSON.parse(dataString);
};

// Utility for masking sensitive data in logs
export const maskSensitiveData = (obj: any): any => {
    const sensitiveKeys = ['password', 'secret', 'key', 'token', 'auth'];

    if (typeof obj !== 'object' || obj === null) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(maskSensitiveData);
    }

    const masked = { ...obj };

    for (const key in masked) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            masked[key] = '***MASKED***';
        } else if (typeof masked[key] === 'object') {
            masked[key] = maskSensitiveData(masked[key]);
        }
    }

    return masked;
};