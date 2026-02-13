/* ========================================
   PRODUCTS.JS - BASE DE DATOS Y FUNCIONES DE PRODUCTOS
   ======================================== */

// Base de datos de productos (datos por defecto)
const defaultProducts = [
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
    dateAdded: new Date('2025-01-15')
  },
  {
    id: 2,
    name: 'Jabón Natural de Aloe Vera',
    category: 'jabones',
    image: 'https://tse2.mm.bing.net/th/id/OIP.o0rIDwAcAp3EmFQvffrX4QHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'Regenerador e hidratante. Suave para piel sensible.',
    presentations: [
      { name: 'Unidad', price: 18.00 }
    ],
    stock: 32,
    bestSelling: false,
    dateAdded: new Date('2025-01-20')
  },
  {
    id: 3,
    name: 'Jabón Natural de Arroz',
    category: 'jabones',
    image: 'https://media.redfarma.es/product/jabon-natural-premium-arroz-100g-800x800.jpg',
    description: 'Aclarante natural. Ilumina y rejuvenece la piel.',
    presentations: [
      { name: 'Unidad', price: 18.00 }
    ],
    stock: 28,
    bestSelling: true,
    dateAdded: new Date('2025-02-01')
  },
  {
    id: 4,
    name: 'Jabón Natural de Anís',
    category: 'jabones',
    image: 'https://tse1.explicit.bing.net/th/id/OIP.vr4FcGcXI-TkKKOHu3hHTwHaIa?rs=1&pid=ImgDetMain&o=7&rm=3',
    description: 'Purificante y refrescante. Aroma natural agradable.',
    presentations: [
      { name: 'Unidad', price: 18.00 }
    ],
    stock: 50,
    bestSelling: false,
    dateAdded: new Date('2025-01-10')
  }
];

// Cargar productos desde localStorage o usar por defecto
let products = [];
function initializeProducts() {
  const saved = localStorage.getItem('rosesProducts');
  if (saved) {
    products = JSON.parse(saved);
  } else {
    products = JSON.parse(JSON.stringify(defaultProducts));
  }
}

// Variables globales
let currentProduct = {};
let selectedPresentations = {};
let currentGridColumns = 3;

/* ===============================================
   FUNCIONES DEL MODAL
   =============================================== */

function openModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  currentProduct = product;
  selectedPresentations = {};
  
  loadCartSelections();
  
  document.getElementById('modalTitle').textContent = product.name;
  document.getElementById('modalImage').src = product.image;
  document.getElementById('modalImage').alt = product.name;
  document.getElementById('modalDesc').textContent = product.description;
  
  const container = document.getElementById('presentationsContainer');
  container.innerHTML = product.presentations.map((pres, idx) => {
    const qty = selectedPresentations[idx] ? selectedPresentations[idx].qty : 0;
    const isSelected = qty > 0;
    
    return `
      <div class="presentation-item ${isSelected ? 'selected' : ''}" id="pres-${idx}" onclick="togglePresentation(${idx}, '${pres.name}', ${pres.price})">
        <div class="pres-info">
          <div class="pres-name">${pres.name}</div>
          <div class="pres-price">S/. ${pres.price.toFixed(2)}</div>
        </div>
        <div class="pres-controls">
          <button class="qty-btn" onclick="event.stopPropagation(); decrementQty(${idx})" ${qty === 0 ? 'disabled' : ''}>−</button>
          <div class="qty-display" id="qty-${idx}">${qty}</div>
          <button class="qty-btn" onclick="event.stopPropagation(); incrementQty(${idx})">+</button>
          ${qty > 0 ? `<button class="remove-pres-btn" onclick="event.stopPropagation(); removePresentation(${idx})">✕</button>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  document.getElementById('modalOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.body.style.overflow = 'auto';
}

function loadCartSelections() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  selectedPresentations = {};
  
  cart.forEach(item => {
    if (item.productId === currentProduct.id) {
      const presIdx = currentProduct.presentations.findIndex(p => p.name === item.presentation);
      if (presIdx !== -1) {
        if (!selectedPresentations[presIdx]) {
          selectedPresentations[presIdx] = {
            name: item.presentation,
            price: item.price,
            qty: 0
          };
        }
        selectedPresentations[presIdx].qty++;
      }
    }
  });
}

function togglePresentation(idx, name, price) {
  const currentQty = selectedPresentations[idx] ? selectedPresentations[idx].qty : 0;
  
  if (currentQty === 0) {
    selectedPresentations[idx] = { name, price, qty: 1 };
  }
  
  updatePresentationUI(idx);
}

function incrementQty(idx) {
  if (!selectedPresentations[idx]) {
    const pres = currentProduct.presentations[idx];
    selectedPresentations[idx] = { name: pres.name, price: pres.price, qty: 0 };
  }
  selectedPresentations[idx].qty++;
  updatePresentationUI(idx);
}

function decrementQty(idx) {
  if (selectedPresentations[idx] && selectedPresentations[idx].qty > 0) {
    selectedPresentations[idx].qty--;
    if (selectedPresentations[idx].qty === 0) {
      delete selectedPresentations[idx];
    }
    updatePresentationUI(idx);
  }
}

function removePresentation(idx) {
  delete selectedPresentations[idx];
  updatePresentationUI(idx);
}

function updatePresentationUI(idx) {
  const presElement = document.getElementById(`pres-${idx}`);
  const qtyElement = document.getElementById(`qty-${idx}`);
  const qty = selectedPresentations[idx] ? selectedPresentations[idx].qty : 0;
  
  qtyElement.textContent = qty;
  
  if (qty > 0) {
    presElement.classList.add('selected');
  } else {
    presElement.classList.remove('selected');
  }
  
  const pres = currentProduct.presentations[idx];
  
  presElement.innerHTML = `
    <div class="pres-info">
      <div class="pres-name">${pres.name}</div>
      <div class="pres-price">S/. ${pres.price.toFixed(2)}</div>
    </div>
    <div class="pres-controls">
      <button class="qty-btn" onclick="event.stopPropagation(); decrementQty(${idx})" ${qty === 0 ? 'disabled' : ''}>−</button>
      <div class="qty-display" id="qty-${idx}">${qty}</div>
      <button class="qty-btn" onclick="event.stopPropagation(); incrementQty(${idx})">+</button>
      ${qty > 0 ? `<button class="remove-pres-btn" onclick="event.stopPropagation(); removePresentation(${idx})">✕</button>` : ''}
    </div>
  `;
}

function addSelectedToCart() {
  const selectedKeys = Object.keys(selectedPresentations);
  if (selectedKeys.length === 0) {
    alert('Por favor selecciona al menos una presentación');
    return;
  }
  
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => item.productId !== currentProduct.id);
  
  selectedKeys.forEach(idx => {
    const pres = selectedPresentations[idx];
    for (let i = 0; i < pres.qty; i++) {
      cart.push({
        productId: currentProduct.id,
        name: currentProduct.name,
        image: currentProduct.image,
        category: currentProduct.category,
        presentation: pres.name,
        price: pres.price
      });
    }
  });
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  closeModal();
  alert('✓ Productos actualizados en tu cotización');
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = cart.length;
  }
}

/* ===============================================
   FUNCIONES DEL CARRITO
   =============================================== */

function openCart() {
  window.location.href = 'cart.html';
}

/* ===============================================
   FUNCIONES DE RENDERIZADO
   =============================================== */

function renderProducts(filtered = products) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  filtered.forEach((product, index) => {
    const minPrice = Math.min(...product.presentations.map(p => p.price));
    const card = document.createElement('div');
    card.className = 'product-card scroll-reveal';
    card.style.animationDelay = (index % 4) * 0.1 + 's';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <div class="product-type">${product.category.toUpperCase()}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">Desde S/. ${minPrice.toFixed(2)}</div>
        <button class="product-btn" onclick="openModal(${product.id})">Ver Detalles</button>
      </div>
    `;
    grid.appendChild(card);
  });
  
  if (typeof revealOnScroll === 'function') {
    revealOnScroll();
  }
}

/* ===============================================
   FUNCIONES DE ORDENAMIENTO
   =============================================== */

function sortProducts(productsArray, sortType) {
  let sorted = [...productsArray];
  
  switch(sortType) {
    case 'best-selling':
      sorted.sort((a, b) => (b.bestSelling ? 1 : 0) - (a.bestSelling ? 1 : 0));
      break;
    case 'alphabetical-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'alphabetical-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'price-asc':
      sorted.sort((a, b) => {
        const minA = Math.min(...a.presentations.map(p => p.price));
        const minB = Math.min(...b.presentations.map(p => p.price));
        return minA - minB;
      });
      break;
    case 'price-desc':
      sorted.sort((a, b) => {
        const minA = Math.min(...a.presentations.map(p => p.price));
        const minB = Math.min(...b.presentations.map(p => p.price));
        return minB - minA;
      });
      break;
    case 'date-desc':
      sorted.sort((a, b) => a.dateAdded - b.dateAdded);
      break;
    case 'date-asc':
      sorted.sort((a, b) => b.dateAdded - a.dateAdded);
      break;
  }
  
  return sorted;
}

/* ===============================================
   FUNCIONES DE FILTRADO
   =============================================== */

function applyFilters() {
  const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
  const minPrice = parseFloat(document.getElementById('minPriceInput')?.value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPriceInput')?.value) || 999;
  const categoryFilters = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
  const sortType = document.getElementById('sortSelect')?.value || '';

  let filtered = products.filter(p => {
    let match = p.name.toLowerCase().includes(search);
    
    const minProductPrice = Math.min(...p.presentations.map(pr => pr.price));
    match = match && (minProductPrice >= minPrice && minProductPrice <= maxPrice);
    
    if (categoryFilters.length > 0) {
      match = match && categoryFilters.includes(p.category);
    }
    
    return match;
  });

  // Aplicar ordenamiento
  if (sortType) {
    filtered = sortProducts(filtered, sortType);
  }

  renderProducts(filtered);
  
  // Actualizar contador
  const counter = document.getElementById('productsCount');
  if (counter) {
    counter.textContent = filtered.length;
  }

  // Actualizar contadores de stock
  updateStockCounts();
}

function updateStockCounts() {
  const inStockCount = document.getElementById('inStockCount');
  const outStockCount = document.getElementById('outStockCount');
  
  if (inStockCount) inStockCount.textContent = products.length;
  if (outStockCount) outStockCount.textContent = '0';
}

function updateSliderTrack() {
  const minRange = document.getElementById('minPriceRange');
  const maxRange = document.getElementById('maxPriceRange');
  const track = document.getElementById('sliderTrack');
  
  if (!minRange || !maxRange || !track) return;
  
  const min = parseInt(minRange.value);
  const max = parseInt(maxRange.value);
  const rangeMin = parseInt(minRange.min);
  const rangeMax = parseInt(minRange.max);
  
  const percentMin = ((min - rangeMin) / (rangeMax - rangeMin)) * 100;
  const percentMax = ((max - rangeMin) / (rangeMax - rangeMin)) * 100;
  
  track.style.left = percentMin + '%';
  track.style.width = (percentMax - percentMin) + '%';
}

/* ===============================================
   FUNCIONES DE VISTA
   =============================================== */

function changeGridView(columns) {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;
  
  grid.className = `products-grid grid-${columns}`;
  currentGridColumns = columns;
  
  // Actualizar botones activos
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.classList.remove('active');
    if (parseInt(btn.dataset.columns) === columns) {
      btn.classList.add('active');
    }
  });
}

/* ===============================================
   CONFIGURACIÓN DE EVENT LISTENERS
   =============================================== */

function setupFilterListeners() {
  // Búsqueda
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Ordenamiento
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', applyFilters);
  }

  // Checkboxes de disponibilidad
  const inStockFilter = document.getElementById('inStockFilter');
  const outOfStockFilter = document.getElementById('outOfStockFilter');
  if (inStockFilter) inStockFilter.addEventListener('change', applyFilters);
  if (outOfStockFilter) outOfStockFilter.addEventListener('change', applyFilters);

  // Sliders de precio - actualizar solo al soltar
  const minPriceRange = document.getElementById('minPriceRange');
  const maxPriceRange = document.getElementById('maxPriceRange');
  const minPriceInput = document.getElementById('minPriceInput');
  const maxPriceInput = document.getElementById('maxPriceInput');

  if (minPriceRange && minPriceInput) {
    minPriceRange.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const maxValue = parseInt(maxPriceRange.value);
      
      if (value > maxValue) {
        minPriceRange.value = maxValue;
        minPriceInput.value = maxValue;
      } else {
        minPriceInput.value = value;
      }
      updateSliderTrack();
    });

    minPriceRange.addEventListener('change', applyFilters);

    minPriceInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 0;
      minPriceRange.value = value;
      updateSliderTrack();
      applyFilters();
    });
  }

  if (maxPriceRange && maxPriceInput) {
    maxPriceRange.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      const minValue = parseInt(minPriceRange.value);
      
      if (value < minValue) {
        maxPriceRange.value = minValue;
        maxPriceInput.value = minValue;
      } else {
        maxPriceInput.value = value;
      }
      updateSliderTrack();
    });

    maxPriceRange.addEventListener('change', applyFilters);

    maxPriceInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value) || 999;
      maxPriceRange.value = value;
      updateSliderTrack();
      applyFilters();
    });
  }

  // Checkboxes de categoría
  const categoryFilters = document.querySelectorAll('.category-filter');
  categoryFilters.forEach(filter => {
    filter.addEventListener('change', applyFilters);
  });

  // Botón limpiar filtros
  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (sortSelect) sortSelect.value = '';
      if (inStockFilter) inStockFilter.checked = true;
      if (outOfStockFilter) outOfStockFilter.checked = false;
      if (minPriceInput) minPriceInput.value = '0';
      if (maxPriceInput) maxPriceInput.value = '999';
      if (minPriceRange) minPriceRange.value = '0';
      if (maxPriceRange) maxPriceRange.value = '999';
      
      categoryFilters.forEach(filter => filter.checked = false);
      
      updateSliderTrack();
      applyFilters();
    });
  }

  // Botones de vista
  const viewBtns = document.querySelectorAll('.view-btn');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const columns = parseInt(btn.dataset.columns);
      changeGridView(columns);
    });
  });

  // Inicializar slider track
  updateSliderTrack();
}

/* ===============================================
   INICIALIZACIÓN
   =============================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Cargar productos desde localStorage
  initializeProducts();
  
  updateCartBadge();
  updateStockCounts();
  
  if (document.getElementById('productsGrid')) {
    renderProducts();
    setupFilterListeners();
  }
  
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', openCart);
  }
});