<?php

namespace App\Http\Controllers;

use App\Models\Connection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use PDO;
use PDOException;

class ConnectionController extends Controller
{
    public function addConnection(Request $request)
    {
        try {
            // Validate the incoming request data
            $validatedData = $request->validate([
                'connection_name' => 'required|string|max:255',
                'db_type' => 'required|string',
                'host' => 'required|string|max:255',
                'port' => 'required|numeric',
                'database' => 'required|string|max:255',
                'username' => 'required|string|max:255',
                'password' => 'nullable|string',
            ]);

            // Create a new Connection instance and save it to the database
            $connection = new Connection();
            $connection->connection_name = $validatedData['connection_name'];
            $connection->db_type = $validatedData['db_type'];
            $connection->host = $validatedData['host'];
            $connection->port = $validatedData['port'];
            $connection->database = $validatedData['database'];
            $connection->username = $validatedData['username'];
            $connection->password = $validatedData['password'] ?? '';
            $connection->save();

            // Return JSON response for AJAX request
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Connection added successfully!',
                    'connection' => $connection
                ], 201);
            }

            // Redirect back with a success message for regular form submission
            return redirect()->back()->with('success', 'Connection added successfully!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error adding connection:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to save connection',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function testConnection(Request $request)
    {
        // Log incoming request for debugging
        Log::info('Test Connection Request:', $request->all());

        try {
            // Validate the incoming request data
            $validatedData = $request->validate([
                'db_type' => 'required|string',
                'host' => 'required|string',
                'port' => 'required|numeric',
                'database' => 'required|string',
                'username' => 'required|string',
                'password' => 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation Error:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        try {
            $dbType = $validatedData['db_type'];
            $host = $validatedData['host'];
            $port = $validatedData['port'];
            $database = $validatedData['database'];
            $username = $validatedData['username'];
            $password = $validatedData['password'] ?? '';

            // Build DSN based on database type
            $dsn = '';
            switch ($dbType) {
                case 'mysql':
                    $dsn = "mysql:host={$host};port={$port};dbname={$database}";
                    break;
                case 'postgresql':
                    $dsn = "pgsql:host={$host};port={$port};dbname={$database}";
                    break;
                case 'sqlserver':
                    $dsn = "sqlsrv:Server={$host},{$port};Database={$database}";
                    break;
                case 'sqlite':
                    $dsn = "sqlite:{$database}";
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Unsupported database type'
                    ], 400);
            }

            Log::info("Attempting connection with DSN: {$dsn}");

            // Attempt to create a PDO connection
            $pdo = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);

            // Test query
            $pdo->query('SELECT 1');

            return response()->json([
                'success' => true,
                'message' => 'Connection successful!',
                'details' => "Connected to {$database} at {$host}:{$port}"
            ]);
        } catch (PDOException $e) {
            Log::error('PDO Connection Error:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Connection failed',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTables($id)
    {
        try {
            // Find the connection by ID
            $connection = Connection::findOrFail($id);

            // Build DSN based on database type
            $dsn = '';
            switch ($connection->db_type) {
                case 'mysql':
                    $dsn = "mysql:host={$connection->host};port={$connection->port};dbname={$connection->database}";
                    break;
                case 'postgresql':
                    $dsn = "pgsql:host={$connection->host};port={$connection->port};dbname={$connection->database}";
                    break;
                case 'sqlserver':
                    $dsn = "sqlsrv:Server={$connection->host},{$connection->port};Database={$connection->database}";
                    break;
                case 'sqlite':
                    $dsn = "sqlite:{$connection->database}";
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Unsupported database type'
                    ], 400);
            }

            Log::info("Fetching tables from DSN: {$dsn}");

            // Attempt to create a PDO connection
            $pdo = new PDO($dsn, $connection->username, $connection->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);

            // Get table list based on database type
            $tables = [];
            switch ($connection->db_type) {
                case 'mysql':
                    $stmt = $pdo->query("SHOW TABLES");
                    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
                case 'postgresql':
                    $stmt = $pdo->query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
                    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
                case 'sqlite':
                    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
                case 'sqlserver':
                    $stmt = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
                    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
            }

            return response()->json([
                'success' => true,
                'tables' => $tables,
                'connection' => $connection->connection_name
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection not found'
            ], 404);
        } catch (PDOException $e) {
            Log::error('PDO Error fetching tables:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tables',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error fetching tables:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getTableColumns($id, Request $request)
    {
        try {
            // Validate request includes table name
            $validated = $request->validate([
                'table_name' => 'required|string'
            ]);

            $tableName = $validated['table_name'];

            // Find the connection by ID
            $connection = Connection::findOrFail($id);

            // Build DSN based on database type
            $dsn = '';
            switch ($connection->db_type) {
                case 'mysql':
                    $dsn = "mysql:host={$connection->host};port={$connection->port};dbname={$connection->database}";
                    break;
                case 'postgresql':
                    $dsn = "pgsql:host={$connection->host};port={$connection->port};dbname={$connection->database}";
                    break;
                case 'sqlserver':
                    $dsn = "sqlsrv:Server={$connection->host},{$connection->port};Database={$connection->database}";
                    break;
                case 'sqlite':
                    $dsn = "sqlite:{$connection->database}";
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Unsupported database type'
                    ], 400);
            }

            Log::info("Fetching columns from table {$tableName} using DSN: {$dsn}");

            // Attempt to create a PDO connection
            $pdo = new PDO($dsn, $connection->username, $connection->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);

            // Get column list based on database type
            $columns = [];
            switch ($connection->db_type) {
                case 'mysql':
                    $stmt = $pdo->prepare("SHOW COLUMNS FROM `{$tableName}`");
                    $stmt->execute();
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $columns[] = [
                            'name' => $row['Field'],
                            'type' => $row['Type'],
                            'key' => $row['Key'] === 'PRI' ? 'primary' : ($row['Key'] === 'MUL' ? 'foreign' : null)
                        ];
                    }
                    break;
                case 'postgresql':
                    $stmt = $pdo->prepare("
                        SELECT column_name, data_type, 
                               CASE WHEN column_name IN (
                                   SELECT kcu.column_name 
                                   FROM information_schema.table_constraints tc
                                   JOIN information_schema.key_column_usage kcu 
                                   ON tc.constraint_name = kcu.constraint_name
                                   WHERE tc.table_name = :table_name 
                                   AND tc.constraint_type = 'PRIMARY KEY'
                               ) THEN 'primary'
                               WHEN column_name IN (
                                   SELECT kcu.column_name 
                                   FROM information_schema.table_constraints tc
                                   JOIN information_schema.key_column_usage kcu 
                                   ON tc.constraint_name = kcu.constraint_name
                                   WHERE tc.table_name = :table_name 
                                   AND tc.constraint_type = 'FOREIGN KEY'
                               ) THEN 'foreign'
                               ELSE NULL END as key_type
                        FROM information_schema.columns 
                        WHERE table_name = :table_name
                    ");
                    $stmt->execute(['table_name' => $tableName]);
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $columns[] = [
                            'name' => $row['column_name'],
                            'type' => $row['data_type'],
                            'key' => $row['key_type']
                        ];
                    }
                    break;
                case 'sqlite':
                    $stmt = $pdo->prepare("PRAGMA table_info({$tableName})");
                    $stmt->execute();
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $columns[] = [
                            'name' => $row['name'],
                            'type' => $row['type'],
                            'key' => $row['pk'] == 1 ? 'primary' : null
                        ];
                    }
                    break;
                case 'sqlserver':
                    $stmt = $pdo->prepare("
                        SELECT c.COLUMN_NAME, c.DATA_TYPE,
                               CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'primary'
                                    WHEN fk.COLUMN_NAME IS NOT NULL THEN 'foreign'
                                    ELSE NULL END as key_type
                        FROM INFORMATION_SCHEMA.COLUMNS c
                        LEFT JOIN (
                            SELECT ku.COLUMN_NAME
                            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku 
                                ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
                            WHERE tc.TABLE_NAME = :table_name 
                                AND tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                        ) pk ON c.COLUMN_NAME = pk.COLUMN_NAME
                        LEFT JOIN (
                            SELECT ku.COLUMN_NAME
                            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE ku 
                                ON tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
                            WHERE tc.TABLE_NAME = :table_name 
                                AND tc.CONSTRAINT_TYPE = 'FOREIGN KEY'
                        ) fk ON c.COLUMN_NAME = fk.COLUMN_NAME
                        WHERE c.TABLE_NAME = :table_name
                    ");
                    $stmt->execute(['table_name' => $tableName]);
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $columns[] = [
                            'name' => $row['COLUMN_NAME'],
                            'type' => $row['DATA_TYPE'],
                            'key' => $row['key_type']
                        ];
                    }
                    break;
            }

            return response()->json([
                'success' => true,
                'columns' => $columns,
                'table_name' => $tableName
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Table name is required',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection not found'
            ], 404);
        } catch (PDOException $e) {
            Log::error('PDO Error fetching columns:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch columns',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error fetching columns:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getSchema($id)
    {
        try {
            $connection = Connection::findOrFail($id);

            $dsn = '';
            switch ($connection->db_type) {
                case 'mysql':
                    $dsn = "mysql:host={$connection->host};port={$connection->port};dbname={$connection->database}";
                    break;
                case 'postgresql':
                    $dsn = "pgsql:host={$connection->host};port={$connection->port};dbname={$connection->database}";
                    break;
                case 'sqlserver':
                    $dsn = "sqlsrv:Server={$connection->host},{$connection->port};Database={$connection->database}";
                    break;
                case 'sqlite':
                    $dsn = "sqlite:{$connection->database}";
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Unsupported database type'
                    ], 400);
            }

            $pdo = new PDO($dsn, $connection->username, $connection->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => 5,
            ]);

            $tableNames = [];
            switch ($connection->db_type) {
                case 'mysql':
                    $stmt = $pdo->query("SHOW TABLES");
                    $tableNames = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
                case 'postgresql':
                    $stmt = $pdo->query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
                    $tableNames = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
                case 'sqlite':
                    $stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
                    $tableNames = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
                case 'sqlserver':
                    $stmt = $pdo->query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
                    $tableNames = $stmt->fetchAll(PDO::FETCH_COLUMN);
                    break;
            }

            $tables = [];
            foreach ($tableNames as $tableName) {
                $columns = [];

                switch ($connection->db_type) {
                    case 'mysql':
                        $stmt = $pdo->prepare("SHOW COLUMNS FROM `{$tableName}`");
                        $stmt->execute();
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($rows as $row) {
                            $columns[] = [
                                'name' => $row['Field'],
                                'type' => $row['Type'],
                                'key' => $row['Key'] === 'PRI' ? 'primary' : ($row['Key'] === 'MUL' ? 'foreign' : null)
                            ];
                        }
                        break;
                    case 'postgresql':
                        $stmt = $pdo->prepare("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = :table_name");
                        $stmt->execute(['table_name' => $tableName]);
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($rows as $row) {
                            $columns[] = [
                                'name' => $row['column_name'],
                                'type' => $row['data_type'],
                                'key' => null
                            ];
                        }
                        break;
                    case 'sqlite':
                        $stmt = $pdo->prepare("PRAGMA table_info({$tableName})");
                        $stmt->execute();
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($rows as $row) {
                            $columns[] = [
                                'name' => $row['name'],
                                'type' => $row['type'],
                                'key' => $row['pk'] == 1 ? 'primary' : null
                            ];
                        }
                        break;
                    case 'sqlserver':
                        $stmt = $pdo->prepare("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :table_name");
                        $stmt->execute(['table_name' => $tableName]);
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($rows as $row) {
                            $columns[] = [
                                'name' => $row['COLUMN_NAME'],
                                'type' => $row['DATA_TYPE'],
                                'key' => null
                            ];
                        }
                        break;
                }

                $tables[] = [
                    'name' => $tableName,
                    'columns' => $columns,
                ];
            }

            $relations = [];
            switch ($connection->db_type) {
                case 'mysql':
                    $stmt = $pdo->prepare("SELECT TABLE_NAME AS from_table, COLUMN_NAME AS from_column, REFERENCED_TABLE_NAME AS to_table, REFERENCED_COLUMN_NAME AS to_column FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = :schema AND REFERENCED_TABLE_NAME IS NOT NULL");
                    $stmt->execute(['schema' => $connection->database]);
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $relations[] = [
                            'from' => $row['to_table'],
                            'to' => $row['from_table'],
                            'fromColumn' => $row['to_column'],
                            'toColumn' => $row['from_column'],
                        ];
                    }
                    break;
                case 'postgresql':
                    $stmt = $pdo->query("SELECT ccu.table_name AS from_table, ccu.column_name AS from_column, tc.table_name AS to_table, kcu.column_name AS to_column FROM information_schema.table_constraints AS tc JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name WHERE tc.constraint_type = 'FOREIGN KEY'");
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $relations[] = [
                            'from' => $row['from_table'],
                            'to' => $row['to_table'],
                            'fromColumn' => $row['from_column'],
                            'toColumn' => $row['to_column'],
                        ];
                    }
                    break;
                case 'sqlite':
                    foreach ($tableNames as $tableName) {
                        $stmt = $pdo->prepare("PRAGMA foreign_key_list({$tableName})");
                        $stmt->execute();
                        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($rows as $row) {
                            $relations[] = [
                                'from' => $row['table'],
                                'to' => $tableName,
                                'fromColumn' => $row['to'],
                                'toColumn' => $row['from'],
                            ];
                        }
                    }
                    break;
                case 'sqlserver':
                    $stmt = $pdo->query("SELECT OBJECT_NAME(f.parent_object_id) AS from_table, COL_NAME(fc.parent_object_id, fc.parent_column_id) AS from_column, OBJECT_NAME(f.referenced_object_id) AS to_table, COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS to_column FROM sys.foreign_keys AS f INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id");
                    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    foreach ($rows as $row) {
                        $relations[] = [
                            'from' => $row['to_table'],
                            'to' => $row['from_table'],
                            'fromColumn' => $row['to_column'],
                            'toColumn' => $row['from_column'],
                        ];
                    }
                    break;
            }

            return response()->json([
                'success' => true,
                'tables' => $tables,
                'relations' => $relations,
                'connection' => $connection->connection_name,
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection not found'
            ], 404);
        } catch (PDOException $e) {
            Log::error('PDO Error fetching schema:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch schema',
                'error' => $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            Log::error('Error fetching schema:', ['message' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'An error occurred',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
