<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $now = now();

        // 1. Check monthly profile update limit
        // Reset counter if reset_at is null or from a previous month
        if (! $user->profile_update_reset_at || $user->profile_update_reset_at->format('Y-m') !== $now->format('Y-m')) {
            $user->profile_updates_this_month = 0;
            $user->profile_update_reset_at = $now;
        }

        // If user is already verified and has completed KYC, check 2-per-month limit
        $isAlreadyVerified = $user->kyc_status === 'verified';
        if ($isAlreadyVerified && $user->profile_updates_this_month >= 2) {
            return Redirect::route('profile.edit')->withErrors([
                'profile_limit' => 'You can only update your profile details up to 2 times per month.',
            ])->with('error', 'You can only update your profile details up to 2 times per month.');
        }

        // 2. Handle File Uploads
        $filePaths = [];
        foreach (['passport_photo', 'nrc_front', 'nrc_back', 'payment_qr'] as $fileKey) {
            if ($request->hasFile($fileKey)) {
                $path = $request->file($fileKey)->store('kyc_documents', 'public');
                $targetCol = $fileKey === 'passport_photo' ? 'passport_photo_path' : ($fileKey === 'payment_qr' ? 'payment_qr_path' : "{$fileKey}_path");
                $filePaths[$targetCol] = $path;
            }
        }

        // 3. First time KYC or unverified profile submission
        if (! $isAlreadyVerified) {
            $user->fill([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'gender' => $validated['gender'],
                'nrc_number' => $validated['nrc_number'],
                'emergency_contact_name' => $validated['emergency_contact_name'],
                'emergency_contact_phone' => $validated['emergency_contact_phone'],
                'kyc_status' => 'verified', // initial completion verified per requirement
                'kyc_rejection_reason' => null,
                ...$filePaths,
            ]);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }

            $user->save();

            return Redirect::route('profile.edit')->with('success', 'Your KYC profile has been completed and verified successfully!');
        }

        // 4. Already Verified User submitting changes -> Enforce monthly limit & store in pending_profile_data
        $pendingData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'gender' => $validated['gender'],
            'nrc_number' => $validated['nrc_number'],
            'emergency_contact_name' => $validated['emergency_contact_name'],
            'emergency_contact_phone' => $validated['emergency_contact_phone'],
            'submitted_at' => $now->toDateTimeString(),
            ...$filePaths,
        ];

        $user->pending_profile_data = $pendingData;
        $user->profile_updates_this_month += 1;
        $user->profile_update_reset_at = $now;
        $user->save();

        return Redirect::route('profile.edit')->with('success', 'Your profile update request has been submitted and is awaiting Admin approval.');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
