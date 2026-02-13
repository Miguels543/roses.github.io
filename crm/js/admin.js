
  /* ═══════════════════════════════════════════
     ESTADO
  ═══════════════════════════════════════════ */
  let currentEditingProduct = null;
  let allProducts = [];

  // Categorías predeterminadas (value → label)
  const DEFAULT_CATEGORIES = [
    { value: 'aceites',    label: 'Aceites' },
    { value: 'jabones',    label: 'Jabones' },
    { value: 'colageno',   label: 'Colágeno' },
    { value: 'cacaoycafe', label: 'Cacao & Café' },
  ];
  let allCategories = []; // array de { value, label, custom: bool }

  /* ═══════════════════════════════════════════
     PERSISTENCIA CATEGORÍAS
  ═══════════════════════════════════════════ */
  function loadCategories() {
    const saved = localStorage.getItem('rosesCategories');
    if (saved) {
      allCategories = JSON.parse(saved);
      // Asegurar que las predeterminadas siempre existen
      DEFAULT_CATEGORIES.forEach(def => {
        if (!allCategories.find(c => c.value === def.value)) {
          allCategories.unshift({ ...def, custom: false });
        }
      });
    } else {
      allCategories = DEFAULT_CATEGORIES.map(c => ({ ...c, custom: false }));
    }
    saveCategories();
  }

  function saveCategories() {
    localStorage.setItem('rosesCategories', JSON.stringify(allCategories));
  }

  /* ═══════════════════════════════════════════
     SINCRONIZAR SELECTS DE CATEGORÍA
  ═══════════════════════════════════════════ */
  function syncCategorySelects(keepValue = '') {
    const selects = [
      document.getElementById('productCategory'),
      document.getElementById('filterCategory')
    ];
    selects.forEach((sel, idx) => {
      if (!sel) return;
      const current = keepValue || sel.value;
      sel.innerHTML = idx === 0
        ? '<option value="">-- Seleccionar --</option>'
        : '<option value="">Todas las categorías</option>';
      allCategories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.value;
        opt.textContent = cat.label;
        sel.appendChild(opt);
      });
      if (current) sel.value = current;
    });
  }

  /* ═══════════════════════════════════════════
     MODAL DE CATEGORÍAS
  ═══════════════════════════════════════════ */
  function openCatModal() {
    renderCatChips();
    document.getElementById('newCatInput').value = '';
    document.getElementById('catModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => document.getElementById('newCatInput').focus(), 100);
  }

  function closeCatModal() {
    document.getElementById('catModalOverlay').classList.remove('active');
    // Sólo restaurar scroll si el modal de producto está cerrado
    if (!document.getElementById('productModalOverlay').classList.contains('active')) {
      document.body.style.overflow = '';
    }
    syncCategorySelects();
    renderProductCards();
  }

  function renderCatChips() {
    const list = document.getElementById('catChipsList');
    if (!list) return;

    if (allCategories.length === 0) {
      list.innerHTML = '<div class="cat-empty"><i class="fas fa-tag" style="font-size:2rem;display:block;margin-bottom:0.5rem;opacity:0.3;"></i>No hay categorías aún</div>';
      return;
    }

    list.innerHTML = allCategories.map(cat => {
      const usedCount = allProducts.filter(p => p.category === cat.value).length;
      const canDelete = cat.custom || usedCount === 0; // solo bloquear si es default Y tiene productos
      const isDefault = !cat.custom;
      return `
        <div class="cat-chip" data-value="${cat.value}">
          <div class="cat-chip-left">
            <div class="cat-chip-icon ${isDefault ? 'default' : ''}">
              <i class="fas fa-${isDefault ? 'leaf' : 'tag'}"></i>
            </div>
            <div>
              <span class="cat-chip-name">${escHtml(cat.label)}</span>
              <span class="cat-chip-badge">${usedCount} producto${usedCount !== 1 ? 's' : ''}</span>
              ${isDefault ? '<span class="cat-chip-badge" style="background:rgba(74,112,67,0.1);color:var(--primary);">predeterminada</span>' : ''}
            </div>
          </div>
          <button class="btn-cat-delete" onclick="deleteCategory('${cat.value}')"
            ${isDefault ? 'title="No se puede eliminar una categoría predeterminada"' : `title="Eliminar ${escHtml(cat.label)}"`}
            ${isDefault ? 'disabled' : ''}>
            <i class="fas fa-trash"></i>
          </button>
        </div>`;
    }).join('');
  }

  function addCategory() {
    const input = document.getElementById('newCatInput');
    const raw = input.value.trim();
    if (!raw) { input.focus(); return; }

    // Generar value seguro desde el label
    const value = raw.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    if (!value) { showToast('Nombre de categoría inválido', true); return; }
    if (allCategories.find(c => c.value === value || c.label.toLowerCase() === raw.toLowerCase())) {
      showToast('Esa categoría ya existe', true); input.select(); return;
    }

    allCategories.push({ value, label: raw, custom: true });
    saveCategories();
    syncCategorySelects();
    renderCatChips();
    input.value = '';
    input.focus();
    showToast(`Categoría "${raw}" agregada ✓`);
  }

  function deleteCategory(value) {
    const cat = allCategories.find(c => c.value === value);
    if (!cat) return;
    if (!cat.custom) { showToast('Las categorías predeterminadas no se pueden eliminar', true); return; }

    const usedCount = allProducts.filter(p => p.category === value).length;
    if (usedCount > 0) {
      if (!confirm(`La categoría "${cat.label}" tiene ${usedCount} producto(s) asignado(s).\n¿Eliminarla de todas formas? Los productos quedarán sin categoría.`)) return;
      // Limpiar categoría de productos
      allProducts = allProducts.map(p => p.category === value ? { ...p, category: '' } : p);
      saveProducts();
    }

    allCategories = allCategories.filter(c => c.value !== value);
    saveCategories();
    syncCategorySelects();
    renderCatChips();
    showToast(`Categoría "${cat.label}" eliminada`);
  }

  /* ═══════════════════════════════════════════
     VISTAS / NAVEGACIÓN
  ═══════════════════════════════════════════ */
  const views = {
    dashboard: document.getElementById('view-dashboard'),
    products:  document.getElementById('view-products')
  };
  const pageTitleEl = document.getElementById('pageTitle');
  const loader = document.getElementById('pageLoader');

  function showView(viewName) {
    loader.classList.add('active');
    setTimeout(() => {
      Object.values(views).forEach(v => v.classList.remove('active'));
      if (views[viewName]) {
        views[viewName].classList.add('active');
        pageTitleEl.textContent = viewName === 'dashboard' ? 'Dashboard' : 'Gestión de Productos';
        if (viewName === 'products') renderProductCards();
        if (viewName === 'dashboard') updateDashboardCount();
      }
      loader.classList.remove('active');
    }, 280);
  }

  function navigate(e) {
    const link = e.target.closest('[data-view]');
    if (!link) return;
    e.preventDefault();
    const view = link.dataset.view;
    history.pushState({ view }, '', `#${view}`);
    showView(view);
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    link.classList.add('active');
    if (window.innerWidth <= 992) closeSidebar();
  }

  document.addEventListener('click', navigate);
  window.addEventListener('popstate', e => showView(e.state?.view || 'dashboard'));

  /* ═══════════════════════════════════════════
     FECHA
  ═══════════════════════════════════════════ */
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  /* ═══════════════════════════════════════════
     PERSISTENCIA PRODUCTOS
  ═══════════════════════════════════════════ */
  function loadProducts() {
    const saved = localStorage.getItem('rosesProducts');
    allProducts = saved ? JSON.parse(saved) : [];
    saveProducts();
  }

  function saveProducts() {
    localStorage.setItem('rosesProducts', JSON.stringify(allProducts));
  }

  /* ═══════════════════════════════════════════
     RENDER CARDS
  ═══════════════════════════════════════════ */
  function getCatLabel(value) {
    const found = allCategories.find(c => c.value === value);
    return found ? found.label : (value || 'Sin categoría');
  }

  function renderProductCards() {
    const grid = document.getElementById('productCardsGrid');
    const catFilter  = document.getElementById('filterCategory')?.value || '';
    const searchTerm = (document.getElementById('searchProducts')?.value || '').toLowerCase();

    let list = allProducts;
    if (catFilter)    list = list.filter(p => p.category === catFilter);
    if (searchTerm)   list = list.filter(p =>
      p.name.toLowerCase().includes(searchTerm) ||
      (p.description || '').toLowerCase().includes(searchTerm)
    );

    const countEl = document.getElementById('productsCount');
    if (countEl) countEl.textContent = `${allProducts.length} producto${allProducts.length !== 1 ? 's' : ''} registrado${allProducts.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-products" style="grid-column:1/-1;">
          <i class="fas fa-box-open"></i>
          <h3>${allProducts.length === 0 ? 'No hay productos aún' : 'Sin resultados'}</h3>
          <p>${allProducts.length === 0 ? 'Empieza agregando tu primer producto.' : 'Intenta con otro filtro o búsqueda.'}</p>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(product => {
      const minPrice = product.presentations?.length
        ? Math.min(...product.presentations.map(p => p.price || 0)) : 0;
      const isLowStock = product.stock < 10;
      const catLabel = getCatLabel(product.category);

      const presentationsPills = (product.presentations || []).slice(0,3).map(p =>
        `<span class="pres-pill">${escHtml(p.name)} · S/.${parseFloat(p.price).toFixed(2)}</span>`
      ).join('');
      const morePres = (product.presentations || []).length > 3
        ? `<span class="pres-pill" style="color:var(--text-light);">+${product.presentations.length - 3} más</span>` : '';

      const imgEl = product.image
        ? `<img src="${product.image}" alt="${escHtml(product.name)}" class="product-card-image" onclick="previewImage('${product.image.replace(/'/g,"\\'")}','${escHtml(product.name)}')" loading="lazy">`
        : `<div class="product-card-image-placeholder"><i class="fas fa-image"></i></div>`;

      return `
        <div class="product-card">
          ${product.bestSelling ? '<span class="badge-best"><i class="fas fa-star"></i> Destacado</span>' : ''}
          ${isLowStock ? '<span class="badge-stock-low"><i class="fas fa-exclamation-triangle"></i> Stock bajo</span>' : ''}
          ${imgEl}
          <div class="product-card-body">
            <div class="product-card-top">
              <div class="product-card-name">${escHtml(product.name)}</div>
              <span class="product-card-id">#${product.id}</span>
            </div>
            <span class="product-card-category"><i class="fas fa-tag"></i> ${escHtml(catLabel)}</span>
            <p class="product-card-desc">${escHtml(product.description || '')}</p>
            <div class="product-card-divider"></div>
            <div class="product-card-meta">
              <div class="product-card-price">S/. ${minPrice.toFixed(2)}<span>desde</span></div>
              <div class="product-card-stock ${isLowStock ? 'low' : ''}">
                <i class="fas fa-cubes"></i> ${product.stock} und.
              </div>
            </div>
            <div class="product-card-presentations">${presentationsPills}${morePres}</div>
          </div>
          <div class="product-card-actions">
            <button class="btn-card-action edit" onclick="editProduct(${product.id})">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-card-action delete" onclick="deleteProduct(${product.id})">
              <i class="fas fa-trash"></i> Eliminar
            </button>
          </div>
        </div>`;
    }).join('');
  }

  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function updateDashboardCount() {
    const el = document.getElementById('dashProductCount');
    if (el) el.textContent = allProducts.length;
  }

  /* ═══════════════════════════════════════════
     CRUD PRODUCTOS
  ═══════════════════════════════════════════ */
  function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    currentEditingProduct = id;
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name;
    document.getElementById('productImage').value = product.image || '';
    syncCategorySelects(product.category);
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productBestSelling').checked = !!product.bestSelling;
    showImagePreview(product.image);

    const container = document.getElementById('presentationsContainer');
    container.innerHTML = '';
    (product.presentations || []).forEach(p => addPresentationRow(p.name, p.price));

    document.getElementById('modalTitle').textContent = `Editar: ${product.name}`;
    openProductModal();
  }

  function newProduct() {
    currentEditingProduct = null;
    document.getElementById('productForm').reset();
    const nextId = allProducts.length > 0 ? Math.max(...allProducts.map(p => p.id || 0)) + 1 : 1;
    document.getElementById('productId').value = nextId;
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('presentationsContainer').innerHTML = '';
    syncCategorySelects();
    addPresentationRow();
    document.getElementById('modalTitle').textContent = 'Nuevo Producto';
    openProductModal();
  }

  function addPresentationRow(name = '', price = '') {
    const container = document.getElementById('presentationsContainer');
    const div = document.createElement('div');
    div.className = 'presentation-item';
    div.innerHTML = `
      <div class="form-group">
        <label>Presentación</label>
        <input type="text" class="pres-name" value="${escHtml(String(name))}" placeholder="ej: 120ml, 500g">
      </div>
      <div class="form-group">
        <label>Precio (S/.)</label>
        <input type="number" class="pres-price" value="${price}" step="0.01" min="0" placeholder="0.00">
      </div>
      <button type="button" class="btn-remove-presentation" onclick="this.closest('.presentation-item').remove()">
        <i class="fas fa-times"></i> Eliminar
      </button>`;
    container.appendChild(div);
  }

  function saveProduct(e) {
    e.preventDefault();
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) { alert('Completa todos los campos requeridos.'); return; }

    const presentations = [];
    document.querySelectorAll('.presentation-item').forEach(item => {
      const name  = item.querySelector('.pres-name').value.trim();
      const price = parseFloat(item.querySelector('.pres-price').value);
      if (name && !isNaN(price)) presentations.push({ name, price });
    });
    if (presentations.length === 0) { alert('Agrega al menos una presentación.'); return; }

    const data = {
      id: currentEditingProduct || parseInt(document.getElementById('productId').value),
      name:        document.getElementById('productName').value.trim(),
      image:       document.getElementById('productImage').value.trim(),
      category:    document.getElementById('productCategory').value,
      description: document.getElementById('productDescription').value.trim(),
      stock:       parseInt(document.getElementById('productStock').value) || 0,
      bestSelling: document.getElementById('productBestSelling').checked,
      presentations,
      dateAdded: currentEditingProduct
        ? allProducts.find(p => p.id === currentEditingProduct)?.dateAdded
        : new Date().toISOString()
    };

    if (currentEditingProduct) {
      const idx = allProducts.findIndex(p => p.id === currentEditingProduct);
      if (idx !== -1) allProducts[idx] = data;
    } else {
      allProducts.push(data);
    }

    saveProducts();
    renderProductCards();
    updateDashboardCount();
    closeProductModal();
    showToast(currentEditingProduct ? 'Producto actualizado ✓' : 'Producto guardado ✓');
  }

  function deleteProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    allProducts = allProducts.filter(p => p.id !== id);
    saveProducts();
    renderProductCards();
    updateDashboardCount();
    showToast('Producto eliminado');
  }

  /* ═══════════════════════════════════════════
     MODAL PRODUCTO
  ═══════════════════════════════════════════ */
  function openProductModal() {
    document.getElementById('productModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeProductModal() {
    document.getElementById('productModalOverlay').classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ═══════════════════════════════════════════
     IMAGEN
  ═══════════════════════════════════════════ */
  function previewImage(url, name) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:20000;display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
    overlay.innerHTML = `<img src="${url}" alt="${name || ''}" style="max-width:90vw;max-height:90vh;border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">`;
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);
  }

  function showImagePreview(url) {
    const el = document.getElementById('imagePreview');
    if (url) { el.src = url; el.style.display = 'block'; }
    else { el.style.display = 'none'; }
  }

  function handleImageUpload(file) {
    if (!file || !file.type.startsWith('image/')) { alert('Selecciona una imagen válida.'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      document.getElementById('productImage').value = e.target.result;
      showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  /* ═══════════════════════════════════════════
     TOAST
  ═══════════════════════════════════════════ */
  function showToast(msg, isError = false) {
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `
      position:fixed;bottom:2rem;right:2rem;z-index:30000;
      background:${isError ? '#e53e3e' : 'var(--primary)'};color:white;
      padding:0.85rem 1.4rem;border-radius:12px;
      font-size:0.9rem;font-weight:600;
      box-shadow:0 8px 24px ${isError ? 'rgba(229,62,62,0.4)' : 'rgba(74,112,67,0.4)'};
      animation:slideUp 0.3s ease;pointer-events:none;
    `;
    if (!document.getElementById('_toastStyle')) {
      const s = document.createElement('style');
      s.id = '_toastStyle';
      s.textContent = '@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  /* ═══════════════════════════════════════════
     SIDEBAR MÓVIL
  ═══════════════════════════════════════════ */
  function openSidebar() {
    document.getElementById('adminSidebar').classList.add('show');
    document.getElementById('sidebarOverlay').classList.add('show');
    document.body.classList.add('sidebar-open');
  }
  function closeSidebar() {
    document.getElementById('adminSidebar').classList.remove('show');
    document.getElementById('sidebarOverlay').classList.remove('show');
    document.body.classList.remove('sidebar-open');
  }

  /* ═══════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════ */
  document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
    syncCategorySelects();

    // Vista inicial
    const initialHash = location.hash.replace('#', '') || 'dashboard';
    showView(initialHash);
    const initialLink = document.querySelector(`[data-view="${initialHash}"]`);
    if (initialLink) {
      document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
      initialLink.classList.add('active');
    }

    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', openSidebar);
    document.getElementById('sidebarClose')?.addEventListener('click', closeSidebar);
    document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

    // Producto
    document.getElementById('btnAddProduct')?.addEventListener('click', newProduct);
    document.getElementById('btnAddPresentation')?.addEventListener('click', () => addPresentationRow());
    document.getElementById('btnCloseModal')?.addEventListener('click', closeProductModal);
    document.getElementById('btnCancelForm')?.addEventListener('click', closeProductModal);
    document.getElementById('productForm')?.addEventListener('submit', saveProduct);
    document.getElementById('productModalOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeProductModal();
    });

    // Imagen
    document.getElementById('btnUploadImage')?.addEventListener('click', e => {
      e.preventDefault(); document.getElementById('fileInput').click();
    });
    document.getElementById('fileInput')?.addEventListener('change', e => {
      if (e.target.files[0]) handleImageUpload(e.target.files[0]);
    });
    document.getElementById('productImage')?.addEventListener('input', function() {
      showImagePreview(this.value);
    });

    // Filtros
    document.getElementById('searchProducts')?.addEventListener('input', () => renderProductCards());
    document.getElementById('filterCategory')?.addEventListener('change', () => renderProductCards());

    // Categorías — abrir modal desde la toolbar
    document.getElementById('btnManageCatsToolbar')?.addEventListener('click', openCatModal);
    // Categorías — abrir modal desde el formulario de producto
    document.getElementById('btnManageCatsForm')?.addEventListener('click', () => {
      // Guardar el valor actual del select antes de abrir
      openCatModal();
    });

    // Cerrar modal categorías
    document.getElementById('btnCloseCatModal')?.addEventListener('click', closeCatModal);
    document.getElementById('catModalOverlay')?.addEventListener('click', e => {
      if (e.target === e.currentTarget) closeCatModal();
    });

    // Agregar categoría con botón
    document.getElementById('btnSaveCat')?.addEventListener('click', addCategory);
    // Agregar categoría con Enter
    document.getElementById('newCatInput')?.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); addCategory(); }
    });
  });