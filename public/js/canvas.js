// ===== TABLE RELATIONS =====
const relations = [];

// ===== CANVAS STATE =====
const CANVAS_WORLD_WIDTH = 3200;
const CANVAS_WORLD_HEIGHT = 2400;
let currentZoom = 1;
const minZoom = 0.5;
const maxZoom = 2;
let panModeEnabled = false;
let selectedExportFormat = 'json';
const selectedTables = new Set();

// ===== TABLE DATA =====
const tableData = {
    users: {
        structure: [{
            name: 'id',
            type: 'INT',
            nullable: 'NO',
            key: 'PRI',
            default: 'AUTO_INCREMENT'
        },
        {
            name: 'username',
            type: 'VARCHAR(50)',
            nullable: 'NO',
            key: '',
            default: 'NULL'
        },
        {
            name: 'email',
            type: 'VARCHAR(100)',
            nullable: 'NO',
            key: 'UNI',
            default: 'NULL'
        },
        {
            name: 'password',
            type: 'VARCHAR(255)',
            nullable: 'NO',
            key: '',
            default: 'NULL'
        },
        {
            name: 'created_at',
            type: 'TIMESTAMP',
            nullable: 'YES',
            key: '',
            default: 'CURRENT_TIMESTAMP'
        }
        ],
        sampleData: [{
            id: 1,
            username: 'john_doe',
            email: 'john@example.com',
            password: '***',
            created_at: '2024-01-15 10:30:00'
        },
        {
            id: 2,
            username: 'jane_smith',
            email: 'jane@example.com',
            password: '***',
            created_at: '2024-02-20 14:22:00'
        },
        {
            id: 3,
            username: 'bob_wilson',
            email: 'bob@example.com',
            password: '***',
            created_at: '2024-03-10 09:15:00'
        },
        {
            id: 4,
            username: 'alice_brown',
            email: 'alice@example.com',
            password: '***',
            created_at: '2024-04-05 16:45:00'
        },
        {
            id: 5,
            username: 'charlie_davis',
            email: 'charlie@example.com',
            password: '***',
            created_at: '2024-05-12 11:20:00'
        }
        ]
    },
    orders: {
        structure: [{
            name: 'id',
            type: 'INT',
            nullable: 'NO',
            key: 'PRI',
            default: 'AUTO_INCREMENT'
        },
        {
            name: 'user_id',
            type: 'INT',
            nullable: 'NO',
            key: 'FOR',
            default: 'NULL'
        },
        {
            name: 'product_id',
            type: 'INT',
            nullable: 'NO',
            key: 'FOR',
            default: 'NULL'
        },
        {
            name: 'total_price',
            type: 'DECIMAL(10,2)',
            nullable: 'NO',
            key: '',
            default: '0.00'
        },
        {
            name: 'order_date',
            type: 'TIMESTAMP',
            nullable: 'YES',
            key: '',
            default: 'CURRENT_TIMESTAMP'
        },
        {
            name: 'status',
            type: 'VARCHAR(20)',
            nullable: 'YES',
            key: '',
            default: 'pending'
        }
        ],
        sampleData: [{
            id: 1,
            user_id: 1,
            product_id: 3,
            total_price: 299.99,
            order_date: '2024-06-01 10:30:00',
            status: 'completed'
        },
        {
            id: 2,
            user_id: 2,
            product_id: 1,
            total_price: 599.99,
            order_date: '2024-06-03 14:22:00',
            status: 'pending'
        },
        {
            id: 3,
            user_id: 1,
            product_id: 2,
            total_price: 149.99,
            order_date: '2024-06-05 09:15:00',
            status: 'shipped'
        },
        {
            id: 4,
            user_id: 3,
            product_id: 5,
            total_price: 799.99,
            order_date: '2024-06-07 16:45:00',
            status: 'completed'
        },
        {
            id: 5,
            user_id: 4,
            product_id: 2,
            total_price: 149.99,
            order_date: '2024-06-10 11:20:00',
            status: 'pending'
        }
        ]
    },
    products: {
        structure: [{
            name: 'id',
            type: 'INT',
            nullable: 'NO',
            key: 'PRI',
            default: 'AUTO_INCREMENT'
        },
        {
            name: 'product_name',
            type: 'VARCHAR(100)',
            nullable: 'NO',
            key: '',
            default: 'NULL'
        },
        {
            name: 'price',
            type: 'DECIMAL(10,2)',
            nullable: 'NO',
            key: '',
            default: '0.00'
        },
        {
            name: 'stock',
            type: 'INT',
            nullable: 'YES',
            key: '',
            default: '0'
        },
        {
            name: 'category',
            type: 'VARCHAR(50)',
            nullable: 'YES',
            key: '',
            default: 'NULL'
        }
        ],
        sampleData: [{
            id: 1,
            product_name: 'Laptop Pro 15"',
            price: 1299.99,
            stock: 45,
            category: 'Electronics'
        },
        {
            id: 2,
            product_name: 'Wireless Mouse',
            price: 29.99,
            stock: 150,
            category: 'Accessories'
        },
        {
            id: 3,
            product_name: 'USB-C Hub',
            price: 49.99,
            stock: 89,
            category: 'Accessories'
        },
        {
            id: 4,
            product_name: 'Mechanical Keyboard',
            price: 149.99,
            stock: 62,
            category: 'Accessories'
        },
        {
            id: 5,
            product_name: '4K Monitor',
            price: 499.99,
            stock: 28,
            category: 'Electronics'
        }
        ]
    }
};

// ===== INSPECTION MODAL FUNCTIONS =====
function renderInspectionData(tableName, data) {
    const tableNameEl = document.getElementById('inspectionTableName');
    const structureBody = document.getElementById('structureTableBody');
    const sampleHeader = document.getElementById('sampleDataHeader');
    const sampleBody = document.getElementById('sampleDataBody');

    tableNameEl.textContent = tableName;

    structureBody.innerHTML = '';
    (data.structure || []).forEach(col => {
        const keyBadge = col.key ?
            `<span class="px-2 py-1 rounded text-[10px] font-bold ${col.key === 'PRI' ? 'bg-amber-100 text-amber-700' : col.key === 'FOR' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}">${col.key}</span>` :
            '-';
        const row = `
                    <tr>
                        <td class="font-semibold text-slate-700">${col.name}</td>
                        <td class="text-blue-600 font-mono text-xs">${col.type}</td>
                        <td>${col.nullable === 'YES' ? '<span class="text-green-600">✓</span>' : '<span class="text-red-600">✗</span>'}</td>
                        <td>${keyBadge}</td>
                        <td class="font-mono text-xs text-slate-500">${col.default ?? 'NULL'}</td>
                    </tr>
                `;
        structureBody.innerHTML += row;
    });

    sampleHeader.innerHTML = '';
    sampleBody.innerHTML = '';

    if (Array.isArray(data.sampleData) && data.sampleData.length > 0) {
        const columns = Object.keys(data.sampleData[0]);
        sampleHeader.innerHTML = '<tr>' + columns.map(col => `<th>${col}</th>`).join('') + '</tr>';

        data.sampleData.forEach(row => {
            const rowHtml = '<tr>' + columns.map(col => {
                const value = row[col] === null ? 'NULL' : String(row[col]);
                return `<td class="font-mono text-xs">${value}</td>`;
            }).join('') + '</tr>';
            sampleBody.innerHTML += rowHtml;
        });
        return;
    }

    sampleHeader.innerHTML = '<tr><th>Info</th></tr>';
    sampleBody.innerHTML = '<tr><td class="text-slate-500">Tidak ada data untuk ditampilkan.</td></tr>';
}

window.showInspection = function (tableName) {
    const modal = document.getElementById('inspectionModal');
    const structureBody = document.getElementById('structureTableBody');
    const sampleHeader = document.getElementById('sampleDataHeader');
    const sampleBody = document.getElementById('sampleDataBody');

    document.getElementById('inspectionTableName').textContent = tableName;
    structureBody.innerHTML = '<tr><td colspan="5" class="text-slate-500">Memuat struktur tabel...</td></tr>';
    sampleHeader.innerHTML = '<tr><th>Info</th></tr>';
    sampleBody.innerHTML = '<tr><td class="text-slate-500">Memuat 5 data terbaru...</td></tr>';
    modal.classList.add('active');

    if (!currentConnectionId) {
        const fallbackData = tableData[tableName];
        if (fallbackData) {
            renderInspectionData(tableName, fallbackData);
            return;
        }

        structureBody.innerHTML = '<tr><td colspan="5" class="text-red-500">Koneksi aktif tidak ditemukan.</td></tr>';
        sampleBody.innerHTML = '<tr><td class="text-red-500">Koneksi aktif tidak ditemukan.</td></tr>';
        return;
    }

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    fetch(`/getTableInspection/${currentConnectionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify({ table_name: tableName })
    })
        .then(response => response.json().then(data => ({ ok: response.ok, data })))
        .then(({ ok, data }) => {
            if (!ok || !data.success) {
                throw new Error(data.message || 'Failed to load inspection data');
            }

            renderInspectionData(tableName, data);
        })
        .catch(error => {
            console.error('Error loading table inspection:', error);

            const fallbackData = tableData[tableName];
            if (fallbackData) {
                renderInspectionData(tableName, fallbackData);
                return;
            }

            structureBody.innerHTML = '<tr><td colspan="5" class="text-red-500">Gagal memuat struktur tabel.</td></tr>';
            sampleHeader.innerHTML = '<tr><th>Info</th></tr>';
            sampleBody.innerHTML = '<tr><td class="text-red-500">Gagal memuat 5 data terbaru.</td></tr>';
        });
}

window.closeInspection = function () {
    const modal = document.getElementById('inspectionModal');
    modal.classList.remove('active');
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
    const modal = document.getElementById('inspectionModal');
    if (e.target === modal) {
        closeInspection();
    }

    // Close connection modal when clicking outside
    const connectionModal = document.getElementById('connectionModal');
    if (e.target === connectionModal) {
        closeConnectionModal();
    }
});

// ===== CONNECTION MODAL FUNCTIONS =====
window.openConnectionModal = function () {
    const modal = document.getElementById('connectionModal');
    modal.classList.add('active');
    // Reset form
    document.getElementById('connectionForm').reset();
    document.getElementById('connectionStatus').classList.add('hidden');
}

window.closeConnectionModal = function () {
    const modal = document.getElementById('connectionModal');
    modal.classList.remove('active');
}

window.testConnection = function () {
    const statusDiv = document.getElementById('connectionStatus');
    console.log('Status div element:', statusDiv);

    const formData = {
        db_type: document.getElementById('dbType').value,
        host: document.getElementById('dbHost').value,
        port: document.getElementById('dbPort').value,
        database: document.getElementById('dbName').value,
        username: document.getElementById('dbUsername').value,
        password: document.getElementById('dbPassword').value
    };

    console.log('Testing connection with data:', formData);

    // Show testing message
    statusDiv.innerHTML = `
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <i class="fas fa-spinner fa-spin text-blue-600"></i>
            <span class="text-blue-700 font-semibold">Testing connection...</span>
        </div>
    `;
    statusDiv.classList.remove('hidden');

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
        document.querySelector('input[name="_token"]')?.value;

    console.log('CSRF Token:', csrfToken);

    // Make actual API call to test connection
    fetch('/testConnection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => {
            console.log('Response status:', response.status);
            // Always parse JSON, regardless of status
            return response.json().then(data => {
                return { status: response.status, data: data };
            });
        })
        .then(({ status, data }) => {
            console.log('Response status:', status);
            console.log('Response data:', data);
            console.log('data.success:', data.success);

            // Ensure status div is visible
            statusDiv.classList.remove('hidden');
            console.log('Removed hidden class, statusDiv classes:', statusDiv.className);

            if (data.success) {
                console.log('Showing success message');
                statusDiv.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <i class="fas fa-check-circle text-green-600 text-xl"></i>
                    <div>
                        <div class="text-green-700 font-semibold">${data.message}</div>
                        <div class="text-green-600 text-sm">${data.details || ''}</div>
                    </div>
                </div>
            `;
            } else {
                console.log('Showing error message, status:', status);
                // Handle validation errors (422)
                if (status === 422 && data.errors) {
                    console.log('Validation error path (422)');
                    const errorMessages = Object.values(data.errors).flat().join('<br>');
                    statusDiv.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                        <div>
                            <div class="text-red-700 font-semibold">${data.message || 'Validation Failed'}</div>
                            <div class="text-red-600 text-sm">${errorMessages}</div>
                        </div>
                    </div>
                `;
                } else {
                    console.log('Connection error path (500 or other), status:', status);
                    console.log('Error message:', data.message);
                    console.log('Error detail:', data.error);
                    // Handle other errors (500, etc)
                    statusDiv.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                        <div>
                            <div class="text-red-700 font-semibold">${data.message || 'Connection Failed'}</div>
                            <div class="text-red-600 text-sm">${data.error || 'Please check your credentials and try again.'}</div>
                        </div>
                    </div>
                `;
                }
            }
        })
        .catch(error => {
            console.error('Error testing connection:', error);

            // Ensure status div is visible
            statusDiv.classList.remove('hidden');

            statusDiv.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                <div>
                    <div class="text-red-700 font-semibold">Connection Failed</div>
                    <div class="text-red-600 text-sm">${error.message || 'Network error. Please try again.'}</div>
                </div>
            </div>
        `;
        });
}

// ===== DATABASE CONNECTION LIST FUNCTIONS =====
window.selectConnection = function (element) {
    console.log('selectConnection called with element:', element);

    // Remove active class from all connection items
    const allConnections = document.querySelectorAll('.db-connection-item');
    console.log('Found connections:', allConnections.length);

    allConnections.forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected item
    element.classList.add('active');

    // Get selected connection name and ID
    const connectionName = element.getAttribute('data-connection');
    const connectionId = element.getAttribute('data-connection-id');
    console.log('Selected connection:', connectionName, 'ID:', connectionId);

    // Store current connection ID globally
    currentConnectionId = connectionId;

    // Fetch tables from selected connection
    if (connectionId) {
        loadTablesFromConnection(connectionId);
    }
}

function loadTablesFromConnection(connectionId) {
    const tablesList = document.getElementById('availableTablesList');
    if (!tablesList) return;

    // Show loading state
    tablesList.innerHTML = `
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 text-center">
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Loading tables...
        </div>
    `;

    // Get CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // Fetch tables from API
    fetch(`/getTables/${connectionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log('Tables response:', data);

            if (data.success && data.tables && data.tables.length > 0) {
                // Render tables
                tablesList.innerHTML = data.tables.map(table => `
                    <div draggable="true"
                        class="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 cursor-move hover:border-blue-400 transition-all flex justify-between items-center"
                        data-table="${table}">
                        <span>${table}</span>
                        <i class="fas fa-plus text-slate-300"></i>
                    </div>
                `).join('');

                // Re-initialize drag handlers for newly rendered tables
                initializeSidebarDrag();
            } else if (data.success && data.tables && data.tables.length === 0) {
                // No tables found
                tablesList.innerHTML = `
                    <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700 text-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        Tidak ada tabel ditemukan
                    </div>
                `;
            } else {
                // Error from API
                tablesList.innerHTML = `
                    <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        ${data.message || 'Gagal memuat tabel'}
                    </div>
                `;
            }

            // Populate free canvas with all tables + relations from selected connection.
            loadCanvasFromConnection(connectionId);
        })
        .catch(error => {
            console.error('Error loading tables:', error);
            tablesList.innerHTML = `
                <div class="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 text-center">
                    <i class="fas fa-exclamation-circle mr-2"></i>
                    Network error: ${error.message}
                </div>
            `;
        });
}

function clearCanvas() {
    const canvasContainer = document.getElementById('canvasContainer');
    const emptyMessage = document.getElementById('emptyCanvasMessage');
    const relationSvg = document.getElementById('relation-svg');

    if (canvasContainer) {
        canvasContainer.querySelectorAll('.db-card').forEach(card => card.remove());
    }

    if (relationSvg) {
        relationSvg.innerHTML = '';
    }

    if (emptyMessage) {
        emptyMessage.classList.remove('hidden');
    }
}

function updateTableSelection(tableName, isSelected) {
    if (isSelected) {
        selectedTables.add(tableName);
        return;
    }

    selectedTables.delete(tableName);
}

window.toggleTableSelection = function (tableName, isSelected) {
    updateTableSelection(tableName, isSelected);
}

function setExportFormat(format) {
    selectedExportFormat = format;

    document.querySelectorAll('.export-format-btn').forEach(button => {
        const isActive = button.getAttribute('data-export-format') === format;
        button.classList.toggle('border-2', isActive);
        button.classList.toggle('border-blue-600', isActive);
        button.classList.toggle('text-blue-600', isActive);
        button.classList.toggle('bg-blue-50', isActive);
        button.classList.toggle('border', !isActive);
        button.classList.toggle('border-slate-200', !isActive);
        button.classList.toggle('text-slate-400', !isActive);
    });
}

function getDownloadFilename(response, fallbackName) {
    const disposition = response.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="?([^";]+)"?/i);
    return match ? match[1] : fallbackName;
}

function triggerBrowserDownload(blob, filename) {
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
}

function initializeExportControls() {
    document.querySelectorAll('.export-format-btn').forEach(button => {
        button.addEventListener('click', () => {
            setExportFormat(button.getAttribute('data-export-format'));
        });
    });

    setExportFormat(selectedExportFormat);

    const generateExportBtn = document.getElementById('generateExportBtn');
    if (!generateExportBtn) return;

    generateExportBtn.addEventListener('click', async () => {
        if (!currentConnectionId) {
            window.alert('Pilih koneksi database terlebih dahulu.');
            return;
        }

        if (selectedTables.size === 0) {
            window.alert('Pilih minimal satu tabel untuk di-export.');
            return;
        }

        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        const originalText = generateExportBtn.textContent;

        generateExportBtn.disabled = true;
        generateExportBtn.textContent = 'Generating...';

        try {
            const response = await fetch(`/exportTables/${currentConnectionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/octet-stream'
                },
                body: JSON.stringify({
                    format: selectedExportFormat,
                    tables: Array.from(selectedTables)
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to export tables' }));
                throw new Error(errorData.message || 'Failed to export tables');
            }

            const blob = await response.blob();
            const filename = getDownloadFilename(response, `export.${selectedExportFormat}`);
            triggerBrowserDownload(blob, filename);
        } catch (error) {
            console.error('Error exporting tables:', error);
            window.alert(error.message || 'Gagal melakukan export tabel.');
        } finally {
            generateExportBtn.disabled = false;
            generateExportBtn.textContent = originalText;
        }
    });
}

function loadCanvasFromConnection(connectionId) {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    selectedTables.clear();
    clearCanvas();

    fetch(`/getSchema/${connectionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success || !Array.isArray(data.tables)) {
                return;
            }

            const tableCount = data.tables.length;
            if (tableCount === 0) {
                return;
            }

            const columns = Math.ceil(Math.sqrt(tableCount));
            const horizontalGap = 280;
            const verticalGap = 240;
            const startX = 80;
            const startY = 100;

            data.tables.forEach((table, index) => {
                const colIndex = index % columns;
                const rowIndex = Math.floor(index / columns);
                const x = startX + (colIndex * horizontalGap);
                const y = startY + (rowIndex * verticalGap);

                renderTableCard(table.name, table.columns || [], x, y);

                // Keep inspection modal data in sync for dynamic tables.
                tableData[table.name] = {
                    structure: (table.columns || []).map(col => ({
                        name: col.name,
                        type: col.type,
                        nullable: 'YES',
                        key: col.key === 'primary' ? 'PRI' : (col.key === 'foreign' ? 'FOR' : ''),
                        default: 'NULL'
                    })),
                    sampleData: []
                };
            });

            relations.length = 0;
            if (Array.isArray(data.relations)) {
                data.relations.forEach(rel => relations.push(rel));
            }

            console.log('Relations loaded:', relations);
            console.log('Total relations:', relations.length);

            // Wait for DOM to be ready before drawing relations
            console.log('Calling updateRelationLines...');
            setTimeout(() => {
                console.log('Inside setTimeout - about to call updateRelationLines');
                const svg = document.getElementById('relation-svg');
                console.log('SVG element found:', !!svg);
                updateRelationLines();
                console.log('updateRelationLines executed');
            }, 100);
        })
        .catch(error => {
            console.error('Error loading canvas schema:', error);
        });
}

function renderTableCard(tableName, columns, x, y) {
    const canvasContainer = document.getElementById('canvasContainer');
    const emptyMessage = document.getElementById('emptyCanvasMessage');
    if (!canvasContainer) return;

    if (emptyMessage) {
        emptyMessage.classList.add('hidden');
    }

    const card = document.createElement('div');
    card.className = 'db-card';
    card.setAttribute('data-table', tableName);
    card.style.top = `${y}px`;
    card.style.left = `${x}px`;

    console.log(`Created card ${tableName} at position (${x}, ${y}) - style.left="${card.style.left}" style.top="${card.style.top}"`);

    const cardColors = [
        'bg-blue-600', 'bg-purple-600', 'bg-green-600', 'bg-red-600',
        'bg-indigo-600', 'bg-pink-600', 'bg-teal-600', 'bg-orange-600'
    ];
    const existingCards = document.querySelectorAll('.db-card').length;
    const bgColor = cardColors[existingCards % cardColors.length];

    if (!selectedTables.has(tableName)) {
        selectedTables.add(tableName);
    }

    const isSelected = selectedTables.has(tableName);

    const columnsHtml = columns.map(column => {
        let icon = '';
        if (column.key === 'primary') {
            icon = '<i class="fas fa-key text-amber-400 mr-2"></i>';
        } else if (column.key === 'foreign') {
            icon = '<i class="fas fa-link text-blue-400 mr-2"></i>';
        }

        return `
            <div class="column-item p-2 text-xs flex justify-between items-center rounded-lg hover:bg-slate-50" data-column="${column.name}">
                <span>${icon}${column.name}</span>
                <span class="text-[10px] text-slate-400 italic">${String(column.type || '').toUpperCase()}</span>
            </div>
        `;
    }).join('');

    card.innerHTML = `
        <div class="p-3 ${bgColor} text-white rounded-t-xl font-bold text-sm flex justify-between items-center">
            <div class="flex items-center gap-2 min-w-0">
                <input type="checkbox" ${isSelected ? 'checked' : ''} class="h-4 w-4 rounded border-white/50 bg-white/10 accent-white" onmousedown="event.stopPropagation()" onclick="event.stopPropagation()" onchange="toggleTableSelection('${tableName}', this.checked)">
                <span class="truncate">${tableName}</span>
            </div>
            <i class="fas fa-eye text-sm cursor-pointer hover:scale-110 transition-transform" onmousedown="event.stopPropagation()" onclick="event.stopPropagation(); showInspection('${tableName}')"></i>
        </div>
        <div class="p-2 space-y-1">
            ${columnsHtml || '<div class="text-xs text-slate-500">No columns</div>'}
        </div>
    `;

    canvasContainer.appendChild(card);

    console.log(`After appendChild ${tableName}: style.left="${card.style.left}" style.top="${card.style.top}"`);

    const header = card.querySelector(`.${bgColor}`);
    if (header) {
        header.style.cursor = 'move';
        header.addEventListener('mousedown', startDrag);
    }
}

console.log('selectConnection is available:', typeof window.selectConnection);

function addConnectionToList(connectionName) {
    const connectionList = document.getElementById('dbConnectionList');

    // Create new connection item
    const newItem = document.createElement('div');
    newItem.className = 'db-connection-item';
    newItem.setAttribute('data-connection', connectionName);
    newItem.setAttribute('onclick', 'selectConnection(this)');

    newItem.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fas fa-database text-sm"></i>
                <span class="font-semibold text-sm">${connectionName}</span>
            </div>
            <i class="fas fa-check-circle text-sm connection-check"></i>
        </div>
    `;

    // Add to list
    connectionList.appendChild(newItem);

    // Select the new connection
    selectConnection(newItem);
}

// Handle connection form submission
document.addEventListener('DOMContentLoaded', function () {
    const connectionForm = document.getElementById('connectionForm');
    if (connectionForm) {
        connectionForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const statusDiv = document.getElementById('connectionStatus');
            const formData = {
                connection_name: document.getElementById('connectionName').value,
                db_type: document.getElementById('dbType').value,
                host: document.getElementById('dbHost').value,
                port: document.getElementById('dbPort').value,
                database: document.getElementById('dbName').value,
                username: document.getElementById('dbUsername').value,
                password: document.getElementById('dbPassword').value
            };

            // Show saving message
            statusDiv.innerHTML = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                    <i class="fas fa-spinner fa-spin text-blue-600"></i>
                    <span class="text-blue-700 font-semibold">Saving connection...</span>
                </div>
            `;
            statusDiv.classList.remove('hidden');

            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            // Make actual API call to save connection
            fetch('/addConnection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })
                .then(response => {
                    return response.json().then(data => {
                        return { status: response.status, data: data };
                    });
                })
                .then(({ status, data }) => {
                    console.log('Save connection response:', data);

                    if (data.success || status === 200 || status === 201) {
                        // Add to connection list
                        addConnectionToList(formData.connection_name);

                        // Show success message
                        statusDiv.innerHTML = `
                            <div class="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <i class="fas fa-check-circle text-green-600 text-xl"></i>
                                <div>
                                    <div class="text-green-700 font-semibold">Connection Saved!</div>
                                    <div class="text-green-600 text-sm">${data.message || 'You can now use this connection.'}</div>
                                </div>
                            </div>
                        `;

                        // Close modal after 1.5 seconds
                        setTimeout(() => {
                            closeConnectionModal();
                            // Reload page to refresh connection list
                            window.location.reload();
                        }, 1500);
                    } else {
                        // Handle validation errors
                        if (status === 422 && data.errors) {
                            const errorMessages = Object.values(data.errors).flat().join('<br>');
                            statusDiv.innerHTML = `
                                <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                                    <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                                    <div>
                                        <div class="text-red-700 font-semibold">${data.message || 'Validation Failed'}</div>
                                        <div class="text-red-600 text-sm">${errorMessages}</div>
                                    </div>
                                </div>
                            `;
                        } else {
                            statusDiv.innerHTML = `
                                <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                                    <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                                    <div>
                                        <div class="text-red-700 font-semibold">Save Failed</div>
                                        <div class="text-red-600 text-sm">${data.message || 'Please try again.'}</div>
                                    </div>
                                </div>
                            `;
                        }
                    }
                })
                .catch(error => {
                    console.error('Error saving connection:', error);
                    statusDiv.innerHTML = `
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                            <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
                            <div>
                                <div class="text-red-700 font-semibold">Save Failed</div>
                                <div class="text-red-600 text-sm">${error.message || 'Network error. Please try again.'}</div>
                            </div>
                        </div>
                    `;
                });
        });
    }
});

// Update port based on database type
document.addEventListener('DOMContentLoaded', function () {
    const dbTypeSelect = document.getElementById('dbType');
    const portInput = document.getElementById('dbPort');

    if (dbTypeSelect && portInput) {
        dbTypeSelect.addEventListener('change', function () {
            const defaultPorts = {
                'mysql': '3306',
                'postgresql': '5432',
                'sqlite': '',
                'sqlserver': '1433'
            };
            portInput.value = defaultPorts[this.value] || '3306';
        });
    }
});

// Auto-load tables from first active connection on page load
document.addEventListener('DOMContentLoaded', function () {
    const activeConnection = document.querySelector('.db-connection-item.active');
    if (activeConnection) {
        const connectionId = activeConnection.getAttribute('data-connection-id');
        if (connectionId) {
            console.log('Auto-loading tables from first active connection:', connectionId);
            currentConnectionId = connectionId; // Store globally
            loadTablesFromConnection(connectionId);
        }
    }
});

// ===== DRAGGABLE DB CARDS =====
let activeCard = null;
let offsetX = 0;
let offsetY = 0;

// Make all existing db-cards draggable
function initializeCards() {
    const cards = document.querySelectorAll('.db-card');
    cards.forEach(card => {
        const header = card.firstElementChild;
        if (header) {
            header.style.cursor = 'move';
            header.addEventListener('mousedown', startDrag);
        }
    });
}

function startDrag(e) {
    activeCard = e.target.closest('.db-card');
    if (!activeCard) return;

    const point = clientToWorldPoint(e);
    offsetX = point.x - parseFloat(activeCard.style.left || '0');
    offsetY = point.y - parseFloat(activeCard.style.top || '0');

    activeCard.style.zIndex = 1000;
    activeCard.style.cursor = 'grabbing';

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!activeCard) return;

    const point = clientToWorldPoint(e);

    let newX = point.x - offsetX;
    let newY = point.y - offsetY;

    // Keep within virtual world bounds
    newX = Math.max(0, Math.min(newX, CANVAS_WORLD_WIDTH - activeCard.offsetWidth));
    newY = Math.max(0, Math.min(newY, CANVAS_WORLD_HEIGHT - activeCard.offsetHeight));

    activeCard.style.left = newX + 'px';
    activeCard.style.top = newY + 'px';

    updateRelationLines();
}

function stopDrag() {
    if (activeCard) {
        activeCard.style.cursor = 'auto';
        activeCard.style.zIndex = 10;
    }
    activeCard = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// Global variable to store current active connection ID
let currentConnectionId = null;

// ===== DRAG FROM SIDEBAR TO CANVAS =====
function initializeSidebarDrag() {
    const sidebarItems = document.querySelectorAll('#availableTablesList [draggable="true"]');
    const canvas = document.querySelector('.canvas-area');
    if (!canvas) return;

    sidebarItems.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            const tableName = e.target.getAttribute('data-table');
            e.dataTransfer.setData('text/plain', tableName);
            e.dataTransfer.effectAllowed = 'copy';
        });
    });

    if (!canvas.dataset.dndBound) {
        canvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const tableName = e.dataTransfer.getData('text/plain');
            const point = clientToWorldPoint(e);

            const x = point.x - 110;
            const y = point.y - 50;

            // Check if currentConnectionId is set
            if (!currentConnectionId) {
                console.error('No active connection selected');
                return;
            }

            createTableCard(tableName, x, y, currentConnectionId);
        });

        canvas.dataset.dndBound = '1';
    }
}

// Initialize drag on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeSidebarDrag();
    initializeExportControls();
});

function createTableCard(tableName, x, y, connectionId) {
    const canvasContainer = document.getElementById('canvasContainer');
    if (!canvasContainer) return;

    // Create temporary card with loading state
    const card = document.createElement('div');
    card.className = 'db-card';
    card.setAttribute('data-table', tableName);
    card.style.top = y + 'px';
    card.style.left = x + 'px';
    card.innerHTML = `
        <div class="p-3 bg-slate-700 text-white rounded-t-xl font-bold text-sm flex justify-between items-center">
            <span>${tableName}</span>
            <i class="fas fa-spinner fa-spin text-sm"></i>
        </div>
        <div class="p-2 space-y-1">
            <div class="text-xs text-slate-500 text-center py-2">
                <i class="fas fa-spinner fa-spin mr-2"></i>Loading columns...
            </div>
        </div>
    `;
    canvasContainer.appendChild(card);

    // Fetch columns from API
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    fetch(`/getTableColumns/${connectionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify({ table_name: tableName })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Columns response:', data);

            if (data.success && data.columns) {
                card.remove();
                renderTableCard(tableName, data.columns, x, y);

                // Update relation lines
                updateRelationLines();
            } else {
                // Error fetching columns
                card.innerHTML = `
                    <div class="p-3 bg-red-600 text-white rounded-t-xl font-bold text-sm">
                        <span>${tableName}</span>
                    </div>
                    <div class="p-2">
                        <div class="text-xs text-red-600 text-center py-2">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            ${data.message || 'Failed to load columns'}
                        </div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching columns:', error);
            card.innerHTML = `
                <div class="p-3 bg-red-600 text-white rounded-t-xl font-bold text-sm">
                    <span>${tableName}</span>
                </div>
                <div class="p-2">
                    <div class="text-xs text-red-600 text-center py-2">
                        <i class="fas fa-exclamation-circle mr-2"></i>
                        Network error
                    </div>
                </div>
            `;
        });
}

// ===== CANVAS NAVIGATION (PAN + ZOOM) =====
let isPanning = false;
let startPanX = 0;
let startPanY = 0;
let scrollLeft = 0;
let scrollTop = 0;
const canvas = document.getElementById('canvasViewport') || document.querySelector('.canvas-area');

function clientToWorldPoint(event) {
    const canvasRect = canvas.getBoundingClientRect();
    return {
        x: (event.clientX - canvasRect.left + canvas.scrollLeft) / currentZoom,
        y: (event.clientY - canvasRect.top + canvas.scrollTop) / currentZoom
    };
}

function applyZoom(newZoom, anchorX = null, anchorY = null) {
    const canvasContainer = document.getElementById('canvasContainer');
    const relationSvg = document.getElementById('relation-svg');
    if (!canvas || !canvasContainer || !relationSvg) return;

    const previousZoom = currentZoom;
    currentZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
    if (previousZoom === currentZoom) return;

    const viewportCenterX = anchorX ?? (canvas.clientWidth / 2);
    const viewportCenterY = anchorY ?? (canvas.clientHeight / 2);

    const worldX = (canvas.scrollLeft + viewportCenterX) / previousZoom;
    const worldY = (canvas.scrollTop + viewportCenterY) / previousZoom;

    canvasContainer.style.transform = `scale(${currentZoom})`;
    relationSvg.style.transform = `scale(${currentZoom})`;

    canvas.scrollLeft = (worldX * currentZoom) - viewportCenterX;
    canvas.scrollTop = (worldY * currentZoom) - viewportCenterY;

    updateRelationLines();
}

function setupCanvasViewport() {
    const canvasContainer = document.getElementById('canvasContainer');
    const relationSvg = document.getElementById('relation-svg');
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const panModeBtn = document.getElementById('panModeBtn');

    if (!canvas || !canvasContainer || !relationSvg) return;

    canvasContainer.style.width = `${CANVAS_WORLD_WIDTH}px`;
    canvasContainer.style.height = `${CANVAS_WORLD_HEIGHT}px`;
    canvasContainer.style.transformOrigin = 'top left';

    // Set SVG as absolute overlay for relation lines
    relationSvg.style.position = 'absolute';
    relationSvg.style.top = '0';
    relationSvg.style.left = '0';
    relationSvg.style.width = `${CANVAS_WORLD_WIDTH}px`;
    relationSvg.style.height = `${CANVAS_WORLD_HEIGHT}px`;
    relationSvg.style.pointerEvents = 'none';
    relationSvg.style.zIndex = '5';
    relationSvg.setAttribute('viewBox', `0 0 ${CANVAS_WORLD_WIDTH} ${CANVAS_WORLD_HEIGHT}`);
    relationSvg.style.transformOrigin = 'top left';

    canvas.scrollLeft = Math.max(0, ((CANVAS_WORLD_WIDTH * currentZoom) - canvas.clientWidth) / 2);
    canvas.scrollTop = Math.max(0, ((CANVAS_WORLD_HEIGHT * currentZoom) - canvas.clientHeight) / 2);

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => applyZoom(currentZoom + 0.1));
    }
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => applyZoom(currentZoom - 0.1));
    }
    if (panModeBtn) {
        panModeBtn.addEventListener('click', () => {
            panModeEnabled = !panModeEnabled;
            panModeBtn.classList.toggle('text-blue-600', panModeEnabled);
            panModeBtn.classList.toggle('bg-blue-50', panModeEnabled);
        });
    }

    canvas.addEventListener('wheel', (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const direction = e.deltaY < 0 ? 0.1 : -0.1;
            applyZoom(currentZoom + direction, e.clientX - canvas.getBoundingClientRect().left, e.clientY - canvas.getBoundingClientRect().top);
        }
    }, { passive: false });

    canvas.addEventListener('mousedown', (e) => {
        const shouldPan = panModeEnabled || e.button === 1 || e.target.classList.contains('canvas-area');
        if (!shouldPan || e.target.closest('.db-card')) return;

        isPanning = true;
        startPanX = e.clientX;
        startPanY = e.clientY;
        scrollLeft = canvas.scrollLeft;
        scrollTop = canvas.scrollTop;
        canvas.style.cursor = 'grabbing';
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isPanning) return;
        const dx = e.clientX - startPanX;
        const dy = e.clientY - startPanY;
        canvas.scrollLeft = scrollLeft - dx;
        canvas.scrollTop = scrollTop - dy;
        updateRelationLines();
    });

    canvas.addEventListener('mouseup', () => {
        isPanning = false;
        canvas.style.cursor = panModeEnabled ? 'grab' : 'default';
    });

    // Update relation lines when canvas is scrolled
    canvas.addEventListener('scroll', () => {
        updateRelationLines();
    }, { passive: true });

    canvas.addEventListener('mouseleave', () => {
        isPanning = false;
        canvas.style.cursor = panModeEnabled ? 'grab' : 'default';
    });
}

// ===== RELATION LINES =====
function updateRelationLines() {
    console.log('updateRelationLines START - relations:', relations.length);

    const svg = document.getElementById('relation-svg');
    console.log('SVG element:', !!svg);

    if (!svg || relations.length === 0) {
        console.log('Early return - svg:', !!svg, 'relations:', relations.length);
        return;
    }

    // Clear existing lines
    svg.innerHTML = '';

    let drawnCount = 0;
    const canvasContainer = document.getElementById('canvasContainer');
    if (!canvasContainer) return;

    relations.forEach(rel => {
        console.log(`Processing relation: ${rel.from} -> ${rel.to}`);

        // Find cards ONLY inside canvasContainer to avoid matching sidebar items
        const fromCard = canvasContainer.querySelector(`[data-table="${rel.from}"]`);
        const toCard = canvasContainer.querySelector(`[data-table="${rel.to}"]`);

        if (!fromCard || !toCard) {
            console.log(`Skipping - cards not found`);
            return;
        }

        // Get card positions from style attributes
        const fromCardX = parseFloat(fromCard.style.left) || 0;
        const fromCardY = parseFloat(fromCard.style.top) || 0;
        const toCardX = parseFloat(toCard.style.left) || 0;
        const toCardY = parseFloat(toCard.style.top) || 0;

        // Card width is hardcoded in CSS (220px)
        const cardWidth = 220;

        // Get height or use a reasonable default
        const fromCardHeight = fromCard.offsetHeight || 150;
        const toCardHeight = toCard.offsetHeight || 150;

        console.log(`Card from pos=(${fromCardX}, ${fromCardY}), height=${fromCardHeight}`);
        console.log(`Card to pos=(${toCardX}, ${toCardY}), height=${toCardHeight}`);

        // Connect from right side of from-card to left side of to-card
        // Using middle Y coordinate
        const fromCenterX = fromCardX + cardWidth;
        const fromCenterY = fromCardY + fromCardHeight / 2;
        const toCenterX = toCardX;
        const toCenterY = toCardY + toCardHeight / 2;

        console.log(`Connecting from (${fromCenterX}, ${fromCenterY}) to (${toCenterX}, ${toCenterY})`);

        // Create curved bezier path
        const controlX = (fromCenterX + toCenterX) / 2;
        const controlY = (fromCenterY + toCenterY) / 2;
        const pathData = `M ${fromCenterX} ${fromCenterY} Q ${controlX} ${controlY}, ${toCenterX} ${toCenterY}`;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', '#ef4444');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);

        drawnCount++;

        // Calculate arrow direction from bezier tangent
        const tangentX = toCenterX - controlX;
        const tangentY = toCenterY - controlY;
        const tangentLength = Math.sqrt(tangentX * tangentX + tangentY * tangentY);

        // Normalize direction
        const dirX = tangentLength > 0 ? tangentX / tangentLength : 1;
        const dirY = tangentLength > 0 ? tangentY / tangentLength : 0;

        // Arrow dimensions
        const arrowLength = 12;
        const arrowWidth = 8;

        // Arrow base point
        const baseX = toCenterX - dirX * arrowLength;
        const baseY = toCenterY - dirY * arrowLength;

        // Perpendicular direction
        const perpX = -dirY;
        const perpY = dirX;

        // Arrow wing points
        const arrowX1 = baseX + perpX * arrowWidth;
        const arrowY1 = baseY + perpY * arrowWidth;
        const arrowX2 = baseX - perpX * arrowWidth;
        const arrowY2 = baseY - perpY * arrowWidth;

        // Draw arrow head
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrow.setAttribute('points', `${toCenterX},${toCenterY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`);
        arrow.setAttribute('fill', '#ef4444');
        svg.appendChild(arrow);
    });

    console.log('updateRelationLines END - drawn:', drawnCount, 'total svg children:', svg.children.length);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    setupCanvasViewport();
    initializeCards();
    updateRelationLines();
});

// Update lines on window resize
window.addEventListener('resize', updateRelationLines);
