<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users with filters and search.
     */
    public function index(Request $request): Response
    {
        $tab = $request->input('tab', 'all');
        $search = $request->input('search');

        $query = User::query()
            ->with(['roles', 'vehicles'])
            ->withCount([
                'drivenRides as rides_offered_count',
                'bookings as bookings_made_count',
            ]);

        // Filter tabs
        if ($tab === 'drivers') {
            $query->role('driver');
        } elseif ($tab === 'passengers') {
            $query->role('passenger');
        } elseif ($tab === 'pending_kyc') {
            $query->where(function ($q) {
                $q->where('kyc_status', 'pending')
                  ->orWhereIn('driver_verification_status', ['pending', 'pending_verification']);
            });
        } elseif ($tab === 'blocked') {
            $query->where('is_blocked', true);
        }

        // Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('nrc_number', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString()
            ->through(function ($u) {
                $avgRating = round((float) ($u->reviewsReceived()->avg('rating') ?? 0.0), 1);
                $reviewCount = $u->reviewsReceived()->count();

                return [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'phone' => $u->phone,
                    'gender' => $u->gender,
                    'nrc_number' => $u->nrc_number,
                    'nrc_front_path' => $u->nrc_front_path,
                    'nrc_back_path' => $u->nrc_back_path,
                    'passport_photo_path' => $u->passport_photo_path,
                    'driver_license_number' => $u->driver_license_number,
                    'driver_license_photo_path' => $u->driver_license_photo_path,
                    'payment_qr_path' => $u->payment_qr_path,
                    'emergency_contact_name' => $u->emergency_contact_name,
                    'emergency_contact_phone' => $u->emergency_contact_phone,
                    'kyc_status' => $u->kyc_status,
                    'driver_verification_status' => $u->driver_verification_status,
                    'is_blocked' => (bool) $u->is_blocked,
                    'blocked_reason' => $u->blocked_reason,
                    'roles' => $u->roles->pluck('name'),
                    'vehicles' => $u->vehicles,
                    'rides_offered_count' => $u->rides_offered_count,
                    'bookings_made_count' => $u->bookings_made_count,
                    'average_rating' => $avgRating,
                    'review_count' => $reviewCount,
                    'created_at' => $u->created_at->toISOString(),
                ];
            });

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'tab' => $tab,
                'search' => $search,
            ],
            'counts' => [
                'all' => User::count(),
                'drivers' => User::role('driver')->count(),
                'passengers' => User::role('passenger')->count(),
                'pending_kyc' => User::where(function ($q) {
                    $q->where('kyc_status', 'pending')
                      ->orWhereIn('driver_verification_status', ['pending', 'pending_verification']);
                })->count(),
                'blocked' => User::where('is_blocked', true)->count(),
            ],
        ]);
    }

    /**
     * Toggle block/unblock status for a user.
     */
    public function toggleBlock(Request $request, User $user): RedirectResponse
    {
        // Don't allow blocking oneself
        if ($user->id === $request->user()->id) {
            return back()->withErrors(['user' => 'You cannot block your own admin account.']);
        }

        if ($user->is_blocked) {
            // Unblock
            $user->update([
                'is_blocked' => false,
                'blocked_reason' => null,
            ]);
            $msg = "User {$user->name} has been unblocked successfully.";
        } else {
            // Block
            $request->validate([
                'reason' => ['required', 'string', 'max:255'],
            ]);

            $user->update([
                'is_blocked' => true,
                'blocked_reason' => $request->input('reason'),
            ]);
            $msg = "User {$user->name} has been suspended/blocked.";
        }

        return back()->with('success', $msg);
    }
}
