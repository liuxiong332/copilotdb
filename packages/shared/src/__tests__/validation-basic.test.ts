import { describe, it, expect } from 'vitest';

// Import basic validation functions that don't depend on complex types
import { 
    validateRequired, 
    validateLength, 
    validateNumber, 
    validateEmail, 
    validatePassword 
} from '../validation';

describe('Basic Validation Functions', () => {
    describe('validateRequired', () => {
        it('should validate non-empty value', () => {
            const result = validateRequired('value', 'Field');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject null value', () => {
            const result = validateRequired(null, 'Field');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Field is required');
        });
    });

    describe('validateLength', () => {
        it('should validate correct length', () => {
            const result = validateLength('hello', 3, 10, 'Field');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject too short value', () => {
            const result = validateLength('hi', 3, 10, 'Field');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Field must be at least 3 characters long');
        });
    });

    describe('validateNumber', () => {
        it('should validate valid number', () => {
            const result = validateNumber(42, 1, 100, 'Field');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject non-number', () => {
            const result = validateNumber('not a number', undefined, undefined, 'Field');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Field must be a valid number');
        });
    });

    describe('validateEmail', () => {
        it('should validate correct email', () => {
            const result = validateEmail('user@example.com');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject empty email', () => {
            const result = validateEmail('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Email is required');
        });
    });

    describe('validatePassword', () => {
        it('should validate strong password', () => {
            const result = validatePassword('StrongPass123!');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should reject empty password', () => {
            const result = validatePassword('');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password is required');
        });
    });
});