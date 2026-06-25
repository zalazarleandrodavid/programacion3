import { logout, protectRoute } from "../../../utils/auth";
import type { CartItem } from "../../../types/product";

// Proteger la ruta de acceso
protectRoute();

// =====================
// REFERENCIAS DOM
// =====================
const productsGrid = document.getElementById("products-grid") as HTMLElement;
const categoryList = document.getElementById("category-list") as HTMLElement;
const categoryTitle = document.getElementById("category-title") as HTMLElement;
const productsCounter = document.getElementById("products-counter") as HTMLElement;
const inputSearch = document.getElementById("input-search") as HTMLInputElement;
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;
const logoutBtn = document.getElementById("logout-btn") as HTMLButtonElement;
const btnReset = document.getElementById("btn-reset") as HTMLButtonElement;
const cartCountBadge = document.getElementById("cart-count") as HTMLElement;
const adminLink = document.getElementById("admin-link") as HTMLElement;

// =====================
// ESTADO
// =====================
let allProducts: any[] = []; // Base de datos maestra
let filteredProducts: any[] = []; // Lista filtrada actual
let selectedCategory = "todos";

// =====================
// INICIALIZACIÓN
// =====================
const init = async () => {
    try {
        // Carga de datos
        const [prodRes, catRes] = await Promise.all([
            fetch('/data/products.json'),
            fetch('/data/categorias.json')
        ]);

        if (!prodRes.ok || !catRes.ok) throw new Error("Error en la carga de datos");

        allProducts = await prodRes.json();
        const categoriesData = await catRes.json();

        // Inicializamos con todos los productos
        filteredProducts = [...allProducts];

        renderCategories(categoriesData);
        renderProducts(filteredProducts);
        updateHeaderBadge();
        verifyAdminAccess();

    } catch (error) {
        console.error("Error al cargar:", error);
        productsGrid.innerHTML = `<p style="padding:20px;">Error al cargar el menú. Por favor intenta de nuevo.</p>`;
    }
};

// =====================
// LÓGICA DE FILTROS Y ORDEN
// =====================
const applyFilters = () => {
    const searchTerm = inputSearch.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Filtrar por categoría y buscador
    filteredProducts = allProducts.filter(product => {
        const matchCategory = selectedCategory === "todos" || product.categoria === selectedCategory;
        const matchSearch = product.nombre.toLowerCase().includes(searchTerm) || 
                            product.descripcion.toLowerCase().includes(searchTerm);
        return matchCategory && matchSearch;
    });
    
    // Aplicar ordenamiento
    applySort();
    
    // Renderizar
    renderProducts(filteredProducts);
};

const applySort = () => {
    const sortValue = sortSelect.value;
    if (!sortValue) return;

    filteredProducts.sort((a, b) => {
        switch(sortValue) {
            case "az": return a.nombre.localeCompare(b.nombre);
            case "za": return b.nombre.localeCompare(a.nombre);
            case "priceAsc": return a.precio - b.precio;
            case "priceDesc": return b.precio - a.precio;
            default: return 0;
        }
    });
};

const resetFilters = () => {
    selectedCategory = "todos";
    inputSearch.value = "";
    sortSelect.value = "";
    
    // Resetear UI
    document.querySelectorAll(".category-item").forEach(i => i.classList.remove("active"));
    document.querySelector('[data-category="todos"]')?.classList.add("active");
    categoryTitle.textContent = "Todos los productos";
    
    filteredProducts = [...allProducts];
    renderProducts(filteredProducts);
};

// =====================
// RENDERIZADO
// =====================
const renderProducts = (productsToRender: any[]) => {
    productsGrid.innerHTML = "";
    
    if (productsToRender.length === 0) {
        productsGrid.innerHTML = `<div style="padding:30px;text-align:center;"><h3>No se encontraron productos</h3></div>`;
    }

    productsToRender.forEach(product => {
        const card = document.createElement("div");
        card.classList.add("product-card");

        // Lógica de disponibilidad
        const isAvailable = product.estado === "disponible" && product.stock > 0;
        const badgeClass = isAvailable ? "badge-available" : "badge-unavailable";
        const badgeText = isAvailable ? `Disponible (Stock: ${product.stock})` : "No disponible";

        card.innerHTML = `
            <img src="${product.imagen}" alt="${product.nombre}" style="cursor: pointer; width: 100%; height: 180px; object-fit: cover;">
            <div class="product-info">
                <h3>${product.nombre}</h3>
                <p>${product.descripcion}</p>
                <p class="price">$${product.precio.toLocaleString("es-AR")}</p>
                
                <span class="${badgeClass}" style="display:block; margin-bottom: 8px; font-size: 0.8em; font-weight: bold;">
                    ${badgeText}
                </span>

                <button class="btn-add" data-id="${product.id}" ${!isAvailable ? 'disabled' : ''}>
                    ${isAvailable ? 'Agregar al carrito' : 'Sin stock'}
                </button>
            </div>
        `;

        // Evento detalle
        card.querySelector("img")?.addEventListener("click", () => {
            localStorage.setItem("selectedProductId", product.id.toString());
            window.location.href = "/src/pages/store/producto_details/details.html";
        });

        // Evento agregar al carrito
        if (isAvailable) {
            card.querySelector(".btn-add")?.addEventListener("click", () => addToCart(product));
        }

        productsGrid.appendChild(card);
    });
    
    productsCounter.textContent = `${productsToRender.length} productos encontrados`;
};

const renderCategories = (categories: any[]) => {
    categoryList.innerHTML = `<li class="category-item active" data-category="todos">Todos</li>`;
    categories.forEach(cat => {
        categoryList.innerHTML += `<li class="category-item" data-category="${cat.nombre}">${cat.nombre}</li>`;
    });

    document.querySelectorAll(".category-item").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelectorAll(".category-item").forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            selectedCategory = item.getAttribute("data-category") || "todos";
            categoryTitle.textContent = selectedCategory === "todos" ? "Todos los productos" : selectedCategory;
            applyFilters();
        });
    });
};

// =====================
// CARRITO Y UTILIDADES
// =====================
const updateHeaderBadge = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    if(cartCountBadge) {
        cartCountBadge.textContent = totalItems.toString();
        cartCountBadge.style.display = totalItems > 0 ? "flex" : "none";
    }
};

const addToCart = (product: any) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.cantidad += 1;
    else cart.push({ ...product, cantidad: 1 });
    
    localStorage.setItem("cart", JSON.stringify(cart));
    updateHeaderBadge();
    alert(`${product.nombre} agregado al carrito`);
};

const verifyAdminAccess = () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (adminLink) adminLink.style.display = userData.rol === "admin" ? "inline-flex" : "none";
};

// =====================
// EVENTOS PRINCIPALES
// =====================
inputSearch.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", applyFilters);
btnReset.addEventListener("click", resetFilters);
logoutBtn.addEventListener("click", logout);

// Ejecución inicial
init();