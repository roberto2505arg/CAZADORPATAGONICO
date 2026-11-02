/* ==========================================================
   CAZADOR PATAGÓNICO - LÓGICA DEL CARRITO DE COMPRAS Y PAGOS
   ========================================================== */

const CP_WHATSAPP_PHONE = "5492974802505";
const CART_STORAGE_KEY = "cp_patagonico_cart_v1";
const TARIFAPLANA_ENVIO = 15000;
const DESCUENTO_TRANSFERENCIA = 0.08;

let cartItems = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];

const cartBtn = document.getElementById("cp-cart-btn");
const cartModal = document.getElementById("cp-cart-modal");
const cartCloseBtn = document.getElementById("cp-cart-close-btn");
const cartCloseOverlay = document.getElementById("cp-cart-close-overlay");
const cartCountElem = document.getElementById("cp-cart-count");
const cartItemsContainer = document.getElementById("cp-cart-items");
const cartTotalPriceElem = document.getElementById("cp-cart-total-price");
const sendWhatsappBtn = document.getElementById("cp-send-whatsapp-btn");
const clearCartBtn = document.getElementById("cp-clear-cart-btn");

document.addEventListener("DOMContentLoaded", () => {
    updateCartUI();
    initEventListeners();
});

function initEventListeners() {
    if (cartBtn) {
        cartBtn.addEventListener("click", (e) => {
            e.preventDefault();
            openCartModal();
        });
    }

    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartModal);
    if (cartCloseOverlay) cartCloseOverlay.addEventListener("click", closeCartModal);

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

    if (sendWhatsappBtn) {
        sendWhatsappBtn.addEventListener("click", sendOrderToWhatsApp);
    }

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
    mostrarAvisoAgregado(product.title);
}

function mostrarAvisoAgregado(nombreProducto) {
    const viejoAviso = document.getElementById("cp-toast-aviso");
    if (viejoAviso) viejoAviso.remove();

    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const toast = document.createElement("div");
    toast.id = "cp-toast-aviso";
    toast.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
            <div>
                <i class="fa-solid fa-cart-shopping" style="color: #d4a359; margin-right: 8px;"></i>
                <b style="color: #fff;">¡Producto sumado!</b>
                <div style="font-size: 0.8rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;">${nombreProducto}</div>
            </div>
            <button onclick="openCartModal(); document.getElementById('cp-toast-aviso').remove();" style="background: #d4a359; color: #0d0e10; border: none; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">
                Ver Carrito (${totalCount})
            </button>
        </div>
    `;
    toast.style.cssText = `
        position: fixed;
        bottom: 25px;
        right: 25px;
        background: #1b1e23;
        border: 1px solid #d4a359;
        color: #e6edf3;
        padding: 12px 18px;
        border-radius: 8px;
        z-index: 99999;
        box-shadow: 0 10px 25px rgba(0,0,0,0.7);
        font-family: inherit;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, 4000);
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

function openCartModal() {
    if (cartModal) {
        const viejoAviso = document.getElementById("cp-toast-aviso");
        if (viejoAviso) viejoAviso.remove();

        // Ocultar caja de transferencia al abrir de nuevo
        const transferBox = document.getElementById("cp-transfer-box");
        if (transferBox) transferBox.style.display = "none";

        const currentUserData = JSON.parse(localStorage.getItem("cp_patagonico_current_user_v1"));
        if (currentUserData) {
            const nameInput = document.getElementById("cp-client-name");
            const cityInput = document.getElementById("cp-client-city");
            if (nameInput && !nameInput.value) nameInput.value = currentUserData.name;
            if (cityInput && !cityInput.value) cityInput.value = currentUserData.address;
        }

        cartModal.classList.add("active");
        cartModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
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
    const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    if (cartCountElem) {
        cartCountElem.textContent = totalCount;
    }

    const productsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = cartItems.length > 0 ? TARIFAPLANA_ENVIO : 0;
    const totalMoney = productsTotal + shippingCost;
    const descuentoMonto = productsTotal * DESCUENTO_TRANSFERENCIA;
    const totalConDescuento = (productsTotal - descuentoMonto) + shippingCost;

    if (cartTotalPriceElem) {
        cartTotalPriceElem.innerHTML = `
            <div>$${totalMoney.toLocaleString('es-AR')} ARS <span style="font-size:0.75rem; color:#94a3b8; font-weight:normal;">(Mercado Pago)</span></div>
            <div style="color: #22c55e; font-size: 1.1rem; margin-top: 2px;">$${totalConDescuento.toLocaleString('es-AR')} ARS <span style="font-size:0.7rem; background:rgba(34,197,94,0.15); padding:2px 5px; border-radius:3px;">8% OFF Transferencia</span></div>
        `;
    }

    if (!cartItemsContainer) return;

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cp-cart-empty" style="text-align: center; color: #a0a5ab; padding: 30px 0;">
                <i class="fa-solid fa-basket-shopping" style="font-size: 2.5rem; margin-bottom: 10px; color: #353a3e;"></i>
                <p style="font-weight: bold; color: #fff;">Tu carrito está vacío</p>
                <span style="font-size: 0.85rem;">Explora el catálogo y suma tu equipamiento.</span>
            </div>
        `;
        return;
    }

    let itemsHtml = cartItems.map(item => `
        <div class="cp-cart-item" style="display: flex; gap: 12px; align-items: center; background: #141617; padding: 10px; border-radius: 6px; border: 1px solid #2e3235;">
            <img src="${item.img}" alt="${item.title}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1;">
                <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 4px;">${item.title}</h4>
                <div style="font-size: 0.85rem; color: #d4a359; font-weight: bold;">$${(item.price * item.quantity).toLocaleString('es-AR')} ARS</div>
                <div style="display: flex; gap: 8px; align-items: center; margin-top: 6px;">
                    <button onclick="updateQuantity('${item.id}', -1)" style="background: #25282a; border: 1px solid #3c4247; color: #fff; width: 22px; height: 22px; border-radius: 3px; cursor: pointer;">-</button>
                    <span style="font-size: 0.9rem;">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', 1)" style="background: #25282a; border: 1px solid #3c4247; color: #fff; width: 22px; height: 22px; border-radius: 3px; cursor: pointer;">+</button>
                    <button onclick="removeItem('${item.id}')" style="background: transparent; border: none; color: #d9534f; cursor: pointer; margin-left: auto;" title="Eliminar">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join("");

    itemsHtml += `
        <div class="cp-cart-shipping-info" style="display: flex; gap: 12px; align-items: center; background: #1b1e23; padding: 10px; border-radius: 6px; border: 1px dashed #d4a359;">
            <div style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; background: rgba(212,163,89,0.1); border-radius: 4px; color: #d4a359; font-size: 1.2rem;">
                <i class="fa-solid fa-truck-fast"></i>
            </div>
            <div style="flex: 1;">
                <h4 style="font-size: 0.9rem; color: #fff; margin-bottom: 2px;">Envío a Domicilio (Tarifa Plana)</h4>
                <div style="font-size: 0.85rem; color: #d4a359; font-weight: bold;">$${TARIFAPLANA_ENVIO.toLocaleString('es-AR')} ARS</div>
            </div>
        </div>
    `;

    cartItemsContainer.innerHTML = itemsHtml;
}

function sendOrderToWhatsApp() {
    if (cartItems.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const nameInput = document.getElementById("cp-client-name");
    const cityInput = document.getElementById("cp-client-city");

    const clientName = nameInput ? nameInput.value.trim() : "";
    const clientCity = cityInput ? cityInput.value.trim() : "";

    if (!clientName || !clientCity) {
        alert("Por favor completa tu Nombre y Ciudad para continuar.");
        return;
    }

    const productsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const descuentoMonto = productsTotal * DESCUENTO_TRANSFERENCIA;
    const totalTransferencia = (productsTotal - descuentoMonto) + TARIFAPLANA_ENVIO;

    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    let message = `*¡Hola Cazador Patagónico! Realicé una transferencia bancaria (8% OFF):*\n\n`;
    message += `🛒 *ORDEN N° #CP-${orderNumber}*\n`;
    message += `👤 *Cliente:* ${clientName}\n`;
    message += `📍 *Ubicación:* ${clientCity}\n\n`;
    message += `📦 *Detalle del Pedido:*\n`;

    cartItems.forEach(item => {
        const subtotal = item.price * item.quantity;
        message += `• ${item.quantity}x ${item.title} - $${subtotal.toLocaleString('es-AR')} ARS\n`;
    });

    message += `• Envío a Domicilio (Tarifa Plana) - $${TARIFAPLANA_ENVIO.toLocaleString('es-AR')} ARS\n`;
    message += `🎁 *Descuento 8% Transferencia:* -$${descuentoMonto.toLocaleString('es-AR')} ARS\n`;
    message += `\n💰 *Total Abonado:* $${totalTransferencia.toLocaleString('es-AR')} ARS\n\n`;
    message += `*Adjunto mi comprobante de pago.*`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/5492974802505?text=${encodedMessage}`;

    const whatsappLinkFinal = document.getElementById("cp-whatsapp-link-final");
    if (whatsappLinkFinal) {
        whatsappLinkFinal.href = whatsappUrl;
    }

    const transferBox = document.getElementById("cp-transfer-box");
    if (transferBox) {
        transferBox.style.display = "block";
    }
}

function pagarConMercadoPago() {
    if (cartItems.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const nameInput = document.getElementById("cp-client-name");
    const cityInput = document.getElementById("cp-client-city");

    const clientName = nameInput ? nameInput.value.trim() : "";
    const clientCity = cityInput ? cityInput.value.trim() : "";

    if (!clientName || !clientCity) {
        alert("Por favor completa tu Nombre y Ciudad antes de continuar con el pago.");
        return;
    }

    const productsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const totalMoney = productsTotal + TARIFAPLANA_ENVIO;
    const montoFormateado = `$${totalMoney.toLocaleString('es-AR')} ARS`;

    navigator.clipboard.writeText(totalMoney.toString()).catch(() => {});

    closeCartModal();

    const modalRedirect = document.getElementById("cp-mp-redirect-modal");
    const amountSpan = document.getElementById("cp-mp-modal-amount");

    if (modalRedirect && amountSpan) {
        amountSpan.textContent = montoFormateado;
        modalRedirect.style.display = "flex";
        modalRedirect.classList.add("active");
        modalRedirect.setAttribute("aria-hidden", "false");
    }
}

function cerrarModalMP() {
    const modalRedirect = document.getElementById("cp-mp-redirect-modal");
    if (modalRedirect) {
        modalRedirect.classList.remove("active");
        modalRedirect.style.display = "none";
        modalRedirect.setAttribute("aria-hidden", "true");
    }
}

function continuarAMercadoPago() {
    const mercadoPagoUrl = "https://link.mercadopago.com.ar/cazadorpatagonico";
    window.open(mercadoPagoUrl, '_blank');
    cerrarModalMP();
}