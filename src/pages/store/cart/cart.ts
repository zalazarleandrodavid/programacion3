import products from "../../../data/products.json";
import type { CartItem } from "../../../types/product";
import { logout, protectRoute } from "../../../utils/auth";

protectRoute();

const container = document.getElementById("cart-items-container") as HTMLElement;
const subtotalDisplay = document.getElementById("cart-subtotal-amount") as HTMLElement;
const totalDisplay = document.getElementById("cart-total-amount") as HTMLElement;
const btnCheckout = document.getElementById("btn-checkout") as HTMLButtonElement;
const btnClearCart = document.getElementById("btn-clear-cart") as HTMLButtonElement;
const btnLogout = document.getElementById("logout-btn") as HTMLButtonElement;

// Actualizar badge del header
const updateHeaderBadge = (cart: CartItem[]) => {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    badge.textContent = totalItems.toString();
    badge.style.display = totalItems > 0 ? "flex" : "none";
};

// Renderizar carrito
const renderCart = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    updateHeaderBadge(cart);

    if (cart.length === 0) {
        container.innerHTML = `<h3>Tu carrito está vacío</h3><a href="../home/home.html">Volver al catálogo</a>`;
        subtotalDisplay.textContent = "$0";
        totalDisplay.textContent = "$0";
        return;
    }

    let subtotal = 0;
    container.innerHTML = "<h2>Tu selección de productos</h2>";

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;

        subtotal += item.precio * item.cantidad;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" class="cart-item-image">
            <div class="item-info">
                <h3>${product.nombre}</h3>
                <p>Precio: $${item.precio.toLocaleString("es-AR")}</p>
            </div>
            <div class="item-actions">
                <button class="btn-minus" data-id="${item.id}">-</button>
                <span>${item.cantidad}</span>
                <button class="btn-plus" data-id="${item.id}">+</button>
                <button class="btn-trash" data-id="${item.id}">🗑️</button>
            </div>
        `;
        container.appendChild(div);
    });

    // Cálculo final con Envío
    const shippingCost = 500;
    subtotalDisplay.textContent = `$${subtotal.toLocaleString("es-AR")}`;
    totalDisplay.textContent = `$${(subtotal + shippingCost).toLocaleString("es-AR")}`;

    setupEvents();
};

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

const updateQuantity = (id: number, change: number) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const item = cart.find(p => p.id === id);
    const product = products.find(p => p.id === id);

    if (!item || !product) return;

    const newQty = item.cantidad + change;
    if (newQty > product.stock) {
        alert(`Solo hay ${product.stock} unidades disponibles`);
        return;
    }

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

btnClearCart?.addEventListener("click", () => {
    if (confirm("¿Vaciar carrito?")) {
        localStorage.removeItem("cart");
        renderCart();
    }
});

btnCheckout?.addEventListener("click", () => {
    alert("Compra realizada correctamente");
    localStorage.removeItem("cart");
    window.location.href = "../home/home.html";
});

btnLogout?.addEventListener("click", logout);

renderCart();