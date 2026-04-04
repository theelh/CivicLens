<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::insert([
            ['id' => 1, 'name' => 'Infrastructure'],
            ['id' => 2, 'name' => 'Sanitation'],
            ['id' => 3, 'name' => 'Safety'],
            ['id' => 4, 'name' => 'Transportation'],
            ['id' => 5, 'name' => 'Noise'],
            ['id' => 6, 'name' => 'Other'],
        ]);
    }
}
