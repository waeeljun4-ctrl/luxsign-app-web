<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $orders = Order::latest()->get();

        // حساب الأكثر طلباً من JSON items
        $counts = [];
        foreach ($orders as $order) {
            foreach ($order->items ?? [] as $item) {
                $name = $item['name'] ?? '';
                if ($name) $counts[$name] = ($counts[$name] ?? 0) + 1;
            }
        }
        arsort($counts);
        $topProducts = collect(array_slice($counts, 0, 5, true))
            ->map(fn($count, $name) => ['name' => $name, 'orders_count' => $count])
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending'     => $orders->where('status', 'pending')->count(),
                'in_progress' => $orders->where('status', 'in_progress')->count(),
                'delivered'   => $orders->where('status', 'delivered')->count(),
                'today_total' => (float) $orders->where('created_at', '>=', now()->startOfDay())->sum('total'),
            ],
            'recent_orders' => $orders->take(10)->values(),
            'top_products'  => $topProducts,
        ]);
    }
}
