<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ── Rolleri Oluştur ───────────────────────────────────────────
        $adminRole = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $userRole  = Role::firstOrCreate(['name' => 'user',  'guard_name' => 'web']);

        // ── Admin (Marel yönetim) ─────────────────────────────────────
        $admin = User::updateOrCreate(
            ['email' => 'admin@softtrade.com'],
            [
                'first_name' => 'Marel',
                'last_name'  => 'Yönetici',
                'phone'      => '5551234455',
                'password'   => 'admin123', // Model casts: hashed
                'role'       => 'admin',
                'is_active'  => true,
            ]
        );
        $admin->assignRole($adminRole);

        // ── Standart Müşteri Hesabı ───────────────────────────────────
        $user = User::updateOrCreate(
            ['email' => 'user@softtrade.com'],
            [
                'first_name' => 'Ahmet',
                'last_name'  => 'Müşteri',
                'phone'      => '5559998877',
                'password'   => 'user123',
                'role'       => 'user',
                'is_active'  => true,
            ]
        );
        $user->assignRole($userRole);
    }
}
