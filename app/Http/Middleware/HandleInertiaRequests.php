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
                            'driver_verification_status',
                            'driver_rejection_reason',
                        ]),
                        // Spatie role names, e.g. ['driver'] or ['passenger']
                        ['roles' => $request->user()->getRoleNames()->values()->all()]
                    )
                    : null,
            ],
            // Flash messages — read by the FlashToast React component.
            'flash' => [
                'success' => $request->session()->get('success'),
                'error'   => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
            ],
        ];
    }
}

