export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    phone?: string | null;
    gender?: 'male' | 'female' | 'other' | string | null;
    nrc_number?: string | null;
    nrc_front_path?: string | null;
    nrc_back_path?: string | null;
    passport_photo_path?: string | null;
    emergency_contact_name?: string | null;
    emergency_contact_phone?: string | null;
    payment_qr_path?: string | null;
    kyc_status?: 'incomplete' | 'pending' | 'verified' | 'rejected' | string;
    kyc_rejection_reason?: string | null;
    driver_license_number?: string | null;
    driver_license_photo_path?: string | null;
    driver_verification_status?: 'not_applied' | 'pending' | 'pending_verification' | 'verified' | 'rejected' | string;
    driver_rejection_reason?: string | null;
    profile_updates_this_month?: number;
    profile_update_reset_at?: string | null;
    pending_profile_data?: Record<string, any> | null;
    roles: string[];
}

export interface AppNotification {
    id: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    action_url?: string | null;
    read_at?: string | null;
    created_at: string;
}

export interface NotificationsData {
    unread_count: number;
    recent: AppNotification[];
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
    notifications?: NotificationsData | null;
    flash: Flash;
    [key: string]: unknown;
};
