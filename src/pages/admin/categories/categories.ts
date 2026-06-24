import categorias from '../../../data/categorias.json';
import { checkAuth } from '../../../utils/authGuards.ts';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderTable();
});

function renderTable() {
    const tbody = document.getElementById('categorias-body') as HTMLTableSectionElement;
    tbody.innerHTML = ''; // Limpiar

    categorias.forEach(cat => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${cat.id}</td>
            <td><img src="${cat.imagen}" alt="${cat.nombre}" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td>${cat.nombre}</td>
            <td>${cat.descripcion}</td>
            <td>
                <button class="btn-action btn-edit" onclick="alert('Editar ID: ${cat.id}')">Editar</button>
                <button class="btn-action btn-delete" onclick="eliminarCategoria(${cat.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Función global para eliminar (simple ejemplo)
(window as any).eliminarCategoria = (id: number) => {
    if (confirm(`¿Estás seguro de eliminar la categoría ${id}?`)) {
        // En un entorno real, aquí harías un fetch DELETE a tu API
        alert(`Categoría ${id} eliminada de la vista (simulado)`);
        // Actualizar tabla renderizando de nuevo o removiendo el nodo
    }
};