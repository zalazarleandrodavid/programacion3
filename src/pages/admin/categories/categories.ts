import { checkAuth } from '../../../utils/authGuards.ts';

// Estado máster en memoria del cliente
let listaCategorias: any[] = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificación de seguridad
    checkAuth();
    
    // 2. Cargar datos desde public/data/ y renderizar la tabla
    await cargarCategorias();
});

// =====================
// CONSUMO DE DATOS (FETCH)
// =====================
async function cargarCategorias() {
    try {
        // REQUISITO: Fetch a /data/categorias.json para cargar la tabla
        const response = await fetch('/data/categorias.json');
        if (!response.ok) throw new Error("No se pudo obtener el listado de categorías");
        
        listaCategorias = await response.json();
        renderTable();
    } catch (error) {
        console.error("Error al inicializar las categorías:", error);
        const tbody = document.getElementById('categorias-body');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align:center; color: #ff4757; font-weight: bold; padding: 20px;">
                        ⚠️ Error al cargar las categorías desde el servidor.
                    </td>
                </tr>
            `;
        }
    }
}

// =====================
// RENDERIZADO DEL DOM
// =====================
function renderTable() {
    const tbody = document.getElementById('categorias-body') as HTMLTableSectionElement;
    if (!tbody) return;
    
    tbody.innerHTML = ''; // Limpiar contenido previo de la tabla

    // REQUISITO: Estructura de tabla solicitada (ID, imagen, nombre, descripción)
    listaCategorias.forEach(cat => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${cat.id}</td>
            <td>
                <img src="${cat.imagen}" alt="${cat.nombre}" onerror="this.src='https://via.placeholder.com/50'" 
                     style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
            </td>
            <td><strong>${cat.nombre}</strong></td>
            <td>${cat.descripcion || 'Sin descripción'}</td>
            <td>
                <button class="btn-action btn-edit" data-id="${cat.id}">Editar</button>
                <button class="btn-action btn-delete" data-id="${cat.id}">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Vincular los escuchadores de eventos una vez inyectadas las filas
    setupTableEvents();
}

// =====================
// MANEJO DE EVENTOS (EVENT LISTENERS)
// =====================
function setupTableEvents() {
    // Escuchas dinámicas para la acción de Editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            alert(`Editar ID: ${id}`);
        });
    });

    // Escuchas dinámicas para la acción de Eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number((e.currentTarget as HTMLButtonElement).dataset.id);
            eliminarCategoria(id);
        });
    });
}

// Lógica de eliminación reactiva local
function eliminarCategoria(id: number) {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría con ID ${id}?`)) {
        // Filtramos el estado local simulando el borrado inmediato en la vista
        listaCategorias = listaCategorias.filter(cat => cat.id !== id);
        
        alert(`Categoría ${id} eliminada de la vista (simulado)`);
        
        // Volvemos a dibujar para reflejar el cambio en pantalla
        renderTable(); 
    }
}