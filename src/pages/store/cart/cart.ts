import type { CartItem } from "../../../types/product";
import { logout, protectRoute } from "../../../utils/auth";

protectRoute();

// =====================
// CONFIGURACIÓN
// =====================
// Constante fija definida en el frontend. ¡Documentar en README.md!
const COSTO_ENVIO = 500; 

// =====================
// REFERENCIAS DOM
// =====================
const container = document.getElementById("cart-items-container") as HTMLElement;
const subtotalDisplay = document.getElementById("cart-subtotal-amount") as HTMLElement;
const shippingDisplay = document.getElementById("cart-shipping-amount") as HTMLElement;
const totalDisplay = document.getElementById("cart-total-amount") as HTMLElement;
const btnCheckout = document.getElementById("btn-checkout") as HTMLButtonElement;
const btnClearCart = document.getElementById("btn-clear-cart") as HTMLButtonElement;
const btnLogout = document.getElementById("logout-btn") as HTMLButtonElement;

// =====================
// ESTADO MASTER
// =====================
let allProducts: any[] = []; 

// =====================
// INICIALIZACIÓN
// =====================
const init = async () => {
    try {
        // Obtenemos los productos actualizados para validar el stock real
        const res = await fetch('/data/products.json');
        if (!res.ok) throw new Error("No se pudo cargar la base de productos");
        
        allProducts = await res.json();
        renderCart();
    } catch (error) {
        console.error("Error al iniciar el carrito:", error);
        container.innerHTML = `<p>Error al cargar los datos. Verifica tu conexión.</p>`;
    }
};

// =====================
// UTILIDADES
// =====================
const updateHeaderBadge = (cart: CartItem[]) => {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    badge.textContent = totalItems.toString();
    badge.style.display = totalItems > 0 ? "flex" : "none";
};

// =====================
// RENDERIZADO
// =====================
const renderCart = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    updateHeaderBadge(cart);

    // ESTADO VACÍO
    if (cart.length === 0) {
        container.innerHTML = `
            <h2>Tu selección de productos</h2>
            <div style="text-align:center; padding: 40px;">
                <h3 style="font-size: 1.5rem; margin-bottom: 10px;">Tu carrito está vacío 🛒</h3>
                <p style="margin-bottom: 20px;">¡Aún no has agregado nada delicioso!</p>
                <a href="../home/home.html" style="padding: 10px 20px; background-color: #ff4757; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Volver al catálogo
                </a>
            </div>
        `;
        subtotalDisplay.textContent = "$0";
        shippingDisplay.textContent = "$0"; // Actualizado a $0 si no hay productos
        totalDisplay.textContent = "$0";
        
        // Deshabilitar botones si está vacío
        if (btnCheckout) btnCheckout.disabled = true;
        if (btnClearCart) btnClearCart.disabled = true;
        return;
    }

    // Habilitar botones si hay elementos
    if (btnCheckout) btnCheckout.disabled = false;
    if (btnClearCart) btnClearCart.disabled = false;

    let subtotal = 0;
    container.innerHTML = "<h2 style='margin-bottom: 20px;'>Tu selección de productos</h2>";

    cart.forEach(item => {
        // Buscamos el producto en el JSON para validar stock e imagen
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return;

        // CÁLCULO: Precio total por producto
        const totalProducto = item.precio * item.cantidad;
        subtotal += totalProducto;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style.cssText = "display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px;";
        
        // RENDERIZADO: Imagen, nombre, precio unitario, precio total, controles y eliminar
        div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px; flex: 2;">
                <img src="${product.imagen}" alt="${product.nombre}" class="cart-item-image" style="width: 70px; height: 70px; object-fit: cover; border-radius: 5px;">
                <div class="item-info">
                    <h3 style="margin: 0 0 5px 0;">${product.nombre}</h3>
                    <p style="margin: 0; font-size: 0.9em; color: #666;">Unitario: $${item.precio.toLocaleString("es-AR")}</p>
                    <p style="margin: 5px 0 0 0; font-weight: bold; color: #2f3542;">Total: $${totalProducto.toLocaleString("es-AR")}</p>
                </div>
            </div>
            <div class="item-actions" style="display: flex; align-items: center; gap: 10px;">
                <button class="btn-minus" data-id="${item.id}" style="width:30px; height:30px; cursor:pointer;">-</button>
                <span style="font-weight:bold; min-width: 20px; text-align:center;">${item.cantidad}</span>
                <button class="btn-plus" data-id="${item.id}" style="width:30px; height:30px; cursor:pointer;">+</button>
                <button class="btn-trash" data-id="${item.id}" style="margin-left: 15px; background: none; border: none; font-size: 1.2rem; cursor: pointer;" title="Eliminar del carrito">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    // CÁLCULO FINAL: Subtotal + Envío reflejados en la interfaz
    subtotalDisplay.textContent = `$${subtotal.toLocaleString("es-AR")}`;
    shippingDisplay.textContent = `$${COSTO_ENVIO.toLocaleString("es-AR")}`; // Muestra los $500 configurados
    totalDisplay.textContent = `$${(subtotal + COSTO_ENVIO).toLocaleString("es-AR")}`;

    setupEvents();
};

// =====================
// LÓGICA DE ACTUALIZACIÓN
// =====================
const updateQuantity = (id: number, change: number) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find(p => p.id === id);
    const product = allProducts.find(p => p.id === id);

    if (!item || !product) return;

    const newQty = item.cantidad + change;
    
    // VALIDACIÓN: Control de stock
    if (newQty > product.stock) {
        alert(`Lo sentimos, solo tenemos ${product.stock} unidades disponibles de ${product.nombre}`);
        return;
    }

    // Si llega a 0, se elimina
    if (newQty <= 0) {
        removeItem(id);
        return;
    }

    item.cantidad = newQty;
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
};

const removeItem = (id: number) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const updated = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
    renderCart();
};

// =====================
// MANEJO DE EVENTOS
// =====================
const setupEvents = () => {
    document.querySelectorAll(".btn-plus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            updateQuantity(id, 1);
        });
    });

    document.querySelectorAll(".btn-minus").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            updateQuantity(id, -1);
        });
    });

    document.querySelectorAll(".btn-trash").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            removeItem(id);
        });
    });
};

// Eventos Globales
btnClearCart?.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (cart.length === 0) return;
    
    if (confirm("¿Estás seguro de que deseas vaciar tu carrito?")) {
        localStorage.removeItem("cart");
        renderCart();
    }
});

btnCheckout?.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    
    if (cart.length === 0) {
        alert("Tu carrito está vacío. Agrega productos antes de comprar.");
        return;
    }

    alert("¡Compra confirmada exitosamente! Tu pedido está en preparación.");
    localStorage.removeItem("cart");
    window.location.href = "../home/home.html";
});

btnLogout?.addEventListener("click", logout);

// Ejecutar todo al cargar la página
init();