<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LedgerParty extends Model
{
    protected $fillable = ['type', 'name', 'phone'];

    public function entries(): HasMany
    {
        return $this->hasMany(LedgerEntry::class)->with('creator:id,name')->latest('entry_date')->latest('id');
    }
}
