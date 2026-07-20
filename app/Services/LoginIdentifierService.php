<?php

namespace App\Services;

use App\Models\User;

class LoginIdentifierService
{
    public function __construct(private PhoneNumberService $phoneNumbers)
    {
    }

    /**
     * Accepts either a phone number or an email as the login field and
     * resolves it to the account's email for Auth::attempt().
     */
    public function resolveEmail(string $identifier): ?string
    {
        if (str_contains($identifier, '@')) {
            return $identifier;
        }

        return User::where('phone', $this->phoneNumbers->normalize($identifier))->value('email');
    }
}
