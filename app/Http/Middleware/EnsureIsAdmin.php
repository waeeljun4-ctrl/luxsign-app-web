<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class EnsureIsAdmin
{
    /**
     * The /admin/* web routes previously only checked 'auth' — since
     * registration is open to anyone (any customer account), that let any
     * logged-in customer reach the full admin panel. This blocks that.
     */
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            throw new AccessDeniedHttpException('غير مصرح لك بالوصول لهذه الصفحة.');
        }

        return $next($request);
    }
}
