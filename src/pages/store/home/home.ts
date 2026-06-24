import products from "../../../data/products.json";
import categories from "../../../data/categorias.json";
import users from "../../../data/users.json";
import { logout, protectRoute } from "../../../utils/auth";
import type { CartItem } from "../../../types/product";

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
let selectedCategory = "todos";
let filteredProducts = [...products];

// =====================
// LÓGICA DEL CARRITO
// =====================
const updateHeaderBadge = () => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalItems = cart.reduce((acc, item) => acc + item.cantidad, 0);
    if (cartCountBadge) {
        cartCountBadge.textContent = totalItems.toString();
        cartCountBadge.style.display = totalItems > 0 ? "flex" : "none";
    }
};

const addToCart = (product: any) => {
    const cart: CartItem[] = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        cart.push({ ...product, cantidad: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateHeaderBadge();
    alert(`${product.nombre} agregado al carrito`);
};

// =====================
// LÓGICA DE USUARIO Y ROL
// =====================
const verifyAdminAccess = () => {
    const adminLink = document.getElementById("admin-link") as HTMLElement;
    
    // Si el elemento no existe en el HTML, detenemos la función
    if (!adminLink) return; 

    const userDataString = localStorage.getItem("userData");

    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            
            // Convertimos a minúsculas para evitar errores de tipo "Admin" vs "admin"
            const userRole = userData.rol ? userData.rol.toLowerCase() : "";

            if (userRole === "admin") {
                adminLink.style.display = "inline-flex"; // O "block"
                console.log("Acceso admin: Botón visible.");
            } else {
                // IMPORTANTE: Aquí forzamos que se oculte si NO es admin
                adminLink.style.display = "none";
                console.log("Acceso usuario: Botón oculto.");
            }
        } catch (error) {
            console.error("Error al procesar userData:", error);
            adminLink.style.display = "none"; // Por seguridad, si falla el JSON, ocultamos
        }
    } else {
        // Si no hay datos de usuario, ocultamos
        adminLink.style.display = "none";
        console.log("No hay usuario logueado: Botón oculto.");
    }
};

// =====================
// FUNCIONES DE LÓGICA
// =====================
const normalizeText = (text: string): string => {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};

const updateCounter = () => {
  productsCounter.textContent = `${filteredProducts.length} productos encontrados`;
};

const applySort = () => {
  const sortValue = sortSelect.value;
  if (!sortValue) return;
  filteredProducts.sort((a, b) => {
    switch (sortValue) {
      case "az": return a.nombre.localeCompare(b.nombre);
      case "za": return b.nombre.localeCompare(a.nombre);
      case "priceAsc": return a.precio - b.precio;
      case "priceDesc": return b.precio - a.precio;
      default: return 0;
    }
  });
};

const applyFilters = () => {
  const searchTerm = normalizeText(inputSearch.value);
  filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === "todos" || product.categoria === selectedCategory;
    const matchSearch = normalizeText(product.nombre).includes(searchTerm) || 
                        normalizeText(product.descripcion).includes(searchTerm);
    return matchCategory && matchSearch;
  });
  applySort();
  renderProducts(filteredProducts);
};

const resetFilters = () => {
    selectedCategory = "todos";
    inputSearch.value = "";
    sortSelect.value = "";
    const items = document.querySelectorAll(".category-item");
    items.forEach(i => i.classList.remove("active"));
    document.querySelector('[data-category="todos"]')?.classList.add("active");
    categoryTitle.textContent = "Todos los productos";
    filteredProducts = [...products];
    renderProducts(filteredProducts);
};

// =====================
// RENDERIZADO
// =====================
const renderProducts = (productsToRender: typeof products) => {
  productsGrid.innerHTML = "";
  if (productsToRender.length === 0) {
    productsGrid.innerHTML = `<div style="padding:30px;text-align:center;"><h3>No se encontraron productos</h3></div>`;
    updateCounter();
    return;
  }
  productsToRender.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    const isAvailable = product.estado === "disponible";
    const badgeClass = isAvailable ? "badge-available" : "badge-unavailable";
    const badgeText = isAvailable ? `Disponible (Stock: ${product.stock})` : "No disponible";

    card.innerHTML = `
      <img src="${product.imagen}" alt="${product.nombre}" style="cursor: pointer;">
      <div class="product-info">
        <h3>${product.nombre}</h3>
        <p>${product.descripcion}</p>
        <p class="price">$${product.precio.toLocaleString("es-AR")}</p>
        <span class="${badgeClass}" style="display:block; margin-bottom: 10px;">${badgeText}</span>
        <button class="btn-add" data-id="${product.id}" ${!isAvailable ? 'disabled' : ''}>
            ${isAvailable ? 'Agregar al carrito' : 'Sin Stock'}
        </button>
      </div>
    `;

    card.querySelector("img")?.addEventListener("click", () => {
      localStorage.setItem("selectedProductId", product.id.toString());
      window.location.href = "/src/pages/store/producto_details/details.html";
    });

    if (isAvailable) {
        card.querySelector(".btn-add")?.addEventListener("click", (e) => {
            e.stopPropagation();
            addToCart(product);
        });
    }
    productsGrid.appendChild(card);
  });
  updateCounter();
};

const renderCategories = () => {
  categoryList.innerHTML = `<li class="category-item active" data-category="todos">Todos</li>`;
  categories.forEach(category => {
    categoryList.innerHTML += `<li class="category-item" data-category="${category.nombre}">${category.nombre}</li>`;
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
// EVENTOS PRINCIPALES
// =====================
inputSearch.addEventListener("input", applyFilters);
sortSelect.addEventListener("change", () => {
    applySort();
    renderProducts(filteredProducts);
});
btnReset?.addEventListener("click", resetFilters);
logoutBtn.addEventListener("click", logout);

// =====================
// INICIO
// =====================
renderCategories();
renderProducts(products);
updateHeaderBadge();
verifyAdminAccess(); // <--- Verificamos el rol al cargar