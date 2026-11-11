<?php

namespace App\Http\Controllers;

class SignPreviewController extends Controller
{
    /**
     * Serves the 3D sign studio as a plain static page instead of an Inertia
     * view — it's a self-contained vanilla JS + Three.js app (ported from the
     * LuxSign 3D Studio artifact), not a React component, so routing it
     * through Inertia would buy nothing and Blade would misparse its CSS
     * `@media` queries as directives.
     */
    public function index()
    {
        return response()
            ->file(public_path('studio/lx3d-studio.html'), ['Content-Type' => 'text/html; charset=utf-8']);
    }
}
