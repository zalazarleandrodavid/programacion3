import type { CartItem } from "./product";

// Obtener referencias a los elementos del DOM
const cartItemsContainer = document.getElementById('cart-items-container') as HTMLElement;
const totalAmountDisplay = document.getElementById('cart-total-amount') as HTMLElement;
const checkoutButton = document.getElementById('btn-checkout') as HTMLButtonElement;

/**
 * Actualiza el contador de ítems en el header de la página actual.
 * @param {CartItem[]} cart El array del carrito actual.
 */
const updateCartHeaderCount = (cart: CartItem[]) => {
    const countSpan = document.getElementById('cart-count');
    if (countSpan) {
        // Calcular la cantidad total de ítems
        const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
        
        countSpan.innerText = totalItems.toString();
        // Mostrar o ocultar el contador según si hay ítems
        countSpan.style.display = totalItems > 0 ? 'flex' : 'none';
    }
};

/**
 * Renderiza los productos actualmente en el carrito en la página.
 */
const renderCart = () => {
    // 1. Cargar el carrito desde localStorage
    const cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');

    // 2. Actualizar el contador del header en esta página
    updateCartHeaderCount(cart);

    // 3. Manejar el caso del carrito vacío
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <p style="margin-bottom: 20px; font-size: 1.2rem;">Tu carrito está vacío.</p>
                <a href="../home/home.html" class="nav-link-catalogo" style="display: inline-flex; min-width: auto;">
                    Volver al Catálogo
                </a>
            </div>
        `;
        if (totalAmountDisplay) totalAmountDisplay.innerText = "$ 0";
        if (checkoutButton) checkoutButton.style.display = 'none';
        return;
    }

    // 4. Si hay ítems, mostrar los productos
    if (checkoutButton) {
        checkoutButton.style.display = 'block';
    }
    
    cartItemsContainer.innerHTML = '';
    let total = 0;

    // 5. Recorrer el carrito para construir la vista y calcular el total
    cart.forEach(item => {
        total += item.precio * item.cantidad;

        // Crear el contenedor HTML para cada producto
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        // Estructura de la información del producto
        itemDiv.innerHTML = `
            <div class="item-info">
                <strong style="display: block; font-size: 1.1rem;">${item.nombre}</strong>
                <p class="price" style="margin: 5px 0;">$${item.precio.toLocaleString('es-AR')}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <!-- Controles de cantidad -->
                <div class="quantity-controls">
                    <button type="button" class="btn-qty btn-minus" data-id="${item.id}">-</button>
                    <span class="item-qty" style="font-weight: bold; min-width: 20px; text-align: center;">${item.cantidad}</span>
                    <button type="button" class="btn-qty btn-plus" data-id="${item.id}">+</button>
                </div>
                <!-- Botón de eliminar -->
                <button type="button" class="btn-trash" data-id="${item.id}" title="Eliminar">🗑️</button>
            </div>
        `;
        cartItemsContainer.appendChild(itemDiv);
    });

    // 6. Mostrar el total
    if (totalAmountDisplay) {
        totalAmountDisplay.innerText = `$ ${total.toLocaleString('es-AR')}`;
    }

    // 7. Configurar los eventos de los nuevos elementos
    setupCartEvents();
};

/**
 * Configura los eventos de los botones (aumentar, disminuir, eliminar) dentro del carrito.
 */
const setupCartEvents = () => {
    // Eventos para aumentar cantidad (+)
    document.querySelectorAll('.btn-plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const itemId = parseInt(target.dataset.id!);
            updateQuantity(itemId, 1);
        });
    });

    // Eventos para disminuir cantidad (-)
    document.querySelectorAll('.btn-minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const itemId = parseInt(target.dataset.id!);
            updateQuantity(itemId, -1);
        });
    });

    // Eventos para eliminar producto
    document.querySelectorAll('.btn-trash').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const itemId = parseInt(target.dataset.id!);
            removeFromCart(itemId);
        });
    });
};

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {number} id El ID del producto a modificar.
 * @param {number} change El cambio en la cantidad (positivo o negativo).
 */
const updateQuantity = (id: number, change: number) => {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(i => i.id === id);

    if (itemIndex !== -1) {
        cart[itemIndex].cantidad += change;

        // Si la cantidad llega a 0 o menos, se elimina del carrito
        if (cart[itemIndex].cantidad <= 0) {
            // Eliminar el ítem del array
            cart.splice(itemIndex, 1); 
        } else {
            // Guardar los cambios y re-renderizar
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCart();
        }
    }
};

/**
 * Elimina un producto por completo del carrito.
 * @param {number} id El ID del producto a eliminar.
 */
const removeFromCart = (id: number) => {
    let cart: CartItem[] = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Filtrar el carrito para remover el ítem con el ID dado
    const updatedCart = cart.filter(item => item.id !== id);
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    renderCart();
};

// --- Lógica de Checkout ---

// Evento de Checkout: Cuando se hace clic en el botón de checkout
checkoutButton?.addEventListener('click', () => {
    alert("¡Compra exitosa! Gracias por su pedido.");
    localStorage.removeItem('cart'); // Limpiar el carrito
    window.location.href = "../home/home.html"; // Redirigir al usuario a la página de inicio
});

// Inicialización: Llamar a la función principal para mostrar el carrito al cargar la página
renderCart();