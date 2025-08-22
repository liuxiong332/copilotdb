import { isValidEmail, isValidUrl } from './utils';

// Validation functions for web client
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
    const errors: string[] = [];

    if (!email || email.trim() === '') {
        errors.push('Email is required');
    } else if (!isValidEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validatePassword = (password: string): ValidationResult => {
    const errors: string[] = [];

    if (!password || password.trim() === '') {
        errors.push('Password is required');
    } else {
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/(?=.*[A-Z])/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/(?=.*\d)/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/(?=.*[@$!%*?&])/.test(password)) {
            errors.push('Password must contain at least one special character (@$!%*?&)');
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateName = (name: string, fieldName: string = 'Name'): ValidationResult => {
    const errors: string[] = [];

    if (!name || name.trim() === '') {
        errors.push(`${fieldName} is required`);
    } else if (name.length < 2) {
        errors.push(`${fieldName} must be at least 2 characters long`);
    } else if (name.length > 50) {
        errors.push(`${fieldName} must be no more than 50 characters long`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateUrl = (url: string): ValidationResult => {
    const errors: string[] = [];

    if (!url || url.trim() === '') {
        errors.push('URL is required');
    } else if (!isValidUrl(url)) {
        errors.push('Please enter a valid URL');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateRequired = (value: any, fieldName: string): ValidationResult => {
    const errors: string[] = [];

    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
        errors.push(`${fieldName} is required`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateLength = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
    const errors: string[] = [];

    if (value.length < min) {
        errors.push(`${fieldName} must be at least ${min} characters long`);
    }

    if (value.length > max) {
        errors.push(`${fieldName} must be no more than ${max} characters long`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateNumber = (value: any, min?: number, max?: number, fieldName?: string): ValidationResult => {
    const errors: string[] = [];
    const name = fieldName || 'Value';

    if (isNaN(value) || typeof value !== 'number') {
        errors.push(`${name} must be a valid number`);
        return { isValid: false, errors };
    }

    if (min !== undefined && value < min) {
        errors.push(`${name} must be at least ${min}`);
    }

    if (max !== undefined && value > max) {
        errors.push(`${name} must be no more than ${max}`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};