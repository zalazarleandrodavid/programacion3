import { checkAuth } from '../../../utils/authGuards.ts';
// Asegúrate de que las rutas a los JSON sean correctas desde donde está este archivo
import productos from '../../../data/products.json';
import categorias from '../../../data/categorias.json';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupLogout();
    renderProductos();
});

function renderProductos() {
    const tbody = document.getElementById('productos-body') as HTMLTableSectionElement;
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpiar tabla

    productos.forEach((p: any) => {
        // Buscar nombre de categoría
        const categoria = categorias.find((c: any) => c.id === p.categoriaId);
        const nombreCat = categoria ? categoria.nombre : 'N/A';
        
        // Determinar clase de estilo para el estado
        const estadoClass = p.estado === 'disponible' ? 'status-disponible' : 'status-no-disponible';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${p.id}</td>
            <td><img src="${p.imagen}" alt="${p.nombre}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
            <td>${p.nombre}</td>
            <td>${p.descripcion}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>${nombreCat}</td>
            <td>${p.stock}</td>
            <td><span class="status-badge ${estadoClass}">${p.estado}</span></td>
            <td>
                <button class="btn-action" style="background:#ffc107;">Editar</button>
                <button class="btn-action" style="background:#dc3545; color:white;">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

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