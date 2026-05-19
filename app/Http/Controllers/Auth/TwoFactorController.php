<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\TwoFactorRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function __construct(
        private readonly Google2FA $google2fa,
    ) {}

    public function create(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('2fa:user_id')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactor');
    }

    public function store(TwoFactorRequest $request): RedirectResponse
    {
        $userId = $request->session()->get('2fa:user_id');

        if (! $userId) {
            return redirect()->route('login');
        }

        /** @var User $user */
        $user = User::findOrFail($userId);

        $valid = $this->google2fa->verifyKey(
            decrypt($user->two_factor_secret),
            $request->validated('code'),
        );

        if (! $valid) {
            return back()->withErrors(['code' => 'Invalid authentication code.']);
        }

        $request->session()->forget('2fa:user_id');
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    public function setup(Request $request): Response
    {
        $user = $request->user();
        $secret = $this->google2fa->generateSecretKey();

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret,
        );

        $request->session()->put('2fa:secret', $secret);

        return Inertia::render('Settings/TwoFactorSetup', [
            'qrCodeUrl' => $qrCodeUrl,
            'secret' => $secret,
            'enabled' => $user->two_factor_enabled,
        ]);
    }

    public function enable(TwoFactorRequest $request): RedirectResponse
    {
        $secret = $request->session()->get('2fa:secret');

        if (! $secret) {
            return back()->withErrors(['code' => 'Session expired. Please try again.']);
        }

        $valid = $this->google2fa->verifyKey($secret, $request->validated('code'));

        if (! $valid) {
            return back()->withErrors(['code' => 'Invalid authentication code.']);
        }

        $request->user()->update([
            'two_factor_secret' => encrypt($secret),
            'two_factor_enabled' => true,
        ]);

        $request->session()->forget('2fa:secret');

        return redirect()->route('settings.index')->with('success', 'Двухфакторная аутентификация включена.');
    }

    public function disable(Request $request): RedirectResponse
    {
        $request->user()->update([
            'two_factor_secret' => null,
            'two_factor_enabled' => false,
        ]);

        return redirect()->route('settings.index')->with('success', 'Двухфакторная аутентификация отключена.');
    }
}
