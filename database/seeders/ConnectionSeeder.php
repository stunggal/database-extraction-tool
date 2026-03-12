<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // You can use the Connection model to create new records in the connections table
        // For example:
        \App\Models\Connection::create([
            'connection_name' => 'Production_Inventory',
            'db_type' => 'mysql',
            'host' => 'localhost',
            'port' => 3306,
            'database' => 'production_inventory',
            'username' => 'root',
            'password' => '',
        ]);

        \App\Models\Connection::create([
            'connection_name' => 'User_Auth_DB',
            'db_type' => 'mysql',
            'host' => 'localhost',
            'port' => 3306,
            'database' => 'user_auth_db',
            'username' => 'root',
            'password' => '',
        ]);
    }
}
