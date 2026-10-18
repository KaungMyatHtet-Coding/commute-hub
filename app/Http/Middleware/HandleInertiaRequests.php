<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user()
                    ? array_merge(
                        $request->user()->only([
                            'id',
                            'name',
                            'email',
                            'phone',
                            'gender',
                            'nrc_number',
                            'nrc_front_path',
                            'nrc_back_path',
                            'passport_photo_path',
                            'emergency_contact_name',
                            'emergency_contact_phone',
                            'payment_qr_path',
                            'kyc_status',
                            'kyc_rejection_reason',
                            'driver_license_number',
                            'driver_license_photo_path',
                            'driver_verification_status',
                            'driver_rejection_reason',
                            'profile_updates_this_month',
                            'profile_update_reset_at',
                            'pending_profile_data',
                        ]),
                        // Spatie role names, e.g. ['driver'] or ['passenger']
                        ['roles' => $request->user()->getRoleNames()->values()->all()]
                    )
                    : null,
            ],
            // In-app bell notifications
            'notifications' => $request->user() ? [
                'unread_count' => \App\Models\AppNotification::where('user_id', $request->user()->id)
                    ->whereNull('read_at')
                    ->count(),
                'recent' => \App\Models\AppNotification::where('user_id', $request->user()->id)
                    ->latest()
                    ->limit(8)
                    ->get(['id', 'title', 'message', 'type', 'action_url', 'read_at', 'created_at']),
            ] : null,
            // Flash messages — read by the FlashToast React component.
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
        ];
    }
}

