<?php

namespace App\Policies;

use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    /** Admin olmayan herkes görebilir */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Category $category): bool
    {
        return true;
    }

    /** Sadece admin oluşturabilir */
    public function create(User $user): bool
    {
        return $user->role === 'admin';
    }

    public function update(User $user, Category $category): bool
    {
        return $user->role === 'admin';
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->role === 'admin';
    }
}
