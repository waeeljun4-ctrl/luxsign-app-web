<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\ExternalSale;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfitReportController extends Controller
{
    /**
     * Real profit, not just inventory value: revenue from actual sales
     * (website orders + manually-logged external sales) minus their cost
     * (each item's product wholesale_price at today's value — orders don't
     * snapshot cost at sale time, so this reflects the current wholesale
     * price, not necessarily what it was back then) minus the period's
     * expenses. Items whose product has no wholesale_price set contribute
     * 0 cost — flagged via missingCostItems so the number isn't silently
     * inflated.
     */
    public function index(Request $request)
    {
        $month = $request->input('month', now()->format('Y-m'));

        if ($request->filled('from') && $request->filled('to')) {
            $from = Carbon::parse($request->input('from'))->startOfDay();
            $to = Carbon::parse($request->input('to'))->endOfDay();
        } else {
            $from = Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $to = $from->copy()->endOfMonth();
        }

        $orders = Order::whereBetween('created_at', [$from, $to])
            ->where('status', '!=', 'cancelled')
            ->get();

        $wholesalePrices = Product::pluck('wholesale_price', 'id');

        $websiteRevenue = 0;
        $websiteCogs = 0;
        $missingCostItems = [];

        foreach ($orders as $order) {
            // order->total is the only fully-net figure — a discount
            // campaign is already baked into each item's stored price, but
            // a per-user loyalty discount_percentage and a coupon code are
            // only ever subtracted once from the order total, never
            // redistributed back into items[].price. Summing item prices
            // would silently overstate revenue on any order that used
            // either of those.
            $websiteRevenue += (float) $order->total;

            foreach (($order->items ?? []) as $item) {
                $qty = $item['qty'] ?? 1;
                $productId = $item['product_id'] ?? null;
                $wholesale = $productId ? $wholesalePrices->get($productId) : null;

                if ($wholesale === null) {
                    $missingCostItems[$item['name'] ?? 'منتج بدون اسم'] = true;
                } else {
                    $websiteCogs += $wholesale * $qty;
                }
            }
        }

        $externalSales = ExternalSale::whereBetween('sold_on', [$from, $to])->get();
        $externalRevenue = $externalSales->sum(fn ($s) => $s->sale_price * $s->qty);
        $externalCogs = $externalSales->sum(fn ($s) => ($s->cost_price ?? 0) * $s->qty);

        $externalSales->each(function ($s) use (&$missingCostItems) {
            if ($s->cost_price === null) {
                $missingCostItems[$s->product_name] = true;
            }
        });

        $expenses = (float) Expense::whereBetween('spent_on', [$from, $to])->sum('amount');

        $totalRevenue = $websiteRevenue + $externalRevenue;
        $totalCogs = $websiteCogs + $externalCogs;
        $grossProfit = $totalRevenue - $totalCogs;
        $netProfit = $grossProfit - $expenses;

        return Inertia::render('Admin/ProfitReport', [
            'month' => $month,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'websiteRevenue' => round($websiteRevenue, 2),
            'websiteCogs' => round($websiteCogs, 2),
            'externalRevenue' => round($externalRevenue, 2),
            'externalCogs' => round($externalCogs, 2),
            'totalRevenue' => round($totalRevenue, 2),
            'totalCogs' => round($totalCogs, 2),
            'grossProfit' => round($grossProfit, 2),
            'expenses' => $expenses,
            'netProfit' => round($netProfit, 2),
            'missingCostItems' => array_keys($missingCostItems),
            'ordersCount' => $orders->count(),
            'externalSalesCount' => $externalSales->count(),
        ]);
    }
}
