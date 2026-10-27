/* ==========================================================
   CAZADOR PATAGÓNICO - LÓGICA DEL CARRITO DE COMPRAS
   ========================================================== */

// Configuración: Número de WhatsApp donde llegarán los pedidos (sin '+' ni espacios)
const CP_WHATSAPP_PHONE = "5492974802505"; // Reemplaza con tu número real de WhatsApp

// Clave para guardar en LocalStorage
const CART_STORAGE_KEY = "cp_patagonico_cart_v1";

// Estado local del carrito
let cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

// Elementos del DOM
const cartBtn = document.getElementById("cp-cart-btn");
const cartModal = document.getElementById("cp-cart-modal");
const cartCloseBtn = document.getElementById("cp-cart-close-btn");
const cartCloseOverlay = document.getElementById("cp-cart-close-overlay");
const cartCountElem = document.getElementById("cp-cart-count");
const cartItemsContainer = document.getElementById("cp-cart-items");
const cartTotalPriceElem = document.getElementById("cp-cart-total-price");
const sendWhatsappBtn = document.getElementById("cp-send-whatsapp-btn");
const clearCartBtn = document.getElementById("cp-clear-cart-btn");

/* ----------------------------------------------------------
   1. INICIALIZACIÓN
   ---------------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    initEventListeners();
});

/* ----------------------------------------------------------
   2. EVENT LISTENERS Y EVENTOS GLOBALES
   ---------------------------------------------------------- */
function initEventListeners() {
    // Abrir modal de carrito
    if (cartBtn) {
        cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openCartModal();
        });
    }

    // Cerrar modal
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartModal);
    if (cartCloseOverlay) cartCloseOverlay.addEventListener("click", closeCartModal);

    // Vaciar carrito
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", () => {
            if (cartItems.length === 0) return;
            if (confirm("¿Estás seguro de vaciar el carrito?")) {
                cartItems = [];
                saveCart();
                updateCartUI();
            }
        });
    }

    // Enviar pedido por WhatsApp
    if (sendWhatsappBtn) {
        sendWhatsappBtn.addEventListener("click", sendOrderToWhatsApp);
    }

    // Event Listener global para capturar clics en los botones "Añadir al Carrito"
    document.addEventListener("click", (e) => {
        const addBtn = e.target.closest(".cp-btn-add-cart");
        if (addBtn) {
            e.preventDefault();
            const id = addBtn.dataset.id;
            const title = addBtn.dataset.title;
            const price = parseFloat(addBtn.dataset.price);
            const img = addBtn.dataset.img;

            if (id && title && !isNaN(price)) {
                addToCart({ id, title, price, img });
            }
        }
    });
}

/* ----------------------------------------------------------
   3. GESTIÓN DEL ESTADO DEL CARRITO
   ---------------------------------------------------------- */
function addToCart(product) {
    const existingIndex = cartItems.findIndex(item => item.id === product.id);

    if (existingIndex > -1) {
        cartItems[existingIndex].quantity += 1;
    } else {
        cartItems.push({
            id: product.id,
            title: product.title,
            price: product.price,
            img: product.img || 'imagen/mochilas.jfif',
            quantity: 1
        });
    }

    saveCart();
    updateCartUI();
    openCartModal();
}

function updateQuantity(id, change) {
    const index = cartItems.findIndex(item => item.id === id);
    if (index > -1) {
        cartItems[index].quantity += change;
        if (cartItems[index].quantity <= 0) {
            cartItems.splice(index, 1);
        }
        saveCart();
        updateCartUI();
    }
}

function removeItem(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
}

/* ----------------------------------------------------------
   4. RENDERIZADO Y MODAL
   ---------------------------------------------------------- */
function openCartModal() {
    if (cartModal) {
        cartModal.classList.add("active");
        cartModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden"; // Previene scroll del fondo
    }
}

function closeCartModal() {
    if (cartModal) {
        cartModal.classList.remove("active");
        cartModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

function updateCartUI() {
    // 1. Actualizar el contador del badge en el Navbar
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountElem) {
        cartCountElem.textContent = totalCount;
    }

    // 2. Calcular total de dinero
    const totalMoney = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    if (cartTotalPriceElem) {
        cartTotalPriceElem.textContent = `$${totalMoney.toLocaleString('es-AR')} ARS`;
    }

    // 3. Renderizar items en la ventana lateral
    if (!cartItemsContainer) return;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cp-cart-empty">
                <i class="fa-solid fa-basket-shopping"></i>
                <p>Tu carrito está vacío</p>
                <span>Explora el catálogo y suma tu equipamiento.</span>
            </div>
        `;
        return;
    }

    cartItemsContainer.innerHTML = cartItems.map(item => `
        <div class="cp-cart-item">
            <img src="${item.img}" alt="${item.title}" class="cp-cart-item-img">
            <div class="cp-cart-item-details">
                <h4 class="cp-cart-item-title">${item.title}</h4>
                <div class="cp-cart-item-price">$${(item.price * item.quantity).toLocaleString('es-AR')} ARS</div>
                <div class="cp-cart-item-controls">
                    <button class="cp-qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="cp-qty-val">${item.quantity}</span>
                    <button class="cp-qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button class="cp-remove-btn" onclick="removeItem('${item.id}')" title="Eliminar del carrito">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

/* ----------------------------------------------------------
   5. ENVÍO DE PEDIDO POR WHATSAPP
   ---------------------------------------------------------- */
function sendOrderToWhatsApp() {
    if (cartItems.length === 0) {
        alert("El carrito está vacío. Agrega productos antes de realizar tu pedido.");
        return;
    }

    const nameInput = document.getElementById("cp-client-name");
    const cityInput = document.getElementById("cp-client-city");

    const clientName = nameInput ? nameInput.value.trim() : "";
    const clientCity = cityInput ? cityInput.value.trim() : "";

    if (!clientName || !clientCity) {
        alert("Por favor completa tu Nombre y Ciudad para coordinar la compra.");
        return;
    }

    // Construcción del mensaje formateado
    const orderNumber = Math.floor(1000 + Math.random() * 9000); // Número de orden aleatorio
    let message = `*¡Hola Cazador Patagónico! Quisiera realizar el siguiente pedido:*\n\n`;
    message += `🛒 *ORDEN N° #CP-${orderNumber}*\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    message += `📍 *Ubicación:* ${clientCity}\n\n`;
    message += `📦 *Detalle del Pedido:*\n`;

    let total = 0;
    cartItems.forEach(item => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `• ${item.quantity}x ${item.title} - $${subtotal.toLocaleString('es-AR')} ARS\n`;
    });

    message += `\n💰 *Total a abonar:* $${total.toLocaleString('es-AR')} ARS\n\n`;
    message += `*¿Cómo coordinamos el pago y envío?*`;

    // Codificación para URL de WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${CP_WHATSAPP_PHONE}?text=${encodedMessage}`;

    // Abrir WhatsApp en pestaña nueva
    window.open(whatsappUrl, '_blank');
}