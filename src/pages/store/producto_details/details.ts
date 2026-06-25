import type { CartItem } from "../../../types/product";
import { logout, protectRoute } from "../../../utils/auth";

protectRoute();

// =====================
// REFERENCIAS DOM
// =====================
const productImage = document.getElementById("product-image") as HTMLImageElement;
const productName = document.getElementById("product-name") as HTMLElement;
const productDescription = document.getElementById("product-description") as HTMLElement;
const productPrice = document.getElementById("product-price") as HTMLElement;
const productStock = document.getElementById("product-stock") as HTMLElement;
const productStatus = document.getElementById("product-status") as HTMLElement;
const quantityInput = document.getElementById("quantity") as HTMLInputElement;
const btnAddCart = document.getElementById("btn-add-cart") as HTMLButtonElement;
const message = document.getElementById("message") as HTMLParagraphElement;
const btnLogout = document.getElementById("logout-btn") as HTMLButtonElement | null;
const btnBack = document.getElementById("btn-back") as HTMLButtonElement | null; // Botón volver

// =====================
// ESTADO
// =====================
let currentProduct: any = null;

// =====================
// INICIALIZACIÓN
// =====================
const init = async () => {
    const productId = Number(localStorage.getItem("selectedProductId"));
    
    if (!productId) {
        alert("No se seleccionó ningún producto.");
        window.location.href = "../home/home.html";
        return;
    }

    try {
        // REQUISITO: Fetch asíncrono en lugar de import estático
        const res = await fetch('/data/products.json');
        if (!res.ok) throw new Error("Error al cargar la base de datos de productos");
        
        const products: any[] = await res.json();
        
        // REQUISITO: Filtrar por el ID seleccionado
        currentProduct = products.find(p => p.id === productId);

        if (!currentProduct) {
            alert("Producto no encontrado en el catálogo.");
            window.location.href = "../home/home.html";
            return;
        }

        renderDetails();
        updateCartBadge();

    } catch (error) {
        console.error("Error:", error);
        if (message) message.textContent = "❌ Error al cargar los detalles del producto.";
    }
};

// =====================
// RENDERIZADO
// =====================
const renderDetails = () => {
    // REQUISITO: Mostrar todos los datos requeridos
    productImage.src = currentProduct.imagen;
    productImage.alt = currentProduct.nombre;
    productName.textContent = currentProduct.nombre;
    productDescription.textContent = currentProduct.descripcion;
    productPrice.textContent = `$${currentProduct.precio.toLocaleString("es-AR")}`;
    productStock.textContent = String(currentProduct.stock);
    productStatus.textContent = currentProduct.estado;

    // REQUISITO: Deshabilitar si estado !== disponible o stock es 0
    const isAvailable = currentProduct.estado === "disponible" && currentProduct.stock > 0;
    
    if (!isAvailable) {
        btnAddCart.disabled = true;
        btnAddCart.textContent = "Sin Stock / No Disponible";
        quantityInput.disabled = true;
        quantityInput.value = "0";
    }
};

// =====================
// UTILIDADES
// =====================
const updateCartBadge = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartCount = document.getElementById("cart-count");
    if (!cartCount) return;

    const totalItems = cart.reduce((total, item) => total + item.cantidad, 0);
    cartCount.textContent = totalItems.toString();
    cartCount.style.display = totalItems > 0 ? "inline-flex" : "none";
};

// =====================
// AGREGAR AL CARRITO
// =====================
btnAddCart.addEventListener("click", () => {
    if (!currentProduct) return;

    const quantity = Number(quantityInput.value);

    // REQUISITO: Validación de cantidad mínima
    if (quantity <= 0) {
        message.style.color = "#ff4757";
        message.textContent = "⚠ La cantidad debe ser mayor a 0";
        return;
    }

    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingProduct = cart.find(item => item.id === currentProduct.id);
    
    const cantidadEnCarrito = existingProduct ? existingProduct.cantidad : 0;
    const cantidadTotalPostAgregar = cantidadEnCarrito + quantity;

    // REQUISITO: Validación estricta de stock disponible (incluyendo lo ya acumulado en el carrito)
    if (cantidadTotalPostAgregar > currentProduct.stock) {
        message.style.color = "#ff4757";
        if (cantidadEnCarrito > 0) {
            message.textContent = `⚠ Ya tienes ${cantidadEnCarrito} unidades en el carrito. Solo puedes agregar ${currentProduct.stock - cantidadEnCarrito} más.`;
        } else {
            message.textContent = `⚠ Solo hay ${currentProduct.stock} unidades disponibles.`;
        }
        return;
    }

    // Guardar cambios
    if (existingProduct) {
        existingProduct.cantidad += quantity;
    } else {
        cart.push({
            ...currentProduct,
            cantidad: quantity
        });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();

    // REQUISITO: Mensaje de confirmación impecable
    message.style.color = "#2ed573";
    message.textContent = "✅ Producto agregado al carrito con éxito.";
    quantityInput.value = "1";
});

// =====================
// EVENTOS DE NAVEGACIÓN
// =====================
btnBack?.addEventListener("click", () => {
    window.location.href = "../home/home.html";
});

btnLogout?.addEventListener("click", logout);

// Inicializar el flujo de la pantalla
init();