<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LedgerEntry;
use App\Models\LedgerParty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LedgerController extends Controller
{
    public function index()
    {
        $parties = LedgerParty::with('entries')->orderBy('name')->get();

        return Inertia::render('Admin/Ledger', [
            'workers' => $parties->where('type', 'worker')->map(fn (LedgerParty $p) => $this->partyPayload($p))->values(),
            'suppliers' => $parties->where('type', 'supplier')->map(fn (LedgerParty $p) => $this->partyPayload($p))->values(),
        ]);
    }

    private function partyPayload(LedgerParty $party): array
    {
        return [
            'type' => $party->type,
            'id' => $party->id,
            'name' => $party->name,
            'phone' => $party->phone,
            'balance' => $party->entries->sum('amount'),
            'entries' => $party->entries->values(),
        ];
    }

    public function storeParty(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:worker,supplier',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        LedgerParty::create($data);

        return back()->with('success', $data['type'] === 'worker' ? 'تمت إضافة العامل.' : 'تمت إضافة التاجر.');
    }

    public function storeEntry(Request $request)
    {
        $data = $request->validate([
            'party_id' => 'required|integer|exists:ledger_parties,id',
            'direction' => 'required|in:due,payment',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'required|string|max:255',
            'entry_date' => 'nullable|date',
        ]);

        LedgerEntry::create([
            'ledger_party_id' => $data['party_id'],
            'amount' => $data['direction'] === 'due' ? $data['amount'] : -$data['amount'],
            'description' => $data['description'],
            'entry_date' => $data['entry_date'] ?? now()->toDateString(),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'تم تسجيل الحركة.');
    }

    public function destroyEntry(LedgerEntry $entry)
    {
        $entry->delete();

        return back()->with('success', 'تم حذف الحركة.');
    }
}
