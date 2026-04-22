<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Api\Category;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json([
            'categories' => Category::select('id', 'name')->get()
        ]);
    }
}
