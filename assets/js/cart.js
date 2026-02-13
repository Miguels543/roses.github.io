/* ========================================
   CART.JS - FUNCIONES DEL CARRITO
   ======================================== */

// Agrupar productos por productId y presentación
function groupCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const grouped = {};
  
  cart.forEach(item => {
    const key = `${item.productId}-${item.presentation}`;
    if (!grouped[key]) {
      grouped[key] = {
        ...item,
        quantity: 0
      };
    }
    grouped[key].quantity++;
  });
  
  return Object.values(grouped);
}

// Cargar y mostrar carrito
function loadCart() {
  const groupedItems = groupCartItems();
  const cartContent = document.getElementById('cartContent');
  
  if (groupedItems.length === 0) {
    cartContent.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛍️</div>
        <h2>Tu carrito está vacío</h2>
        <p>Aún no has agregado productos a tu carrito. ¡Explora nuestro catálogo!</p>
        <a href="catalog.html" class="btn btn-primary">Ir al Catálogo</a>
      </div>
    `;
    return;
  }

  // Calcular total
  const total = groupedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = groupedItems.reduce((sum, item) => sum + item.quantity, 0);

  // Mostrar carrito
  cartContent.innerHTML = `
    <div class="cart-content">
      <div class="cart-items">
        ${groupedItems.map((item, idx) => `
          <div class="cart-item" id="item-${idx}">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
              <h3>${item.name}</h3>
              <p class="product-type">${item.category ? item.category.toUpperCase() : 'PRODUCTO'}</p>
              <p style="font-size: 0.9rem; color: var(--gray);">Presentación: <strong>${item.presentation || 'Estándar'}</strong></p>
              <div class="cart-item-price">S/. ${parseFloat(item.price).toFixed(2)} c/u</div>
            </div>
            <div class="cart-item-actions">
              <div style="text-align: right; display: flex; flex-direction: column; gap: 0.5rem;">
                <div style="font-size: 0.9rem; color: var(--gray);">Subtotal</div>
                <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">S/. ${(item.price * item.quantity).toFixed(2)}</div>
              </div>
              <div class="qty-controls">
                <button class="qty-btn-cart" onclick="updateQuantity(${item.productId}, '${item.presentation}', -1)">−</button>
                <div class="qty-display-cart">${item.quantity}</div>
                <button class="qty-btn-cart" onclick="updateQuantity(${item.productId}, '${item.presentation}', 1)">+</button>
              </div>
              <button class="remove-btn" onclick="removeFromCart(${item.productId}, '${item.presentation}')">Eliminar</button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="cart-summary">
        <div class="summary-title">Resume tu Orden</div>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>S/. ${total.toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Ítems</span>
          <span>${totalItems}</span>
        </div>
        <div class="summary-row">
          <span>Envío</span>
          <span>Calculado al checkout</span>
        </div>
        <div class="summary-row total">
          <span>Total</span>
          <span>S/. ${total.toFixed(2)}</span>
        </div>
        <button class="checkout-btn" onclick="checkout()">Proceder al Pago</button>
        <button class="continue-shopping" onclick="window.location.href='catalog.html'">Continuar Comprando</button>
      </div>
    </div>
  `;
}

function updateQuantity(productId, presentation, change) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Contar cuántos items hay de este producto y presentación
  const itemsOfType = cart.filter(item => 
    item.productId === productId && item.presentation === presentation
  );
  
  const currentQty = itemsOfType.length;
  const newQty = currentQty + change;
  
  if (newQty <= 0) {
    // Eliminar todos si la cantidad es 0 o menos
    cart = cart.filter(item => 
      !(item.productId === productId && item.presentation === presentation)
    );
  } else if (change > 0) {
    // Agregar uno más
    const template = itemsOfType[0];
    cart.push({ ...template });
  } else {
    // Quitar uno
    const indexToRemove = cart.findIndex(item => 
      item.productId === productId && item.presentation === presentation
    );
    if (indexToRemove !== -1) {
      cart.splice(indexToRemove, 1);
    }
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
}

function removeFromCart(productId, presentation) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  cart = cart.filter(item => 
    !(item.productId === productId && item.presentation === presentation)
  );
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
  loadCart();
}

function checkout() {
  const groupedItems = groupCartItems();
  
  if (groupedItems.length === 0) {
    alert('Tu carrito está vacío');
    return;
  }

  const total = groupedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Crear mensaje para WhatsApp
  let message = '¡Hola! Me gustaría proceder con mi cotización de Roses Bienestar:\n\n';
  groupedItems.forEach(item => {
    message += `• ${item.name} (${item.presentation}) x${item.quantity} - S/. ${(item.price * item.quantity).toFixed(2)}\n`;
  });
  message += `\nTotal: S/. ${total.toFixed(2)}\n\nPor favor, confirma el envío y el método de pago.`;

  // Abrir WhatsApp
  window.open('https://wa.me/51900000000?text=' + encodeURIComponent(message), '_blank');
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = cart.length;
  }
}

/* ========================================
   INICIALIZACIÓN
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  loadCart();

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      nav.classList.toggle('active');
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }

  // Header scroll
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Button cart redirection
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      window.location.href = 'cart.html';
    });
  }
});
