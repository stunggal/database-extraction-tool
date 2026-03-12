<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>DB Canvas Exporter</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('/css/canvas.css') }}">
</head>

<body class="h-screen flex">

    <aside class="w-72 bg-white border-r border-slate-200 flex flex-col z-20">
        <div class="p-6 border-b">
            <h1 class="font-bold text-xl text-blue-600 flex items-center gap-2">
                <i class="fas fa-project-diagram"></i> DB Canvas
            </h1>
        </div>

        <div class="p-4 overflow-y-auto flex-1">
            <div class="mb-6">
                <div class="flex justify-between items-center mb-2">
                    <label class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connected
                        Database</label>
                    <button onclick="openConnectionModal()" class="text-blue-600 hover:text-blue-700 transition-all"
                        title="Add New Connection">
                        <i class="fas fa-plus-circle text-lg"></i>
                    </button>
                </div>
                <div id="dbConnectionList" class="space-y-2">
                    @forelse ($connections as $connection)
                        <div class="db-connection-item {{ $loop->first ? 'active' : '' }}"
                            data-connection="{{ $connection->connection_name }}"
                            data-connection-id="{{ $connection->id }}" onclick="selectConnection(this)">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <i class="fas fa-database text-sm"></i>
                                    <span class="font-semibold text-sm">{{ $connection->connection_name }}</span>
                                </div>
                                <i class="fas fa-check-circle text-sm connection-check"></i>
                            </div>
                        </div>
                    @empty
                        <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500">
                            Belum ada koneksi tersimpan.
                        </div>
                    @endforelse
                </div>
            </div>

            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Available Tables</p>
            <div id="availableTablesList" class="space-y-2">
                <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 text-center">
                    <i class="fas fa-info-circle mr-2"></i>
                    Pilih koneksi untuk melihat tabel
                </div>
            </div>
        </div>

        <div class="p-4 bg-slate-50">
            <button
                class="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                Generate Export
            </button>
        </div>
    </aside>

    <main id="canvasViewport" class="flex-1 relative overflow-auto canvas-area p-10">

        @if (session('success'))
            <div class="absolute top-6 right-6 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg"
                role="alert">
                <strong class="font-bold">Success! </strong>
                <span class="block sm:inline">{{ session('success') }}</span>
            </div>
        @endif

        <div class="fixed top-6 left-80 flex gap-2 z-50">
            <button id="zoomInBtn" class="bg-white p-3 rounded-xl shadow-md text-slate-600 hover:text-blue-600"
                title="Zoom In"><i class="fas fa-search-plus"></i></button>
            <button id="zoomOutBtn" class="bg-white p-3 rounded-xl shadow-md text-slate-600 hover:text-blue-600"
                title="Zoom Out"><i class="fas fa-search-minus"></i></button>
            <button id="panModeBtn" class="bg-white p-3 rounded-xl shadow-md text-slate-600 hover:text-blue-600"
                title="Pan Mode"><i class="fas fa-mouse-pointer"></i></button>
        </div>

        <!-- Canvas container for dragged tables -->
        <div id="canvasContainer" class="absolute inset-0 w-full h-full">
            <!-- Empty canvas message -->
            <div id="emptyCanvasMessage" class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="text-center text-slate-400">
                    <i class="fas fa-project-diagram text-6xl mb-4 opacity-20"></i>
                    <p class="text-lg font-semibold">Canvas kosong</p>
                    <p class="text-sm">Drag tabel dari sidebar untuk memulai</p>
                </div>
            </div>
            <!-- DB cards will be added here dynamically -->

            <!-- Relation lines SVG -->
            <svg id="relation-svg" class="absolute inset-0 w-full h-full pointer-events-none" style="z-index: 5;">
                <!-- Lines will be drawn dynamically -->
            </svg>
        </div>

    </main>

    <aside class="w-64 bg-white border-l border-slate-200 p-6 z-20">
        <h3 class="font-bold text-slate-800 mb-4">Export Settings</h3>
        <div class="space-y-4">
            <div>
                <label class="text-xs text-slate-500 font-bold block mb-2">FORMAT</label>
                <div class="grid grid-cols-2 gap-2">
                    <button
                        class="p-2 border-2 border-blue-600 rounded-xl text-xs font-bold text-blue-600 bg-blue-50">JSON</button>
                    <button class="p-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-400">CSV</button>
                </div>
            </div>
            <div>
                <label class="text-xs text-slate-500 font-bold block mb-2">OPTIONS</label>
                <div class="space-y-2">
                    <label class="flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" checked> Include Relations
                    </label>
                    <label class="flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox"> Pretty Print
                    </label>
                </div>
            </div>
        </div>
    </aside>

    <!-- Inspection Modal -->
    <div id="inspectionModal" class="inspection-modal">
        <div class="inspection-content">
            <div
                class="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700">
                <div>
                    <h2 class="text-xl font-bold text-white flex items-center gap-3">
                        <i class="fas fa-database"></i>
                        <span id="inspectionTableName">Table Name</span>
                    </h2>
                    <p class="text-blue-100 text-sm mt-1">Database Structure & Sample Data</p>
                </div>
                <button onclick="closeInspection()" class="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <div class="overflow-y-auto" style="max-height: calc(80vh - 100px);">
                <!-- Structure Section -->
                <div class="p-6 border-b border-slate-200 bg-slate-50">
                    <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i class="fas fa-table text-blue-600"></i>
                        Table Structure
                    </h3>
                    <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <table class="inspection-table">
                            <thead>
                                <tr>
                                    <th>Column Name</th>
                                    <th>Data Type</th>
                                    <th>Nullable</th>
                                    <th>Key</th>
                                    <th>Default</th>
                                </tr>
                            </thead>
                            <tbody id="structureTableBody">
                                <!-- Will be populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Sample Data Section -->
                <div class="p-6">
                    <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <i class="fas fa-list text-green-600"></i>
                        Sample Data (Top 5 Rows)
                    </h3>
                    <div class="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        <div class="overflow-x-auto">
                            <table class="inspection-table" id="sampleDataTable">
                                <thead id="sampleDataHeader">
                                    <!-- Will be populated by JavaScript -->
                                </thead>
                                <tbody id="sampleDataBody">
                                    <!-- Will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Connection Modal -->
    <div id="connectionModal" class="inspection-modal">
        <div class="inspection-content" style="max-width: 600px;">
            <div
                class="p-6 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-green-600 to-green-700">
                <div>
                    <h2 class="text-xl font-bold text-white flex items-center gap-3">
                        <i class="fas fa-plug"></i>
                        <span>New Database Connection</span>
                    </h2>
                    <p class="text-green-100 text-sm mt-1">Connect to your database</p>
                </div>
                <button onclick="closeConnectionModal()"
                    class="text-white hover:bg-white/20 p-2 rounded-lg transition-all">
                    <i class="fas fa-times text-xl"></i>
                </button>
            </div>

            <div class="p-6">
                <div id="connectionStatus" class="mb-4 hidden">
                    <!-- Status messages will appear here -->
                </div>

                <form id="connectionForm" class="space-y-4" action="/addConnection" method="POST">
                    @csrf
                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            <i class="fas fa-tag text-slate-400 mr-2"></i>Connection Name
                        </label>
                        <input type="text" id="connectionName" name="connection_name"
                            class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="e.g., Production_DB" required>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            <i class="fas fa-database text-slate-400 mr-2"></i>Database Type
                        </label>
                        <select id="dbType" name="db_type"
                            class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all">
                            <option value="mysql">MySQL</option>
                            <option value="postgresql">PostgreSQL</option>
                            <option value="sqlite">SQLite</option>
                            <option value="sqlserver">SQL Server</option>
                        </select>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">
                                <i class="fas fa-server text-slate-400 mr-2"></i>Host
                            </label>
                            <input type="text" id="dbHost" name="host"
                                class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="localhost" value="localhost" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-slate-700 mb-2">
                                <i class="fas fa-ethernet text-slate-400 mr-2"></i>Port
                            </label>
                            <input type="text" id="dbPort" name="port"
                                class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                placeholder="3306" value="3306" required>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            <i class="fas fa-folder text-slate-400 mr-2"></i>Database Name
                        </label>
                        <input type="text" id="dbName" name="database"
                            class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="my_database" required>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            <i class="fas fa-user text-slate-400 mr-2"></i>Username
                        </label>
                        <input type="text" id="dbUsername" name="username"
                            class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="root" required>
                    </div>

                    <div>
                        <label class="block text-sm font-semibold text-slate-700 mb-2">
                            <i class="fas fa-lock text-slate-400 mr-2"></i>Password
                        </label>
                        <input type="password" id="dbPassword" name="password"
                            class="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            placeholder="••••••••">
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button type="button" onclick="testConnection()"
                            class="flex-1 bg-slate-100 text-slate-700 py-3 px-4 rounded-lg font-semibold hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                            <i class="fas fa-vial"></i> Test Connection
                        </button>
                        <button type="submit"
                            class="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg">
                            <i class="fas fa-check"></i> Save Connection
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="{{ asset('/js/canvas.js') }}"></script>

</body>

</html>
