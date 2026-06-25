import { checkAuth } from '../../../utils/authGuards.ts';

// Estado global local para el manejo de datos
let listaProductos: any[] = [];
let listaCategorias: any[] = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de seguridad de ruta protegida
    checkAuth();
    
    // 2. Vincular eventos globales del sistema (Logout)
    setupLogout();
    
    // 3. Consumir APIs simuladas (JSONs) y renderizar la interfaz
    await cargarDatosDashboard();
});

// =====================
// CONSUMO DE DATOS (FETCH)
// =====================
async function cargarDatosDashboard() {
    try {
        // REQUISITO: Fetch asíncrono a los JSON de la carpeta public/data
        const [respProd, respCat] = await Promise.all([
            fetch('/data/products.json'),
            fetch('/data/categorias.json')
        ]);

        if (!respProd.ok || !respCat.ok) {
            throw new Error("Error al obtener los datos de productos o categorías.");
        }

        listaProductos = await respProd.json();
        listaCategorias = await respCat.json();

        // Dibujar filas en la tabla del DOM
        renderProductos();

    } catch (error) {
        console.error("Error crítico al inicializar la tabla de productos:", error);
        const tbody = document.getElementById('productos-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center; color: #dc3545; font-weight: bold; padding: 20px;">
                        ⚠️ No se pudo conectar con el catálogo de productos.
                    </td>
                </tr>
            `;
        }
    }
}

// =====================
// RENDERIZADO DEL DOM
// =====================
function renderProductos() {
    const tbody = document.getElementById('productos-body') as HTMLTableSectionElement;
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpiar la tabla antes de rellenar

    // REQUISITO: Columnas obligatorias -> ID, imagen, nombre, descripción, precio, categoría, stock y estado
    listaProductos.forEach((p: any) => {
        // Buscar de forma segura la categoría vinculada por ID
        const categoriaObj = listaCategorias.find((c: any) => c.id === p.categoriaId);
        const nombreCat = categoriaObj ? categoriaObj.nombre : 'Sin Categoría';
        
        // Estilos dinámicos para los badges de estado
        const estadoClass = p.estado === 'disponible' ? 'status-disponible' : 'status-no-disponible';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.id}</td>
            <td>
                <img src="${p.imagen}" alt="${p.nombre}" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                     onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td><strong>${p.nombre}</strong></td>
            <td><small>${p.descripcion}</small></td>
            <td>$${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
            <td><span class="category-tag">${nombreCat}</span></td>
            <td>${p.stock} u.</td>
            <td><span class="status-badge ${estadoClass}">${p.estado}</span></td>
            <td>
                <button class="btn-action btn-edit" data-id="${p.id}" style="background:#ffc107; border:none; padding: 5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">Editar</button>
                <button class="btn-action btn-delete" data-id="${p.id}" style="background:#dc3545; color:white; border:none; padding: 5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Registrar escuchadores de eventos sobre los nuevos botones generados
    setupTableActions();
}

// =====================
// MANEJO DE ACCIONES (EVENT LISTENERS)
// =====================
function setupTableActions() {
    // Escuchas dinámicas para la acción de Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            alert(`Editar producto con ID: ${id}`);
        });
    });

    // Escuchas dinámicas para la acción de Eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            eliminarProducto(id);
        });
    });
}

// Acción simulada de eliminación local reactiva
function eliminarProducto(id: number) {
    if (confirm(`¿Estás seguro de que deseas dar de baja el producto con ID ${id}?`)) {
        // Filtrar y remover de la memoria local
        listaProductos = listaProductos.filter(p => p.id !== id);
        
        // Volver a renderizar la UI con la lista actualizada en tiempo real
        renderProductos();
        alert(`Producto ${id} removido visualmente del listado.`);
    }
}

// =====================
// AUTENTICACIÓN
// =====================
function setupLogout() {
    const btnLogout = document.querySelector('.admin-nav-logout-btn') as HTMLButtonElement;
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login.html';
        });
    }
}