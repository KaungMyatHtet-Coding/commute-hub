<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminGateController extends Controller
{
    /**
     * Show the secondary passcode entry gate.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if ($request->session()->get('admin_passcode_verified', false)) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Admin/Gate');
    }

    /**
     * Verify the passcode.
     */
    public function verify(Request $request): RedirectResponse
    {
        $request->validate([
            'passcode' => ['required', 'string'],
        ]);

        $hashedPasscode = SystemSetting::get('admin_panel_passcode');

        if (!$hashedPasscode || !Hash::check($request->input('passcode'), $hashedPasscode)) {
            return back()->withErrors([
                'passcode' => 'Invalid admin panel passcode. Please try again.',
            ]);
        }

        $request->session()->put('admin_passcode_verified', true);

        return redirect()->intended(route('admin.dashboard'))
            ->with('success', 'Admin panel unlocked successfully.');
    }

    /**
     * Update the admin panel passcode.
     */
    public function updatePasscode(Request $request): RedirectResponse
    {
        $request->validate([
            'current_passcode' => ['required', 'string'],
            'new_passcode' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $currentHashed = SystemSetting::get('admin_panel_passcode');

        if (!$currentHashed || !Hash::check($request->input('current_passcode'), $currentHashed)) {
            return back()->withErrors([
                'current_passcode' => 'The current passcode is incorrect.',
            ]);
        }

        SystemSetting::set('admin_panel_passcode', Hash::make($request->input('new_passcode')));

        return back()->with('success', 'Admin panel passcode updated successfully.');
    }
}
