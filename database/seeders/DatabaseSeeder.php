<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@luxsign.ps'],
            ['name' => 'LuxSign Admin', 'password' => Hash::make('admin123'), 'role' => 'admin']
        );

        $this->call(ProductionDataSeeder::class);
    }
}
