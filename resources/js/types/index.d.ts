export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    roles: string[];
}

export interface Flash {
    success?: string | null;
    error?: string | null;
    warning?: string | null;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
    flash: Flash;
    [key: string]: unknown;
};
