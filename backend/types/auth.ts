// Authentication types
export interface AuthUser {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    phone_confirmed_at?: string;
    created_at: string;
    updated_at: string;
    last_sign_in_at?: string;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
}

export interface AuthSession {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    token_type: string;
    user: AuthUser;
}

export interface SignUpCredentials {
    email: string;
    password: string;
    options?: {
        data?: Record<string, any>;
        redirectTo?: string;
    };
}

export interface SignInCredentials {
    email: string;
    password: string;
}

export interface AuthError {
    message: string;
    status?: number;
    code?: string;
}

export interface PasswordResetRequest {
    email: string;
    redirectTo?: string;
}

export interface PasswordUpdateRequest {
    password: string;
    accessToken: string;
}