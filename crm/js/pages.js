/* ═══════════════════════════════════════════════════════════════
   pages.js — Ventas, Clientes, Reportes, Facturas, Usuarios,
              Configuración
   Depende de: admin.js (allProducts, allCategories, showToast,
               escHtml, openSidebar, closeSidebar, etc.)
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════
   ESTADO GLOBAL NUEVAS ENTIDADES
═══════════════════════════════════════════ */
let allSales    = [];
let allClients  = [];
let allInvoices = [];
let allUsers    = [];
let currentEditingSale   = null;
let currentEditingClient = null;
let currentEditingUser   = null;

/* ═══════════════════════════════════════════
   PERSISTENCIA
═══════════════════════════════════════════ */
function loadSales()    { const s = localStorage.getItem('rosesSales');    allSales    = s ? JSON.parse(s) : demoSales(); saveSales(); }
function saveSales()    { localStorage.setItem('rosesSales',    JSON.stringify(allSales));    }
function loadClients()  { const s = localStorage.getItem('rosesClients');  allClients  = s ? JSON.parse(s) : demoClients(); saveClients(); }
function saveClients()  { localStorage.setItem('rosesClients',  JSON.stringify(allClients));  }
function loadInvoices() { const s = localStorage.getItem('rosesInvoices'); allInvoices = s ? JSON.parse(s) : demoInvoices(); saveInvoices(); }
function saveInvoices() { localStorage.setItem('rosesInvoices', JSON.stringify(allInvoices)); }
function loadUsers()    { const s = localStorage.getItem('rosesUsers');    allUsers    = s ? JSON.parse(s) : demoUsers(); saveUsers(); }
function saveUsers()    { localStorage.setItem('rosesUsers',    JSON.stringify(allUsers));    }

/* Inyectar productos demo en TODOS los dispositivos.
   Detecta por NOMBRE para funcionar aunque el localStorage
   ya tenga datos con otros IDs en ese dispositivo. */
function ensureDemoProducts() {
  // IDs seguros que no choquen con los existentes
  const maxId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id || 0)) : 0;

  const DEMO = [
  {
    id: 1,
    name: 'Aceite Extra Virgen de Ajonjolí',
    category: 'aceites',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop',
    description: 'Aceite premium prensado en frío. Ideal para cocinar y rituales de cuidado capilar.',
    presentations: [
      { name: '120ml', price: 30.00 },
      { name: '500ml', price: 54.00 },
      { name: '1L', price: 105.00 }
    ],
    stock: 45,
    bestSelling: true,
    dateAdded: '2025-01-15'
  },
  {
    id: 2,
    name: 'Jabón Natural de Aloe Vera',
    category: 'jabones',
    image: 'https://tse2.mm.bing.net/th/id/OIP.o0rIDwAcAp3EmFQvffrX4QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'Regenerador e hidratante. Suave para piel sensible.',
    presentations: [{ name: 'Unidad', price: 18.00 }],
    stock: 32,
    bestSelling: false,
    dateAdded: '2025-01-20'
  },
  {
    id: 3,
    name: 'Jabón Natural de Arroz',
    category: 'jabones',
    image: 'https://media.redfarma.es/product/jabon-natural-premium-arroz-100g-800x800.jpg',
    description: 'Aclarante natural. Ilumina y rejuvenece la piel.',
    presentations: [{ name: 'Unidad', price: 18.00 }],
    stock: 28,
    bestSelling: true,
    dateAdded: '2025-02-01'
  },
  {
    id: 4,
    name: 'Jabón Natural de Anís',
    category: 'jabones',
    image: 'https://tse1.explicit.bing.net/th/id/OIP.vr4FcGcXI-TkKKOHu3hHTwHaIa?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'Purificante y refrescante. Aroma natural agradable.',
    presentations: [{ name: 'Unidad', price: 18.00 }],
    stock: 50,
    bestSelling: false,
    dateAdded: '2025-01-10'
  },
  {
    id: 5,
    name: 'Aceite de Rosa Mosqueta',
    category: 'aceites',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80',
    description: 'Aceite natural de rosa mosqueta, ideal para regenerar la piel y reducir cicatrices.',
    presentations: [{ name: '30ml', price: 28 }, { name: '60ml', price: 48 }],
    stock: 42,
    bestSelling: true,
    dateAdded: '2026-01-01'
  },
  {
    id: 6,
    name: 'Jabón de Cacao Artesanal',
    category: 'jabones',
    image: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80',
    description: 'Jabón artesanal con manteca de cacao. Hidrata y suaviza la piel profundamente.',
    presentations: [{ name: '100g', price: 15 }, { name: '200g', price: 25 }],
    stock: 38,
    bestSelling: false,
    dateAdded: '2026-01-05'
  },
  {
    id: 7,
    name: 'Colágeno Marino Premium',
    category: 'colageno',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80',
    description: 'Colágeno marino de alta absorción para piel firme y articulaciones saludables.',
    presentations: [{ name: '150g', price: 65 }, { name: '300g', price: 115 }],
    stock: 27,
    bestSelling: true,
    dateAdded: '2026-01-08'
  }
];

  DEMO.forEach(demo => {
    if (!allProducts.some(p => p.name === demo.name)) allProducts.push(demo);
  });
  saveProducts();
}

/* ═══════════════════════════════════════════
   DATOS DEMO
═══════════════════════════════════════════ */
function demoClients() {
  return [
    { id:1, name:'Ana López',    dni:'45231890', email:'ana@gmail.com',   phone:'+51 987654321', address:'Av. Lima 123', status:'activo',   notes:'Cliente frecuente',  dateAdded:'2026-01-10' },
    { id:2, name:'María Pérez',  dni:'38765432', email:'maria@gmail.com', phone:'+51 956789012', address:'Jr. Tacna 45', status:'activo',   notes:'',                   dateAdded:'2026-01-15' },
    { id:3, name:'Luis Torres',  dni:'29871234', email:'luis@gmail.com',  phone:'+51 923456789', address:'Calle Real 7', status:'inactivo', notes:'No responde llamadas',dateAdded:'2026-01-20' },
  ];
}

function demoSales() {
  return [
    { id:1, invoice:'INV-001', clientId:1, clientName:'Ana López',   date:'2026-02-10', items:[{name:'Aceite Rosa',qty:2,price:45},{name:'Jabón Cacao',qty:1,price:18}], total:108, status:'pagado',    notes:'' },
    { id:2, invoice:'INV-002', clientId:2, clientName:'María Pérez', date:'2026-02-09', items:[{name:'Colágeno',qty:3,price:35}],                                         total:105, status:'pagado',    notes:'' },
    { id:3, invoice:'INV-003', clientId:3, clientName:'Luis Torres', date:'2026-02-08', items:[{name:'Jabón Cacao',qty:2,price:18}],                                     total:36,  status:'pendiente', notes:'Pago a fin de mes' },
  ];
}

function demoInvoices() {
  return allSales.map((s, i) => ({
    id: i + 1,
    number: s.invoice,
    clientId: s.clientId,
    clientName: s.clientName,
    issueDate: s.date,
    dueDate: addDays(s.date, 30),
    subtotal: +(s.total / 1.18).toFixed(2),
    igv: +(s.total - s.total / 1.18).toFixed(2),
    total: s.total,
    status: s.status === 'pagado' ? 'pagada' : s.status === 'pendiente' ? 'emitida' : 'anulada',
  }));
}

function demoUsers() {
  return [
    { id:1, name:'Rosa Linda',    username:'rosal',    email:'rosa@roses.pe',   role:'administrador', status:'activo',   dateAdded:'2026-01-01' },
    { id:2, name:'Carlos Ruiz',   username:'carlosr',  email:'carlos@roses.pe', role:'vendedor',      status:'activo',   dateAdded:'2026-01-10' },
    { id:3, name:'Elena Vargas',  username:'elenav',   email:'elena@roses.pe',  role:'almacen',       status:'inactivo', dateAdded:'2026-01-15' },
  ];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/* ═══════════════════════════════════════════
   DASHBOARD — actualizar stats completos
═══════════════════════════════════════════ */
function updateDashboard() {
  // Contadores
  const el = id => document.getElementById(id);
  if (el('dashProductCount'))  el('dashProductCount').textContent  = (typeof allProducts !== 'undefined' ? allProducts.length : 0);
  if (el('dashClientsCount'))  el('dashClientsCount').textContent  = allClients.length;
  if (el('dashSalesCount'))    el('dashSalesCount').textContent    = allSales.length;

  const totalIncome = allSales.filter(s => s.status === 'pagado').reduce((a,s) => a + (s.total||0), 0);
  if (el('dashIncome')) el('dashIncome').textContent = `S/ ${totalIncome.toFixed(2)}`;

  // Ventas recientes
  const recentEl = el('dashRecentSales');
  if (recentEl) {
    if (allSales.length === 0) {
      recentEl.innerHTML = '<div class="empty-products" style="padding:2rem;"><i class="fas fa-shopping-cart" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.2;"></i><p>Sin ventas aún</p></div>';
    } else {
      recentEl.innerHTML = allSales.slice().reverse().slice(0,5).map(s => `
        <div class="sales-item">
          <div class="sales-info">
            <p class="sales-invoice">${escHtml(s.invoice)}</p>
            <p class="sales-meta">Cliente: ${escHtml(s.clientName)} · ${formatDate(s.date)}</p>
          </div>
          <div class="sales-amount">
            <p class="amount">S/ ${(s.total||0).toFixed(2)}</p>
            <p class="items">${(s.items||[]).length} ítem(s)</p>
          </div>
        </div>`).join('');
    }
  }

  // Top productos (conteo en ventas)
  const topEl = el('dashTopProducts');
  if (topEl) {
    const countMap = {};
    allSales.forEach(s => (s.items||[]).forEach(it => {
      countMap[it.name] = (countMap[it.name]||0) + (it.qty||1);
    }));
    const top = Object.entries(countMap).sort((a,b) => b[1]-a[1]).slice(0,5);
    if (top.length === 0) {
      topEl.innerHTML = '<div class="empty-products" style="padding:2rem;"><i class="fas fa-box" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.2;"></i><p>Sin datos aún</p></div>';
    } else {
      topEl.innerHTML = top.map(([name, qty], i) => `
        <div class="product-item">
          <div class="product-number">${i+1}</div>
          <div class="product-name">${escHtml(name)}</div>
          <div class="product-quantity">${qty} und.</div>
        </div>`).join('');
    }
  }
}

/* ═══════════════════════════════════════════
   VENTAS
═══════════════════════════════════════════ */
function renderSalesTable() {

  const body     = document.getElementById('salesTableBody');
  const mobile   = document.getElementById('salesMobileList');

  const search   = (document.getElementById('searchSales')?.value || '').trim().toLowerCase();
  const statusF  = (document.getElementById('filterSalesStatus')?.value || '').trim();

  let list = allSales;
  
  if (search) {
    list = list.filter(s => 
      (s.invoice || '').toLowerCase().includes(search) ||
      (s.clientName || '').toLowerCase().includes(search)
    );
  }
  
  if (statusF && statusF !== '') {
    list = list.filter(s => s.status === statusF);
  }

  // Counters
  const paid    = allSales.filter(s => s.status === 'pagado').length;
  const pending = allSales.filter(s => s.status === 'pendiente').length;
  const income  = allSales.filter(s => s.status === 'pagado').reduce((a,s) => a + (s.total||0), 0);
  const items   = allSales.reduce((a,s) => a + (s.items||[]).reduce((b,i) => b + (i.qty||1), 0), 0);

  setText('salesCountLabel', `${allSales.length} venta${allSales.length!==1?'s':''} registrada${allSales.length!==1?'s':''}`);
  setText('salesTotalIncome', `S/ ${income.toFixed(2)}`);
  setText('salesTotalItems', items);
  setText('salesPaidCount', paid);
  setText('salesPendingCount', pending);

  const emptyHTML = `<tr class="table-empty"><td colspan="7"><i class="fas fa-shopping-cart"></i>No hay ventas${search||statusF?' que coincidan con el filtro':' aún'}</td></tr>`;
  const emptyMobile = `<div class="mobile-card" style="text-align:center;color:var(--text-light);padding:2rem;"><i class="fas fa-shopping-cart" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.2;"></i>No hay ventas${search||statusF?' que coincidan con el filtro':' aún'}</div>`;

  if (!list.length) {
    if (body)   body.innerHTML   = emptyHTML;
    if (mobile) mobile.innerHTML = emptyMobile;
    return;
  }

  // Tabla desktop
  if (body) body.innerHTML = list.map(s => `
    <tr>
      <td><strong>${escHtml(s.invoice || 'Sin factura')}</strong></td>
      <td>${escHtml(s.clientName || 'Sin cliente')}</td>
      <td>${formatDate(s.date)}</td>
      <td>${(s.items||[]).reduce((a,i) => a+(i.qty||1), 0)} ítem(s)</td>
      <td><strong style="color:var(--primary)">S/ ${(s.total||0).toFixed(2)}</strong></td>
      <td><span class="status-badge status-${s.status}">${capitalizar(s.status || 'desconocido')}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl ver" onclick="viewSaleDetail(${s.id})" title="Ver detalle"><i class="fas fa-eye"></i></button>
          <button class="btn-tbl edit" onclick="editSale(${s.id})" title="Editar"><i class="fas fa-edit"></i></button>
          <button class="btn-tbl delete" onclick="deleteSale(${s.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');

  // Tarjetas móvil
  if (mobile) mobile.innerHTML = list.map(s => `
    <div class="mobile-card">
      <div class="mobile-card-top">
        <div>
          <div class="mobile-card-title">${escHtml(s.invoice || 'Sin factura')}</div>
          <div class="mobile-card-subtitle">${escHtml(s.clientName || 'Sin cliente')}</div>
        </div>
        <span class="status-badge status-${s.status}">${capitalizar(s.status || 'desconocido')}</span>
      </div>
      <div class="mobile-card-row">
        <span>Fecha</span><span>${formatDate(s.date)}</span>
      </div>
      <div class="mobile-card-row">
        <span>Ítems</span><span>${(s.items||[]).reduce((a,i)=>a+(i.qty||1),0)} ítem(s)</span>
      </div>
      <div class="mobile-card-row">
        <span>Total</span><span class="mobile-card-amount">S/ ${(s.total||0).toFixed(2)}</span>
      </div>
      <div class="mobile-card-actions">
        <button class="btn-tbl ver" onclick="viewSaleDetail(${s.id})" title="Ver detalle"><i class="fas fa-eye"></i></button>
        <button class="btn-tbl edit" onclick="editSale(${s.id})" title="Editar"><i class="fas fa-edit"></i></button>
        <button class="btn-tbl delete" onclick="deleteSale(${s.id})" title="Eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>`).join('');
}

function viewSaleDetail(id) {
  const sale = allSales.find(s => s.id === id);
  if (!sale) return;

  const existing = document.getElementById('saleDetailOverlay');
  if (existing) existing.remove();

  const statusColors = {
    pagado:    '#22c55e',
    pendiente: '#f59e0b',
    cancelado: '#ef4444',
  };
  const statusColor = statusColors[sale.status] || '#888';

  const itemsHTML = (sale.items || []).map(it => `
    <tr>
      <td style="padding:0.6rem 0.5rem;border-bottom:1px solid #f0ece6;">
        ${escHtml(it.name)}${it.presentation ? ` <span style="color:#888;font-size:0.8rem;">(${escHtml(it.presentation)})</span>` : ''}
      </td>
      <td style="padding:0.6rem 0.5rem;border-bottom:1px solid #f0ece6;text-align:center;">${it.qty}</td>
      <td style="padding:0.6rem 0.5rem;border-bottom:1px solid #f0ece6;text-align:right;">S/ ${parseFloat(it.price).toFixed(2)}</td>
      <td style="padding:0.6rem 0.5rem;border-bottom:1px solid #f0ece6;text-align:right;font-weight:600;">S/ ${(it.qty * it.price).toFixed(2)}</td>
    </tr>`).join('');

  const settings  = getSettings();
  const igvPct    = parseFloat(settings.igv || 18) / 100;
  const subtotal  = sale.total;
  const igv       = +(subtotal * igvPct).toFixed(2);
  const totalConIgv = +(subtotal + igv).toFixed(2);
  const client    = allClients.find(c => c.id === sale.clientId);

  const overlay = document.createElement('div');
  overlay.id = 'saleDetailOverlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    padding:1rem;overflow-y:auto;
  `;

  overlay.innerHTML = `
    <div style="
      background:#fff;
      width:100%;max-width:520px;
      font-family:'Inter',sans-serif;
      box-shadow:0 24px 64px rgba(0,0,0,0.2);
      position:relative;
    ">
      <!-- Cabecera ticket -->
      <div style="background:linear-gradient(135deg,#3a5a40,#588157);padding:1.75rem 1.75rem 1.25rem;color:#fff;text-align:center;">
        <div style="font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:700;letter-spacing:0.02em;">Roses<span style="color:#c9a96e;">.</span></div>
        <div style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;opacity:0.75;margin-top:0.2rem;">Bienestar Natural</div>
        <div style="margin-top:1rem;font-size:1rem;font-weight:600;letter-spacing:0.05em;">${escHtml(sale.invoice)}</div>
        <div style="font-size:0.8rem;opacity:0.8;margin-top:0.2rem;">${formatDate(sale.date)}</div>
      </div>

      <!-- Línea dentada -->
      <div style="height:12px;background:repeating-linear-gradient(90deg,#fff 0,#fff 8px,transparent 8px,transparent 16px),#f5f0ea;background-size:16px 12px,100% 100%;"></div>

      <!-- Estado -->
      <div style="padding:0.75rem 1.75rem;background:#fafaf8;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #f0ece6;">
        <span style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Estado del pedido</span>
        <span style="
          padding:0.25rem 0.75rem;border-radius:999px;
          font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;
          background:${statusColor}18;color:${statusColor};
        ">${capitalizar(sale.status)}</span>
      </div>

      <!-- Datos cliente -->
      <div style="padding:0.75rem 1.75rem;border-bottom:1px solid #f0ece6;background:#fafaf8;">
        <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:#aaa;margin-bottom:0.5rem;">Cliente</div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:0.6rem;">
            <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#3a5a40,#588157);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;flex-shrink:0;">${escHtml(sale.clientName).charAt(0).toUpperCase()}</div>
            <span style="font-weight:700;font-size:0.9rem;color:#222;">${escHtml(sale.clientName)}</span>
          </div>
          ${client ? `<div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.78rem;color:#666;">
            ${client.dni   ? `<span style="color:#aaa;">DNI</span> <span>${escHtml(client.dni)}</span>` : ''}
            ${client.phone ? `<span>📞 ${escHtml(client.phone)}</span>` : ''}
            ${client.email ? `<span>✉ ${escHtml(client.email)}</span>` : ''}
            ${client.address ? `<span>📍 ${escHtml(client.address)}</span>` : ''}
          </div>` : ''}
        </div>
      </div>

      <!-- Productos -->
      <div style="padding:1rem 1.75rem;border-bottom:1px solid #f0ece6;">
        <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:#888;margin-bottom:0.75rem;">Productos</div>
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
          <thead>
            <tr style="color:#888;font-size:0.75rem;">
              <th style="text-align:left;padding-bottom:0.4rem;font-weight:500;">Producto</th>
              <th style="text-align:center;padding-bottom:0.4rem;font-weight:500;">Cant.</th>
              <th style="text-align:right;padding-bottom:0.4rem;font-weight:500;">P. Unit.</th>
              <th style="text-align:right;padding-bottom:0.4rem;font-weight:500;">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>
      </div>

      <!-- Totales -->
      <div style="padding:1rem 1.75rem;border-bottom:1px solid #f0ece6;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem;">
          <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:#888;">Desglose</span>
          <label style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;color:#555;cursor:pointer;user-select:none;">
            <input type="checkbox" id="toggleIGV"
              onchange="
                const checked = this.checked;
                const sub = ${sale.total||0};
                const rate = ${parseFloat(settings.igv||18)} / 100;
                const igvVal = +(sub * rate).toFixed(2);
                const total = checked ? +(sub + igvVal).toFixed(2) : sub;
                document.getElementById('detail-igv-row').style.display = checked ? 'flex' : 'none';
                document.getElementById('detail-igv').textContent = 'S/ ' + igvVal.toFixed(2);
                document.getElementById('detail-total-val').textContent = 'S/ ' + total.toFixed(2);
              "
              style="width:14px;height:14px;accent-color:#3a5a40;">
            Incluir IGV (${settings.igv || 18}%)
          </label>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#666;margin-bottom:0.4rem;">
          <span>Subtotal (sin IGV)</span><span id="detail-subtotal">S/ ${subtotal.toFixed(2)}</span>
        </div>
        <div id="detail-igv-row" style="display:none;justify-content:space-between;font-size:0.85rem;color:#888;">
          <span>IGV (${settings.igv || 18}%)</span><span id="detail-igv">S/ ${igv.toFixed(2)}</span>
        </div>
      </div>
      <div style="padding:0.9rem 1.75rem;display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #f0ece6;">
        <span style="font-weight:700;font-size:1rem;">TOTAL</span>
        <span id="detail-total-val" style="font-weight:700;font-size:1.25rem;color:#3a5a40;">S/ ${(sale.total||0).toFixed(2)}</span>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.remove(); document.body.style.overflow = ''; }
  });
}

function openSaleModal(title='Nueva Venta') {
  document.getElementById('saleModalTitle').textContent = title;
  // Llenar select de clientes
  const sel = document.getElementById('saleClient');
  sel.innerHTML = '<option value="">-- Seleccionar cliente --</option>';
  allClients.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
  document.getElementById('saleModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeSaleModal() {
  document.getElementById('saleModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  currentEditingSale = null;
}

function newSale() {
  currentEditingSale = null;
  document.getElementById('saleForm').reset();
  const nextId = allSales.length > 0 ? Math.max(...allSales.map(s => s.id)) + 1 : 1;
  const settings = getSettings();
  document.getElementById('saleInvoice').value = `${settings.invPrefix || 'INV-'}${String(nextId).padStart(3,'0')}`;
  document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('saleItemsContainer').innerHTML = '';
  addSaleItem();
  openSaleModal('Nueva Venta');
}

function editSale(id) {
  const sale = allSales.find(s => s.id === id);
  if (!sale) return;
  currentEditingSale = id;
  document.getElementById('saleInvoice').value = sale.invoice;
  document.getElementById('saleDate').value    = sale.date;
  document.getElementById('saleStatus').value  = sale.status;
  document.getElementById('saleNotes').value   = sale.notes || '';
  // Items
  const container = document.getElementById('saleItemsContainer');
  container.innerHTML = '';
  (sale.items || []).forEach(it => addSaleItem(it.name, it.qty, it.price, it.presentation || ''));
  openSaleModal(`Editar: ${sale.invoice}`);
  // Set client after modal opens (select populated in openSaleModal)
  setTimeout(() => {
    document.getElementById('saleClient').value = sale.clientId || '';
  }, 50);
  updateSaleTotal();
}

function deleteSale(id) {
  const sale = allSales.find(s => s.id === id);
  if (!sale) return;

  navigator.clipboard.writeText(sale.invoice).then(() => {
    showToast(`"${sale.invoice}" copiado`, 'info');
  });

  showConfirm(`¿Eliminar venta <strong>${escHtml(sale.invoice)}</strong>?`, () => {
    allSales = allSales.filter(s => s.id !== id);
    saveSales();
    renderSalesTable();
    updateDashboard();
    showToast('Venta eliminada');
  });
}
function addSaleItem(name='', qty=1, price=0, presentation='') {
  const c = document.getElementById('saleItemsContainer');
  const div = document.createElement('div');
  div.style.cssText = 'display:grid;grid-template-columns:1fr 80px 70px 90px 32px;gap:0.5rem;align-items:end;padding:0.6rem 0.75rem;background:#f7fafc;border-radius:10px;border:1px solid rgba(0,0,0,0.06);margin-bottom:0.5rem;';
  div.className = 'presentation-item';
  div.innerHTML = `
    <div>
      <div style="font-size:0.72rem;font-weight:600;color:#888;margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.05em;">Producto</div>
      <input type="text" class="sale-item-name" value="${escHtml(String(name))}" placeholder="Nombre del producto" required
        style="width:100%;padding:0.5rem 0.65rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;font-family:inherit;outline:none;color:#2d3748;background:white;transition:border-color 0.2s;"
        onfocus="this.style.borderColor='#588157'" onblur="this.style.borderColor='#e2e8f0'">
    </div>
    <div>
      <div style="font-size:0.72rem;font-weight:600;color:#888;margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.05em;">Present.</div>
      <input type="text" class="sale-item-presentation" value="${escHtml(String(presentation||''))}" placeholder="30ml…"
        style="width:100%;padding:0.5rem 0.65rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;font-family:inherit;outline:none;color:#2d3748;background:white;transition:border-color 0.2s;"
        onfocus="this.style.borderColor='#588157'" onblur="this.style.borderColor='#e2e8f0'">
    </div>
    <div>
      <div style="font-size:0.72rem;font-weight:600;color:#888;margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.05em;">Cant.</div>
      <input type="number" class="sale-item-qty" value="${qty}" min="1" step="1" oninput="updateSaleTotal()"
        style="width:100%;padding:0.5rem 0.5rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;font-family:inherit;outline:none;color:#2d3748;background:white;transition:border-color 0.2s;"
        onfocus="this.style.borderColor='#588157'" onblur="this.style.borderColor='#e2e8f0'">
    </div>
    <div>
      <div style="font-size:0.72rem;font-weight:600;color:#888;margin-bottom:0.3rem;text-transform:uppercase;letter-spacing:0.05em;">Precio</div>
      <input type="number" class="sale-item-price" value="${price}" min="0" step="0.01" oninput="updateSaleTotal()"
        style="width:100%;padding:0.5rem 0.5rem;border:1.5px solid #e2e8f0;border-radius:8px;font-size:0.85rem;font-family:inherit;outline:none;color:#2d3748;background:white;transition:border-color 0.2s;"
        onfocus="this.style.borderColor='#588157'" onblur="this.style.borderColor='#e2e8f0'">
    </div>
    <button type="button" onclick="this.closest('.presentation-item').remove();updateSaleTotal();"
      style="height:34px;width:32px;border:none;border-radius:8px;background:rgba(229,62,62,0.08);color:#e53e3e;cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;margin-bottom:1px;"
      onmouseover="this.style.background='#e53e3e';this.style.color='white'"
      onmouseout="this.style.background='rgba(229,62,62,0.08)';this.style.color='#e53e3e'">×</button>`;
  c.appendChild(div);
  updateSaleTotal();
}

function updateSaleTotal() {
  let total = 0;
  document.querySelectorAll('#saleItemsContainer .presentation-item').forEach(row => {
    const qty   = parseFloat(row.querySelector('.sale-item-qty')?.value) || 0;
    const price = parseFloat(row.querySelector('.sale-item-price')?.value) || 0;
    total += qty * price;
  });
  const el = document.getElementById('saleTotalDisplay');
  if (el) el.textContent = `S/ ${total.toFixed(2)}`;
}

function saveSaleForm(e) {
  e.preventDefault();
  const clientId = parseInt(document.getElementById('saleClient').value);
  const client   = allClients.find(c => c.id === clientId);
  const items = [];
  let totalCalc = 0;
  document.querySelectorAll('#saleItemsContainer .presentation-item').forEach(row => {
    const name  = row.querySelector('.sale-item-name')?.value.trim();
    const qty   = parseFloat(row.querySelector('.sale-item-qty')?.value) || 0;
    const price = parseFloat(row.querySelector('.sale-item-price')?.value) || 0;
    const pres  = row.querySelector('.sale-item-presentation')?.value.trim() || '';
    if (name && qty > 0) { items.push({name, presentation: pres, qty, price}); totalCalc += qty * price; }
  });
  if (items.length === 0) { showToast('Agrega al menos un producto', true); return; }
  if (!clientId) { showToast('Selecciona un cliente', true); return; }

  const data = {
    id:         currentEditingSale || (allSales.length > 0 ? Math.max(...allSales.map(s=>s.id))+1 : 1),
    invoice:    document.getElementById('saleInvoice').value,
    clientId,
    clientName: client ? client.name : '',
    date:       document.getElementById('saleDate').value,
    status:     document.getElementById('saleStatus').value,
    notes:      document.getElementById('saleNotes').value.trim(),
    items,
    total: totalCalc,
  };

  if (currentEditingSale) {
    const idx = allSales.findIndex(s => s.id === currentEditingSale);
    if (idx !== -1) allSales[idx] = data;
  } else {
    allSales.push(data);
  }
  saveSales();
  renderSalesTable();
  updateDashboard();
  closeSaleModal();
  showToast(currentEditingSale ? 'Venta actualizada ✓' : 'Venta registrada ✓');
}

/* ═══════════════════════════════════════════
   CLIENTES
═══════════════════════════════════════════ */
function renderClientsGrid() {
  const grid    = document.getElementById('clientsGrid');
  const search  = (document.getElementById('searchClients')?.value || '').toLowerCase();
  const statusF = document.getElementById('filterClientsStatus')?.value || '';

  let list = allClients;
  if (search)  list = list.filter(c =>
    c.name.toLowerCase().includes(search) ||
    (c.email||'').toLowerCase().includes(search) ||
    (c.phone||'').includes(search));
  if (statusF) list = list.filter(c => c.status === statusF);

  setText('clientsCountLabel', `${allClients.length} cliente${allClients.length!==1?'s':''} registrado${allClients.length!==1?'s':''}`);

  if (!grid) return;
  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-products" style="grid-column:1/-1;">
      <i class="fas fa-users"></i>
      <h3>${allClients.length===0 ? 'Sin clientes aún' : 'Sin resultados'}</h3>
      <p>${allClients.length===0 ? 'Agrega tu primer cliente.' : 'Intenta con otro filtro.'}</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(c => {
    const purchasesCount = allSales.filter(s => s.clientId === c.id).length;
    return `
    <div class="client-card">
      <div class="client-avatar-big">${c.name.charAt(0).toUpperCase()}</div>
      <div class="client-card-name">${escHtml(c.name)}</div>
      <div class="client-card-dni">${c.dni ? 'DNI: ' + escHtml(c.dni) : 'Sin DNI'}</div>
      <div class="client-card-info">
        ${c.email    ? `<div class="client-card-info-item"><i class="fas fa-envelope"></i>${escHtml(c.email)}</div>` : ''}
        ${c.phone    ? `<div class="client-card-info-item"><i class="fas fa-phone"></i>${escHtml(c.phone)}</div>` : ''}
        ${c.address  ? `<div class="client-card-info-item"><i class="fas fa-map-marker-alt"></i>${escHtml(c.address)}</div>` : ''}
        ${c.notes    ? `<div class="client-card-info-item"><i class="fas fa-sticky-note"></i>${escHtml(c.notes)}</div>` : ''}
      </div>
      <div class="client-card-footer">
        <div>
          <span class="status-badge status-${c.status}">${capitalizar(c.status)}</span>
          <div class="client-purchases" style="margin-top:0.35rem;"><strong>${purchasesCount}</strong> compra${purchasesCount!==1?'s':''}</div>
        </div>
        <div class="client-card-actions">
          <button class="btn-client-action edit" onclick="editClient(${c.id})"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-client-action delete" onclick="deleteClient(${c.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openClientModal(title='Nuevo Cliente') {
  document.getElementById('clientModalTitle').textContent = title;
  document.getElementById('clientModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeClientModal() {
  document.getElementById('clientModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  currentEditingClient = null;
}

function newClient() {
  currentEditingClient = null;
  document.getElementById('clientForm').reset();
  openClientModal('Nuevo Cliente');
}

function editClient(id) {
  const client = allClients.find(c => c.id === id);
  if (!client) return;
  currentEditingClient = id;
  document.getElementById('clientName').value    = client.name;
  document.getElementById('clientDNI').value     = client.dni || '';
  document.getElementById('clientEmail').value   = client.email || '';
  document.getElementById('clientPhone').value   = client.phone || '';
  document.getElementById('clientAddress').value = client.address || '';
  document.getElementById('clientStatus').value  = client.status || 'activo';
  document.getElementById('clientNotes').value   = client.notes || '';
  openClientModal(`Editar: ${client.name}`);
}

function deleteClient(id) {
  const client = allClients.find(c => c.id === id);
  if (!client) return;
  if (!confirm(`¿Eliminar cliente "${client.name}"?`)) return;
  allClients = allClients.filter(c => c.id !== id);
  saveClients();
  renderClientsGrid();
  updateDashboard();
  showToast('Cliente eliminado');
}

function saveClientForm(e) {
  e.preventDefault();
  const data = {
    id:        currentEditingClient || (allClients.length > 0 ? Math.max(...allClients.map(c=>c.id))+1 : 1),
    name:      document.getElementById('clientName').value.trim(),
    dni:       document.getElementById('clientDNI').value.trim(),
    email:     document.getElementById('clientEmail').value.trim(),
    phone:     document.getElementById('clientPhone').value.trim(),
    address:   document.getElementById('clientAddress').value.trim(),
    status:    document.getElementById('clientStatus').value,
    notes:     document.getElementById('clientNotes').value.trim(),
    dateAdded: currentEditingClient
      ? allClients.find(c => c.id === currentEditingClient)?.dateAdded
      : new Date().toISOString().split('T')[0],
  };
  if (currentEditingClient) {
    const idx = allClients.findIndex(c => c.id === currentEditingClient);
    if (idx !== -1) allClients[idx] = data;
  } else {
    allClients.push(data);
  }
  saveClients();
  renderClientsGrid();
  updateDashboard();
  closeClientModal();
  showToast(currentEditingClient ? 'Cliente actualizado ✓' : 'Cliente guardado ✓');
}

/* ═══════════════════════════════════════════
   REPORTES
═══════════════════════════════════════════ */
function renderReports() {
  renderIncomeChart();
  renderCategoryReport();
  renderTopClientsReport();
  renderLowStockReport();
}

function renderIncomeChart() {
  const container = document.getElementById('incomeChart');
  if (!container) return;

  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ key: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, label: d.toLocaleString('es-PE',{month:'short'}) });
  }

  const incomeByMonth = {};
  allSales.filter(s => s.status === 'pagado').forEach(s => {
    const key = s.date?.substring(0,7);
    if (key) incomeByMonth[key] = (incomeByMonth[key] || 0) + (s.total || 0);
  });

  const values = months.map(m => incomeByMonth[m.key] || 0);
  const maxVal = Math.max(...values, 1);

  container.innerHTML = months.map((m, i) => {
    const h = Math.max(4, Math.round((values[i] / maxVal) * 160));
    return `
      <div class="chart-bar-group">
        <div class="chart-bar" style="height:${h}px;">
          <div class="chart-bar-tooltip">S/ ${values[i].toFixed(2)}</div>
        </div>
        <div class="chart-bar-label">${m.label}</div>
        <div class="chart-bar-value">S/${values[i]>0?values[i].toFixed(0):'0'}</div>
      </div>`;
  }).join('');
}

function renderCategoryReport() {
  const el = document.getElementById('categoryReport');
  if (!el) return;
  if (typeof allProducts !== 'undefined') {
    const catMap = {};
    allSales.forEach(s => (s.items||[]).forEach(it => {
      const prod = allProducts.find(p => p.name.toLowerCase() === (it.name||'').toLowerCase());
      const cat  = prod ? (getCatLabel ? getCatLabel(prod.category) : prod.category) : 'Otros';
      catMap[cat] = (catMap[cat]||0) + (it.qty||1) * (it.price||0);
    }));
    const entries = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
    if (entries.length === 0) { el.innerHTML = '<div class="report-empty">Sin datos de ventas</div>'; return; }
    el.innerHTML = entries.map(([cat,total],i) => `
      <div class="report-list-item">
        <div class="report-rank">${i+1}</div>
        <div class="report-item-info">
          <div class="report-item-name">${escHtml(cat)}</div>
          <div class="report-item-sub">Categoría</div>
        </div>
        <div class="report-item-value">S/ ${total.toFixed(2)}</div>
      </div>`).join('');
  } else {
    el.innerHTML = '<div class="report-empty">Sin datos suficientes</div>';
  }
}

function renderTopClientsReport() {
  const el = document.getElementById('topClientsReport');
  if (!el) return;
  const clientTotals = {};
  allSales.filter(s => s.status === 'pagado').forEach(s => {
    clientTotals[s.clientName] = (clientTotals[s.clientName]||0) + (s.total||0);
  });
  const entries = Object.entries(clientTotals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  if (entries.length === 0) { el.innerHTML = '<div class="report-empty">Sin datos de ventas</div>'; return; }
  el.innerHTML = entries.map(([name,total],i) => `
    <div class="report-list-item">
      <div class="report-rank">${i+1}</div>
      <div class="report-item-info">
        <div class="report-item-name">${escHtml(name)}</div>
        <div class="report-item-sub">Cliente</div>
      </div>
      <div class="report-item-value">S/ ${total.toFixed(2)}</div>
    </div>`).join('');
}

function renderLowStockReport() {
  const el = document.getElementById('lowStockReport');
  if (!el) return;
  if (typeof allProducts === 'undefined') { el.innerHTML = '<div class="report-empty">Sin datos de productos</div>'; return; }
  const low = allProducts.filter(p => p.stock < 10).sort((a,b) => a.stock - b.stock);
  if (low.length === 0) { el.innerHTML = '<div class="report-empty" style="color:var(--primary)"><i class="fas fa-check-circle" style="margin-right:0.5rem;"></i>Todos los stocks están bien</div>'; return; }
  el.innerHTML = low.map((p,i) => `
    <div class="report-list-item">
      <div class="report-rank warn">${p.stock}</div>
      <div class="report-item-info">
        <div class="report-item-name">${escHtml(p.name)}</div>
        <div class="report-item-sub">${p.stock === 0 ? '⚠ Sin stock' : 'Stock bajo'}</div>
      </div>
      <div class="report-item-value" style="color:#e53e3e;">${p.stock} und.</div>
    </div>`).join('');
}

/* ═══════════════════════════════════════════
   FACTURAS
═══════════════════════════════════════════ */
function renderInvoicesTable() {
  const body    = document.getElementById('invoicesTableBody');
  const mobile  = document.getElementById('invoicesMobileList');
  const search  = (document.getElementById('searchInvoices')?.value || '').toLowerCase();
  const statusF = document.getElementById('filterInvoiceStatus')?.value || '';

  let list = allInvoices;
  if (search)  list = list.filter(i => i.number.toLowerCase().includes(search) || i.clientName.toLowerCase().includes(search));
  if (statusF) list = list.filter(i => i.status === statusF);

  setText('invoicesCountLabel', `${allInvoices.length} factura${allInvoices.length!==1?'s':''} emitida${allInvoices.length!==1?'s':''}`);

  const emptyHTML   = `<tr class="table-empty"><td colspan="9"><i class="fas fa-file-invoice"></i>No hay facturas${search||statusF?' con ese filtro':' aún'}</td></tr>`;
  const emptyMobile = `<div class="mobile-card" style="text-align:center;color:var(--text-light);padding:2rem;"><i class="fas fa-file-invoice" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.2;"></i>No hay facturas${search||statusF?' con ese filtro':' aún'}</div>`;

  if (!list.length) {
    if (body)   body.innerHTML   = emptyHTML;
    if (mobile) mobile.innerHTML = emptyMobile;
    return;
  }

  if (body) body.innerHTML = list.map(inv => `
    <tr>
      <td><strong>${escHtml(inv.number)}</strong></td>
      <td>${escHtml(inv.clientName)}</td>
      <td>${formatDate(inv.issueDate)}</td>
      <td>${formatDate(inv.dueDate)}</td>
      <td>S/ ${(inv.subtotal||0).toFixed(2)}</td>
      <td>S/ ${(inv.igv||0).toFixed(2)}</td>
      <td><strong style="color:var(--primary)">S/ ${(inv.total||0).toFixed(2)}</strong></td>
      <td><span class="status-badge status-${inv.status}">${capitalizar(inv.status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-tbl ver" onclick="showToast('Vista previa próximamente')"><i class="fas fa-eye"></i></button>
          <button class="btn-tbl print" onclick="showToast('Impresión próximamente aun en desarrollo')"><i class="fas fa-print"></i></button>
          <button class="btn-tbl delete" onclick="deleteInvoice(${inv.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('');

  if (mobile) mobile.innerHTML = list.map(inv => `
    <div class="mobile-card">
      <div class="mobile-card-top">
        <div>
          <div class="mobile-card-title">${escHtml(inv.number)}</div>
          <div class="mobile-card-subtitle">${escHtml(inv.clientName)}</div>
        </div>
        <span class="status-badge status-${inv.status}">${capitalizar(inv.status)}</span>
      </div>
      <div class="mobile-card-row">
        <span>Emisión</span><span>${formatDate(inv.issueDate)}</span>
      </div>
      <div class="mobile-card-row">
        <span>Vencimiento</span><span>${formatDate(inv.dueDate)}</span>
      </div>
      <div class="mobile-card-row">
        <span>Subtotal</span><span>S/ ${(inv.subtotal||0).toFixed(2)}</span>
      </div>
      <div class="mobile-card-row">
        <span>IGV</span><span>S/ ${(inv.igv||0).toFixed(2)}</span>
      </div>
      <div class="mobile-card-row">
        <span>Total</span><span class="mobile-card-amount">S/ ${(inv.total||0).toFixed(2)}</span>
      </div>
      <div class="mobile-card-actions">
        <button class="btn-tbl ver" onclick="showToast('Vista previa próximamente')"><i class="fas fa-eye"></i></button>
        <button class="btn-tbl print" onclick="showToast('Impresión próximamente aun en desarrollo')"><i class="fas fa-print"></i></button>
        <button class="btn-tbl delete" onclick="deleteInvoice(${inv.id})"><i class="fas fa-trash"></i> Eliminar</button>
      </div>
    </div>`).join('');
}

function deleteInvoice(id) {
  if (!confirm('¿Eliminar esta factura?')) return;
  allInvoices = allInvoices.filter(i => i.id !== id);
  saveInvoices();
  renderInvoicesTable();
  showToast('Factura eliminada');
}

function newInvoice() {
  const existing = document.getElementById('invoiceModalOverlay');
  if (existing) existing.remove();

  const settings  = getSettings();
  const nextId    = allInvoices.length > 0 ? Math.max(...allInvoices.map(i => i.id)) + 1 : 1;
  const prefix    = settings.invPrefix || 'INV-';
  const today     = new Date().toISOString().split('T')[0];
  const dueDate   = addDays(today, parseInt(settings.dueDays || 30));

  const clientOptions = allClients.map(c =>
    `<option value="${c.id}" data-name="${escHtml(c.name)}">${escHtml(c.name)}</option>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.id = 'invoiceModalOverlay';
  overlay.className = 'product-modal-overlay active';
  overlay.innerHTML = `
    <div class="product-modal" style="max-width:640px;">
      <div class="product-modal-header" style="background:linear-gradient(135deg,#6b4e31,#8b6343);">
        <h2>Nueva Factura</h2>
        <button class="modal-close" onclick="document.getElementById('invoiceModalOverlay').remove();document.body.style.overflow='';">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="product-modal-body">
        <form id="invoiceForm">
          <div class="form-row" style="margin-bottom:1.2rem;">
            <div class="form-group">
              <label>N° Factura</label>
              <input type="text" id="invNumber" value="${prefix}${String(nextId).padStart(3,'0')}" required>
            </div>
            <div class="form-group">
              <label>Cliente *</label>
              <select id="invClient" required>
                <option value="">-- Seleccionar --</option>
                ${clientOptions}
              </select>
            </div>
          </div>
          <div class="form-row" style="margin-bottom:1.2rem;">
            <div class="form-group">
              <label>Fecha de emisión *</label>
              <input type="date" id="invIssueDate" value="${today}" required>
            </div>
            <div class="form-group">
              <label>Fecha de vencimiento *</label>
              <input type="date" id="invDueDate" value="${dueDate}" required>
            </div>
          </div>
          <div class="form-row" style="margin-bottom:1.2rem;">
            <div class="form-group">
              <label>Subtotal (S/.) *</label>
              <input type="number" id="invSubtotal" min="0" step="0.01" placeholder="0.00" required oninput="recalcInvoice()">
            </div>
            <div class="form-group">
              <label>IGV (${settings.igv || 18}%)</label>
              <input type="number" id="invIgv" readonly style="background:#f7fafc;" placeholder="0.00">
            </div>
          </div>
          <div class="form-row" style="margin-bottom:1.2rem;">
            <div class="form-group">
              <label>Total (S/.)</label>
              <input type="number" id="invTotal" readonly style="background:#f7fafc;font-weight:700;color:var(--primary);" placeholder="0.00">
            </div>
            <div class="form-group">
              <label>Estado *</label>
              <select id="invStatus" required>
                <option value="emitida">Emitida</option>
                <option value="pagada">Pagada</option>
                <option value="vencida">Vencida</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary"
              onclick="document.getElementById('invoiceModalOverlay').remove();document.body.style.overflow='';">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" style="background:linear-gradient(135deg,#6b4e31,#8b6343);">
              <i class="fas fa-save"></i> Guardar Factura
            </button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  overlay.addEventListener('click', e => {
    if (e.target === overlay) { overlay.remove(); document.body.style.overflow = ''; }
  });

  overlay.querySelector('#invoiceForm').addEventListener('submit', e => {
    e.preventDefault();
    const clientEl = overlay.querySelector('#invClient');
    const clientId   = parseInt(clientEl.value);
    const clientName = clientEl.options[clientEl.selectedIndex]?.dataset.name || '';
    const subtotal   = parseFloat(overlay.querySelector('#invSubtotal').value) || 0;
    const igvPct     = parseFloat(settings.igv || 18) / 100;
    const igv        = +(subtotal * igvPct).toFixed(2);
    const total      = +(subtotal + igv).toFixed(2);

    const inv = {
      id:         nextId,
      number:     overlay.querySelector('#invNumber').value.trim(),
      clientId,
      clientName,
      issueDate:  overlay.querySelector('#invIssueDate').value,
      dueDate:    overlay.querySelector('#invDueDate').value,
      subtotal,
      igv,
      total,
      status:     overlay.querySelector('#invStatus').value,
    };
    allInvoices.push(inv);
    saveInvoices();
    renderInvoicesTable();
    overlay.remove();
    document.body.style.overflow = '';
    showToast('Factura guardada ✓');
  });
}

function recalcInvoice() {
  const settings = getSettings();
  const igvPct   = parseFloat(settings.igv || 18) / 100;
  const subtotal = parseFloat(document.getElementById('invSubtotal')?.value) || 0;
  const igv      = +(subtotal * igvPct).toFixed(2);
  const total    = +(subtotal + igv).toFixed(2);
  const igvEl    = document.getElementById('invIgv');
  const totalEl  = document.getElementById('invTotal');
  if (igvEl)   igvEl.value   = igv.toFixed(2);
  if (totalEl) totalEl.value = total.toFixed(2);
}

function generateInvoiceFromSale(sale) {
  const settings = getSettings();
  const igvPct   = parseFloat(settings.igv || 18) / 100;
  const subtotal  = +(sale.total / (1 + igvPct)).toFixed(2);
  const igv       = +(sale.total - subtotal).toFixed(2);
  const nextId    = allInvoices.length > 0 ? Math.max(...allInvoices.map(i => i.id)) + 1 : 1;
  const dueDays   = parseInt(settings.dueDays || 30);
  const inv = {
    id: nextId,
    number: sale.invoice,
    clientId: sale.clientId,
    clientName: sale.clientName,
    issueDate: sale.date,
    dueDate: addDays(sale.date, dueDays),
    subtotal, igv,
    total: sale.total,
    status: sale.status === 'pagado' ? 'pagada' : 'emitida',
  };
  allInvoices.push(inv);
  saveInvoices();
}

/* ═══════════════════════════════════════════
   USUARIOS
═══════════════════════════════════════════ */
function renderUsersGrid() {
  const grid = document.getElementById('usersGrid');
  setText('usersCountLabel', `${allUsers.length} usuario${allUsers.length!==1?'s':''} registrado${allUsers.length!==1?'s':''}`);
  if (!grid) return;
  if (allUsers.length === 0) {
    grid.innerHTML = `<div class="empty-products" style="grid-column:1/-1;"><i class="fas fa-user-tie"></i><h3>Sin usuarios</h3></div>`;
    return;
  }
  grid.innerHTML = allUsers.map(u => `
    <div class="user-card">
      <div class="user-card-avatar">${u.name.charAt(0).toUpperCase()}</div>
      <div class="user-card-name">${escHtml(u.name)}</div>
      <div class="user-card-username">@${escHtml(u.username)}</div>
      <div class="user-card-email">${escHtml(u.email)}</div>
      <span class="user-card-role"><i class="fas fa-shield-alt"></i>${capitalizar(u.role)}</span>
      <div class="user-card-footer">
        <span class="status-badge status-${u.status}">${capitalizar(u.status)}</span>
        <div class="user-card-actions">
          <button class="btn-user-action edit" onclick="editUser(${u.id})"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-user-action delete" onclick="deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    </div>`).join('');
}

function openUserModal(title='Nuevo Usuario') {
  document.getElementById('userModalTitle').textContent = title;
  document.getElementById('userModalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeUserModal() {
  document.getElementById('userModalOverlay').classList.remove('active');
  document.body.style.overflow = '';
  currentEditingUser = null;
}

function newUser() {
  currentEditingUser = null;
  document.getElementById('userForm').reset();
  openUserModal('Nuevo Usuario');
}

function editUser(id) {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  currentEditingUser = id;
  document.getElementById('userName').value     = user.name;
  document.getElementById('userUsername').value = user.username;
  document.getElementById('userEmail').value    = user.email;
  document.getElementById('userRole').value     = user.role;
  document.getElementById('userStatus').value   = user.status;
  document.getElementById('userPassword').value = '';
  openUserModal(`Editar: ${user.name}`);
}

function deleteUser(id) {
  const user = allUsers.find(u => u.id === id);
  if (!user) return;
  if (!confirm(`¿Eliminar usuario "${user.name}"?`)) return;
  allUsers = allUsers.filter(u => u.id !== id);
  saveUsers();
  renderUsersGrid();
  showToast('Usuario eliminado');
}

function saveUserForm(e) {
  e.preventDefault();
  const data = {
    id:        currentEditingUser || (allUsers.length > 0 ? Math.max(...allUsers.map(u=>u.id))+1 : 1),
    name:      document.getElementById('userName').value.trim(),
    username:  document.getElementById('userUsername').value.trim(),
    email:     document.getElementById('userEmail').value.trim(),
    role:      document.getElementById('userRole').value,
    status:    document.getElementById('userStatus').value,
    dateAdded: currentEditingUser
      ? allUsers.find(u=>u.id===currentEditingUser)?.dateAdded
      : new Date().toISOString().split('T')[0],
  };
  if (currentEditingUser) {
    const idx = allUsers.findIndex(u => u.id === currentEditingUser);
    if (idx !== -1) allUsers[idx] = data;
  } else {
    allUsers.push(data);
  }
  saveUsers();
  renderUsersGrid();
  closeUserModal();
  showToast(currentEditingUser ? 'Usuario actualizado ✓' : 'Usuario guardado ✓');
}

/* ═══════════════════════════════════════════
   CONFIGURACIÓN
═══════════════════════════════════════════ */
function getSettings() {
  const s = localStorage.getItem('rosesSettings');
  return s ? JSON.parse(s) : { igv:18, dueDays:30, invPrefix:'INV-' };
}

function loadSettings() {
  const s = getSettings();
  setValue('settingBusinessName', s.businessName || 'Roses Bienestar');
  setValue('settingRUC',          s.ruc || '');
  setValue('settingAddress',      s.address || '');
  setValue('settingPhone',        s.phone || '');
  setValue('settingEmail',        s.email || '');
  setValue('settingInvPrefix',    s.invPrefix || 'INV-');
  setValue('settingIGV',          s.igv ?? 18);
  setValue('settingDueDays',      s.dueDays ?? 30);
  setValue('settingInvNote',      s.invNote || '');
}

function saveSettings() {
  const data = {
    businessName: getVal('settingBusinessName'),
    ruc:          getVal('settingRUC'),
    address:      getVal('settingAddress'),
    phone:        getVal('settingPhone'),
    email:        getVal('settingEmail'),
    invPrefix:    getVal('settingInvPrefix') || 'INV-',
    igv:          parseFloat(getVal('settingIGV')) || 18,
    dueDays:      parseInt(getVal('settingDueDays')) || 30,
    invNote:      getVal('settingInvNote'),
  };
  localStorage.setItem('rosesSettings', JSON.stringify(data));
  showToast('Configuración guardada ✓');
}

/* ═══════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════ */
function setText(id, val) { const el=document.getElementById(id); if(el) el.textContent=val; }
function setValue(id, val) { const el=document.getElementById(id); if(el) el.value=val; }
function getVal(id)  { return document.getElementById(id)?.value || ''; }
function capitalizar(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es-PE', { day:'2-digit', month:'short', year:'numeric' });
}

/* ═══════════════════════════════════════════
   EXTENDER showView de admin.js
═══════════════════════════════════════════ */
const _origShowView = typeof showView === 'function' ? showView : null;

window.showView = function(viewName) {
  const loader = document.getElementById('pageLoader');
  loader.classList.add('active');
  setTimeout(() => {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.classList.add('active');
      document.getElementById('pageTitle').textContent = {
        dashboard:  'Dashboard',
        products:   'Gestión de Productos',
        sales:      'Ventas',
        clients:    'Clientes',
        reports:    'Reportes',
        invoices:   'Facturas',
        users:      'Usuarios',
        settings:   'Configuración',
      }[viewName] || 'CRM';

      if (viewName === 'dashboard')  { updateDashboard(); updateDashboardCount?.(); }
      if (viewName === 'products')   { if (typeof renderProductCards==='function') renderProductCards(); }
      if (viewName === 'sales')      renderSalesTable();
      if (viewName === 'clients')    renderClientsGrid();
      if (viewName === 'reports')    renderReports();
      if (viewName === 'invoices')   renderInvoicesTable();
      if (viewName === 'users')      renderUsersGrid();
      if (viewName === 'settings')   loadSettings();
    }
    loader.classList.remove('active');
  }, 280);
};

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadClients();
  loadSales();
  loadInvoices();
  loadUsers();

  if (typeof allProducts !== 'undefined') {
    ensureDemoProducts();
  } else {
    setTimeout(ensureDemoProducts, 200);
  }

  document.getElementById('btnAddSale')?.addEventListener('click', newSale);
  document.getElementById('btnAddClient')?.addEventListener('click', newClient);
  document.getElementById('btnAddUser')?.addEventListener('click', newUser);
  document.getElementById('btnAddInvoice')?.addEventListener('click', newInvoice);

  document.getElementById('btnCloseSaleModal')?.addEventListener('click', closeSaleModal);
  document.getElementById('btnCancelSaleForm')?.addEventListener('click', closeSaleModal);
  document.getElementById('saleModalOverlay')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeSaleModal(); });

  document.getElementById('btnCloseClientModal')?.addEventListener('click', closeClientModal);
  document.getElementById('btnCancelClientForm')?.addEventListener('click', closeClientModal);
  document.getElementById('clientModalOverlay')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeClientModal(); });

  document.getElementById('btnCloseUserModal')?.addEventListener('click', closeUserModal);
  document.getElementById('btnCancelUserForm')?.addEventListener('click', closeUserModal);
  document.getElementById('userModalOverlay')?.addEventListener('click', e => { if(e.target===e.currentTarget) closeUserModal(); });

  document.getElementById('saleForm')?.addEventListener('submit', saveSaleForm);
  document.getElementById('clientForm')?.addEventListener('submit', saveClientForm);
  document.getElementById('userForm')?.addEventListener('submit', saveUserForm);

  document.getElementById('btnAddSaleItem')?.addEventListener('click', () => addSaleItem());

  document.getElementById('searchSales')?.addEventListener('input', renderSalesTable);
  document.getElementById('filterSalesStatus')?.addEventListener('change', renderSalesTable);
  document.getElementById('searchClients')?.addEventListener('input', renderClientsGrid);
  document.getElementById('filterClientsStatus')?.addEventListener('change', renderClientsGrid);
  document.getElementById('searchInvoices')?.addEventListener('input', renderInvoicesTable);
  document.getElementById('filterInvoiceStatus')?.addEventListener('change', renderInvoicesTable);
  document.getElementById('reportPeriod')?.addEventListener('change', renderReports);

  document.getElementById('btnExportReport')?.addEventListener('click', () => showToast('Exportación en desarrollo'));

  updateDashboard();
});
