<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    private const CATEGORIES = ['بضاعة ومستلزمات', 'نقل ومواصلات', 'تسويق وإعلانات', 'فواتير', 'صيانة', 'أخرى'];

    private function filteredQuery(Request $request)
    {
        $query = Expense::with('creator:id,name')->orderByDesc('spent_on')->orderByDesc('id');

        if ($from = $request->input('from')) {
            $query->where('spent_on', '>=', $from);
        }
        if ($to = $request->input('to')) {
            $query->where('spent_on', '<=', $to);
        }

        return $query;
    }

    public function index(Request $request)
    {
        $expenses = $this->filteredQuery($request)->get();

        // Per-admin breakdown for the same filtered period — more than one
        // admin account can exist now, each needs to see who spent what.
        $byAdmin = $expenses->groupBy('created_by')->map(fn ($group) => [
            'name' => $group->first()->creator?->name ?? '—',
            'total' => $group->sum('amount'),
        ])->sortByDesc('total')->values();

        return Inertia::render('Admin/Expenses', [
            'expenses' => $expenses,
            'byAdmin' => $byAdmin,
            'filters' => $request->only('from', 'to'),
            'categories' => self::CATEGORIES,
            'todayTotal' => Expense::whereDate('spent_on', today())->sum('amount'),
            'weekTotal' => Expense::whereBetween('spent_on', [now()->startOfWeek(), now()->endOfWeek()])->sum('amount'),
            'monthTotal' => Expense::whereYear('spent_on', now()->year)->whereMonth('spent_on', now()->month)->sum('amount'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'category' => 'nullable|string|max:50',
            'spent_on' => 'nullable|date',
        ]);

        Expense::create([
            'amount' => $data['amount'],
            'description' => $data['description'],
            'category' => $data['category'] ?? null,
            'spent_on' => $data['spent_on'] ?? now()->toDateString(),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'تم تسجيل المصروف.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();

        return back()->with('success', 'تم حذف المصروف.');
    }
}
